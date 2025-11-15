/**
 * Supabase Realtime Database Utilities
 * Handles all database operations with realtime subscriptions
 */

import { supabase } from '@/lib/supabase/client';
import type { RealtimeChannel } from '@supabase/supabase-js';

export interface Case {
  id: string;
  farmer_id: string;
  livestock_id?: string;
  symptom_description: string;
  image_url?: string;
  diagnosis?: string;
  confidence_score?: number;
  emergency_flag: boolean;
  vet_required: boolean;
  status: 'pending' | 'diagnosed' | 'assigned' | 'resolved';
  assigned_vet_id?: string;
  ai_reasoning?: string;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  case_id: string;
  sender_id: string;
  sender_role: 'farmer' | 'vet';
  content: string;
  message_type: 'text' | 'voice' | 'image';
  audio_url?: string;
  image_url?: string;
  read: boolean;
  created_at: string;
}

export interface Appointment {
  id: string;
  farmer_id: string;
  vet_id: string;
  case_id?: string;
  date: string;
  time: string;
  reason: string;
  urgency: 'low' | 'medium' | 'high' | 'emergency';
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  created_at: string;
}

/**
 * Create a new case
 */
export async function createCase(data: {
  farmer_id: string;
  livestock_id?: string;
  symptom_description: string;
  image_base64?: string;
  emergency_flag?: boolean;
}): Promise<Case> {
  try {
    // Upload image if provided
    let imageUrl: string | undefined;
    if (data.image_base64) {
      const fileName = `case-${Date.now()}.jpg`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('case-images')
        .upload(fileName, dataURItoBlob(data.image_base64), {
          contentType: 'image/jpeg',
        });

      if (!uploadError && uploadData) {
        const { data: urlData } = supabase.storage
          .from('case-images')
          .getPublicUrl(fileName);
        imageUrl = urlData.publicUrl;
      }
    }

    const { data: caseData, error } = await supabase
      .from('cases')
      .insert({
        farmer_id: data.farmer_id,
        livestock_id: data.livestock_id,
        symptom_description: data.symptom_description,
        image_url: imageUrl,
        emergency_flag: data.emergency_flag || false,
        status: 'pending',
      })
      .select()
      .single();

    if (error) throw error;
    return caseData as Case;
  } catch (error: any) {
    console.error('Error creating case:', error);
    throw new Error(error.message || 'Failed to create case');
  }
}

/**
 * Listen to case updates in realtime
 */
export function listenToCaseUpdates(
  caseId: string,
  callback: (caseData: Case) => void
): RealtimeChannel {
  const channel = supabase
    .channel(`case:${caseId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'cases',
        filter: `id=eq.${caseId}`,
      },
      (payload) => {
        callback(payload.new as Case);
      }
    )
    .subscribe();

  return channel;
}

/**
 * Listen to all cases for a farmer or vet
 */
export function listenToCases(
  userId: string,
  role: 'farmer' | 'vet',
  callback: (caseData: Case) => void
): RealtimeChannel {
  const filter = role === 'farmer' ? `farmer_id=eq.${userId}` : `assigned_vet_id=eq.${userId}`;

  const channel = supabase
    .channel(`cases:${userId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'cases',
        filter,
      },
      (payload) => {
        callback(payload.new as Case);
      }
    )
    .subscribe();

  return channel;
}

/**
 * Send a message
 */
export async function sendMessage(data: {
  case_id: string;
  sender_id: string;
  sender_role: 'farmer' | 'vet';
  content: string;
  message_type?: 'text' | 'voice' | 'image';
  audio_url?: string;
  image_url?: string;
}): Promise<Message> {
  try {
    const { data: messageData, error } = await supabase
      .from('messages')
      .insert({
        case_id: data.case_id,
        sender_id: data.sender_id,
        sender_role: data.sender_role,
        content: data.content,
        message_type: data.message_type || 'text',
        audio_url: data.audio_url,
        image_url: data.image_url,
        read: false,
      })
      .select()
      .single();

    if (error) throw error;
    return messageData as Message;
  } catch (error: any) {
    console.error('Error sending message:', error);
    throw new Error(error.message || 'Failed to send message');
  }
}

/**
 * Listen to messages for a case
 */
export function listenToMessages(
  caseId: string,
  callback: (message: Message) => void
): RealtimeChannel {
  const channel = supabase
    .channel(`messages:${caseId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `case_id=eq.${caseId}`,
      },
      (payload) => {
        callback(payload.new as Message);
      }
    )
    .subscribe();

  return channel;
}

/**
 * Mark messages as read
 */
export async function markMessagesAsRead(
  caseId: string,
  userId: string
): Promise<void> {
  try {
    const { error } = await supabase
      .from('messages')
      .update({ read: true })
      .eq('case_id', caseId)
      .neq('sender_id', userId)
      .eq('read', false);

    if (error) throw error;
  } catch (error: any) {
    console.error('Error marking messages as read:', error);
  }
}

/**
 * Book an appointment
 */
export async function bookAppointment(data: {
  farmer_id: string;
  vet_id: string;
  case_id?: string;
  date: string;
  time: string;
  reason: string;
  urgency: 'low' | 'medium' | 'high' | 'emergency';
}): Promise<Appointment> {
  try {
    const { data: appointmentData, error } = await supabase
      .from('appointments')
      .insert({
        farmer_id: data.farmer_id,
        vet_id: data.vet_id,
        case_id: data.case_id,
        date: data.date,
        time: data.time,
        reason: data.reason,
        urgency: data.urgency,
        status: 'pending',
      })
      .select()
      .single();

    if (error) throw error;
    return appointmentData as Appointment;
  } catch (error: any) {
    console.error('Error booking appointment:', error);
    throw new Error(error.message || 'Failed to book appointment');
  }
}

/**
 * Listen to appointments
 */
export function listenToAppointments(
  userId: string,
  role: 'farmer' | 'vet',
  callback: (appointment: Appointment) => void
): RealtimeChannel {
  const filter = role === 'farmer' ? `farmer_id=eq.${userId}` : `vet_id=eq.${userId}`;

  const channel = supabase
    .channel(`appointments:${userId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'appointments',
        filter,
      },
      (payload) => {
        callback(payload.new as Appointment);
      }
    )
    .subscribe();

  return channel;
}

/**
 * Update case diagnosis
 */
export async function updateCaseDiagnosis(
  caseId: string,
  diagnosis: {
    diagnosis: string;
    confidence_score: number;
    ai_reasoning: string;
    vet_required: boolean;
    emergency_flag: boolean;
  }
): Promise<Case> {
  try {
    const { data, error } = await supabase
      .from('cases')
      .update({
        diagnosis: diagnosis.diagnosis,
        confidence_score: diagnosis.confidence_score,
        ai_reasoning: diagnosis.ai_reasoning,
        vet_required: diagnosis.vet_required,
        emergency_flag: diagnosis.emergency_flag,
        status: 'diagnosed',
        updated_at: new Date().toISOString(),
      })
      .eq('id', caseId)
      .select()
      .single();

    if (error) throw error;
    return data as Case;
  } catch (error: any) {
    console.error('Error updating case diagnosis:', error);
    throw new Error(error.message || 'Failed to update diagnosis');
  }
}

/**
 * Assign vet to case
 */
export async function assignVetToCase(
  caseId: string,
  vetId: string
): Promise<Case> {
  try {
    const { data, error } = await supabase
      .from('cases')
      .update({
        assigned_vet_id: vetId,
        status: 'assigned',
        updated_at: new Date().toISOString(),
      })
      .eq('id', caseId)
      .select()
      .single();

    if (error) throw error;
    return data as Case;
  } catch (error: any) {
    console.error('Error assigning vet:', error);
    throw new Error(error.message || 'Failed to assign vet');
  }
}

/**
 * Helper: Convert data URI to Blob
 */
function dataURItoBlob(dataURI: string): Blob {
  const byteString = atob(dataURI.split(',')[1]);
  const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  return new Blob([ab], { type: mimeString });
}

