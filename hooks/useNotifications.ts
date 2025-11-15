/**
 * useNotifications Hook
 * Manages realtime notifications across the app
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase/client';
import type { RealtimeChannel } from '@supabase/supabase-js';

export interface Notification {
  id: string;
  type: 'message' | 'case' | 'appointment' | 'diagnosis' | 'emergency';
  title: string;
  message: string;
  case_id?: string;
  appointment_id?: string;
  read: boolean;
  created_at: string;
}

export interface UseNotificationsReturn {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  clearNotifications: () => void;
}

export function useNotifications(userId: string | null): UseNotificationsReturn {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const channelsRef = useRef<RealtimeChannel[]>([]);

  useEffect(() => {
    if (!userId) return;

    // Load existing notifications
    loadNotifications();

    // Set up realtime listeners
    setupRealtimeListeners();

    return () => {
      // Cleanup channels
      channelsRef.current.forEach((channel) => channel.unsubscribe());
    };
  }, [userId]);

  const loadNotifications = async () => {
    if (!userId) return;

    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setNotifications((data as any) || []);
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const setupRealtimeListeners = () => {
    if (!userId) return;

    // Listen to new messages
    const messagesChannel = supabase
      .channel(`notifications:messages:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `case_id=in.(${getUserCaseIds()})`,
        },
        async (payload) => {
          const message = payload.new as any;
          if (message.sender_id !== userId) {
            await createNotification({
              type: 'message',
              title: 'New Message',
              message: `You have a new message in case ${message.case_id}`,
              case_id: message.case_id,
            });
          }
        }
      )
      .subscribe();

    channelsRef.current.push(messagesChannel);

    // Listen to case updates
    const casesChannel = supabase
      .channel(`notifications:cases:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'cases',
          filter: `farmer_id=eq.${userId}`,
        },
        async (payload) => {
          const caseData = payload.new as any;
          if (caseData.status === 'diagnosed') {
            await createNotification({
              type: 'diagnosis',
              title: 'Diagnosis Ready',
              message: `Your case has been diagnosed: ${caseData.diagnosis}`,
              case_id: caseData.id,
            });
          } else if (caseData.status === 'assigned') {
            await createNotification({
              type: 'case',
              title: 'Vet Assigned',
              message: `A veterinarian has been assigned to your case`,
              case_id: caseData.id,
            });
          }
        }
      )
      .subscribe();

    channelsRef.current.push(casesChannel);

    // Listen to appointments
    const appointmentsChannel = supabase
      .channel(`notifications:appointments:${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'appointments',
          filter: `farmer_id=eq.${userId}`,
        },
        async (payload) => {
          const appointment = payload.new as any;
          if (appointment.status === 'confirmed') {
            await createNotification({
              type: 'appointment',
              title: 'Appointment Confirmed',
              message: `Your appointment has been confirmed`,
              appointment_id: appointment.id,
            });
          }
        }
      )
      .subscribe();

    channelsRef.current.push(appointmentsChannel);
  };

  const getUserCaseIds = (): string => {
    // This would need to fetch user's case IDs
    // For now, return empty string
    return '';
  };

  const createNotification = async (data: {
    type: Notification['type'];
    title: string;
    message: string;
    case_id?: string;
    appointment_id?: string;
  }) => {
    if (!userId) return;

    try {
      const { data: notification, error } = await supabase
        .from('notifications')
        .insert({
          user_id: userId,
          type: data.type,
          title: data.title,
          message: data.message,
          case_id: data.case_id,
          appointment_id: data.appointment_id,
          read: false,
        })
        .select()
        .single();

      if (error) throw error;

      setNotifications((prev) => [notification, ...prev]);
    } catch (error) {
      console.error('Error creating notification:', error);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', id);

      if (error) throw error;

      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    if (!userId) return;

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', userId)
        .eq('read', false);

      if (error) throw error;

      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearNotifications,
  };
}

