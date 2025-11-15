'use client';

import React, { useState, useEffect } from 'react';
import { AppointmentCard } from '@/components/cards/AppointmentCard';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { supabase } from '@/lib/supabase/client';
import { Appointment } from '@/lib/types';

export default function VetRequestsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'completed' | 'cancelled'>('pending');

  useEffect(() => {
    loadAppointments();
  }, [filter]);

  const loadAppointments = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      let query = supabase
        .from('appointments')
        .select('*, farmer:users!appointments_farmer_id_fkey(*)')
        .eq('vet_id', user.id)
        .order('date', { ascending: false });

      if (filter !== 'all') {
        query = query.eq('status', filter);
      }

      const { data, error } = await query;

      if (error) throw error;
      setAppointments((data as any) || []);
    } catch (error) {
      console.error('Error loading appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (appointment: Appointment, action: 'accept' | 'decline' | 'complete') => {
    try {
      let status = 'confirmed';
      if (action === 'decline') status = 'cancelled';
      if (action === 'complete') status = 'completed';

      const { error } = await supabase
        .from('appointments')
        .update({ status })
        .eq('id', appointment.id);

      if (error) throw error;
      loadAppointments();
    } catch (error: any) {
      alert('Error: ' + error.message);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  const filteredAppointments = filter === 'all' 
    ? appointments 
    : appointments.filter(apt => apt.status === filter);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-primary mb-2">Appointment Requests</h1>
        <p className="text-gray-600">Manage appointment requests from farmers</p>
      </div>

      <Card className="mb-6">
        <div className="flex gap-2 flex-wrap">
          {(['all', 'pending', 'confirmed', 'completed', 'cancelled'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-8 font-medium transition-colors ${
                filter === status
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </Card>

      {filteredAppointments.length === 0 ? (
        <Card className="text-center py-12">
          <p className="text-gray-600">No appointments found</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredAppointments.map((appointment) => (
            <AppointmentCard
              key={appointment.id}
              appointment={appointment}
              userRole="vet"
              onAction={(action) => handleAction(appointment, action as any)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

