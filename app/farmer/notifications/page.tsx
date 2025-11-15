'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Bell, CheckCircle, AlertCircle, Calendar } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';

interface Notification {
  id: string;
  type: 'appointment' | 'alert' | 'system';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      // In a real app, this would fetch from a notifications table
      // For now, we'll use mock data
      const mockNotifications: Notification[] = [
        {
          id: '1',
          type: 'appointment',
          title: 'Appointment Confirmed',
          message: 'Your appointment with Dr. Smith on Dec 15 has been confirmed',
          read: false,
          createdAt: new Date().toISOString(),
        },
        {
          id: '2',
          type: 'alert',
          title: 'Disease Alert',
          message: 'New disease alert in your area: Foot and Mouth Disease',
          read: false,
          createdAt: new Date().toISOString(),
        },
      ];
      setNotifications(mockNotifications);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-primary mb-2">Notifications</h1>
          <p className="text-gray-600">
            {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}` : 'All caught up!'}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="text-primary hover:underline text-sm font-medium"
          >
            Mark all as read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <Card className="text-center py-12">
          <Bell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No notifications yet</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {notifications.map((notification) => {
            const Icon =
              notification.type === 'appointment'
                ? Calendar
                : notification.type === 'alert'
                ? AlertCircle
                : Bell;

            return (
              <Card
                key={notification.id}
                className={`cursor-pointer hover:shadow-medium transition-shadow ${
                  !notification.read ? 'border-l-4 border-primary' : ''
                }`}
                onClick={() => markAsRead(notification.id)}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`p-3 rounded-12 ${
                      notification.type === 'appointment'
                        ? 'bg-blue-100'
                        : notification.type === 'alert'
                        ? 'bg-red-100'
                        : 'bg-gray-100'
                    }`}
                  >
                    <Icon
                      className={`w-5 h-5 ${
                        notification.type === 'appointment'
                          ? 'text-blue-600'
                          : notification.type === 'alert'
                          ? 'text-red-600'
                          : 'text-gray-600'
                      }`}
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-1">
                      <h3 className="font-bold">{notification.title}</h3>
                      {!notification.read && (
                        <Badge variant="info" className="text-xs">
                          New
                        </Badge>
                      )}
                    </div>
                    <p className="text-gray-600 text-sm mb-2">{notification.message}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(notification.createdAt).toLocaleString()}
                    </p>
                  </div>
                  {!notification.read && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        markAsRead(notification.id);
                      }}
                      className="p-2 hover:bg-gray-100 rounded-8"
                    >
                      <CheckCircle className="w-5 h-5 text-gray-400" />
                    </button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

