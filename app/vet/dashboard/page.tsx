'use client';

import React, { useEffect, useState, useRef } from 'react';
import { StatsCard } from '@/components/cards/StatsCard';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Calendar, Users, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import { Appointment } from '@/lib/types';
import { listenToCases, listenToAppointments, type Case } from '@/lib/utils/db';
import type { RealtimeChannel } from '@supabase/supabase-js';

export default function VetDashboard() {
  const [stats, setStats] = useState({
    totalAppointments: 0,
    pendingRequests: 0,
    todayAppointments: 0,
    completedAppointments: 0,
    assignedCases: 0,
  });
  const [recentRequests, setRecentRequests] = useState<Appointment[]>([]);
  const [recentCases, setRecentCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const channelsRef = useRef<RealtimeChannel[]>([]);
  const userIdRef = useRef<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  useEffect(() => {
    // Set up realtime listeners after initial load
    if (userIdRef.current) {
      setupRealtimeListeners();
    }

    return () => {
      // Cleanup channels
      channelsRef.current.forEach((channel) => channel.unsubscribe());
    };
  }, [userIdRef.current]);

  const loadDashboardData = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      userIdRef.current = user.id;

      // Load appointments
      const { data: appointments } = await supabase
        .from('appointments')
        .select('*, farmer:users!appointments_farmer_id_fkey(*)')
        .eq('vet_id', user.id)
        .order('date', { ascending: false });

      // Load assigned cases
      const { data: cases } = await supabase
        .from('cases')
        .select('*')
        .eq('assigned_vet_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      const pending = appointments?.filter((apt) => apt.status === 'pending') || [];
      const today = new Date().toISOString().split('T')[0];
      const todayApts = appointments?.filter((apt) => apt.date === today) || [];
      const completed = appointments?.filter((apt) => apt.status === 'completed') || [];

      setStats({
        totalAppointments: appointments?.length || 0,
        pendingRequests: pending.length,
        todayAppointments: todayApts.length,
        completedAppointments: completed.length,
        assignedCases: cases?.length || 0,
      });

      setRecentRequests(pending.slice(0, 5));
      setRecentCases((cases as any) || []);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeListeners = () => {
    if (!userIdRef.current) return;

    // Listen to case assignments
    const casesChannel = listenToCases(userIdRef.current, 'vet', (caseData) => {
      setRecentCases((prev) => {
        const existing = prev.find((c) => c.id === caseData.id);
        if (existing) {
          return prev.map((c) => (c.id === caseData.id ? caseData : c));
        }
        return [caseData, ...prev].slice(0, 5);
      });

      // Update stats
      setStats((prev) => ({
        ...prev,
        assignedCases: prev.assignedCases + 1,
      }));
    });

    channelsRef.current.push(casesChannel);

    // Listen to appointment requests
    const appointmentsChannel = listenToAppointments(userIdRef.current, 'vet', (appointment) => {
      setRecentRequests((prev) => {
        const existing = prev.find((a) => a.id === appointment.id);
        if (existing) {
          return prev.map((a) => (a.id === appointment.id ? appointment : a));
        }
        if (appointment.status === 'pending') {
          return [appointment, ...prev].slice(0, 5);
        }
        return prev.filter((a) => a.id !== appointment.id);
      });

      // Update stats
      setStats((prev) => ({
        ...prev,
        totalAppointments: prev.totalAppointments + (appointment.status === 'pending' ? 1 : 0),
        pendingRequests: appointment.status === 'pending' 
          ? prev.pendingRequests + 1 
          : prev.pendingRequests - (appointment.status !== 'pending' ? 1 : 0),
      }));
    });

    channelsRef.current.push(appointmentsChannel);
  };

  const handleAppointmentAction = async (appointmentId: string, action: 'accept' | 'decline') => {
    try {
      const status = action === 'accept' ? 'confirmed' : 'cancelled';
      const { error } = await supabase
        .from('appointments')
        .update({ status })
        .eq('id', appointmentId);

      if (error) throw error;
      loadDashboardData();
    } catch (error: any) {
      alert('Error: ' + error.message);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-primary mb-2">Veterinarian Dashboard</h1>
        <p className="text-gray-600">Manage your appointments and requests</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Total Appointments"
          value={stats.totalAppointments}
          icon={Calendar}
        />
        <StatsCard
          title="Pending Requests"
          value={stats.pendingRequests}
          icon={Clock}
        />
        <StatsCard
          title="Today's Appointments"
          value={stats.todayAppointments}
          icon={Calendar}
        />
        <StatsCard
          title="Completed"
          value={stats.completedAppointments}
          icon={CheckCircle}
        />
      </div>

      {/* Assigned Cases */}
      {recentCases.length > 0 && (
        <Card className="mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Assigned Cases</h2>
            <Link href="/vet/cases">
              <Button variant="ghost" size="sm">
                View All
              </Button>
            </Link>
          </div>
          <div className="space-y-4">
            {recentCases.map((caseItem) => (
              <div
                key={caseItem.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-12 hover:shadow-soft transition-shadow"
              >
                <div className="flex-1">
                  <p className="font-semibold">
                    {caseItem.diagnosis || 'Pending Diagnosis'}
                  </p>
                  <p className="text-sm text-gray-600 line-clamp-1">
                    {caseItem.symptom_description}
                  </p>
                  {caseItem.emergency_flag && (
                    <Badge variant="error" className="mt-1 text-xs">
                      Emergency
                    </Badge>
                  )}
                </div>
                <Link href={`/vet/cases/${caseItem.id}`}>
                  <Button variant="outline" size="sm">
                    View
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Pending Requests */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Pending Appointment Requests</h2>
          <Link href="/vet/requests">
            <Button variant="ghost" size="sm">
              View All
            </Button>
          </Link>
        </div>
        {recentRequests.length === 0 ? (
          <p className="text-gray-600 text-center py-8">No pending requests</p>
        ) : (
          <div className="space-y-4">
            {recentRequests.map((apt) => (
              <div
                key={apt.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-12"
              >
                <div>
                  <p className="font-semibold">
                    {(apt as any).farmer?.full_name || 'Farmer'}
                  </p>
                  <p className="text-sm text-gray-600">{apt.reason}</p>
                  <p className="text-sm text-gray-600">
                    {new Date(apt.date).toLocaleDateString()} at {apt.time}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleAppointmentAction(apt.id, 'accept')}
                  >
                    Accept
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleAppointmentAction(apt.id, 'decline')}
                  >
                    Decline
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

