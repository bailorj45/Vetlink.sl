'use client';

import React, { useEffect, useState, useRef } from 'react';
import { StatsCard } from '@/components/cards/StatsCard';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Heart, Calendar, AlertCircle, BookOpen } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import { Appointment, Livestock } from '@/lib/types';
import { listenToCases, listenToAppointments, type Case } from '@/lib/utils/db';
import type { RealtimeChannel } from '@supabase/supabase-js';

export default function FarmerDashboard() {
  const [stats, setStats] = useState({
    livestock: 0,
    appointments: 0,
    upcomingAppointments: 0,
    alerts: 0,
    activeCases: 0,
  });
  const [recentAppointments, setRecentAppointments] = useState<Appointment[]>([]);
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

      // Load livestock count
      const { count: livestockCount } = await supabase
        .from('livestock')
        .select('*', { count: 'exact', head: true })
        .eq('farmer_id', user.id);

      // Load appointments
      const { data: appointments } = await supabase
        .from('appointments')
        .select('*')
        .eq('farmer_id', user.id)
        .order('date', { ascending: false })
        .limit(5);

      // Load cases
      const { data: cases } = await supabase
        .from('cases')
        .select('*')
        .eq('farmer_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      const upcoming = appointments?.filter(
        (apt) => apt.status !== 'completed' && apt.status !== 'cancelled'
      ) || [];

      const activeCases = cases?.filter(
        (c) => c.status !== 'resolved'
      ) || [];

      setStats({
        livestock: livestockCount || 0,
        appointments: appointments?.length || 0,
        upcomingAppointments: upcoming.length,
        alerts: 0, // TODO: Load from alerts
        activeCases: activeCases.length,
      });

      setRecentAppointments(appointments || []);
      setRecentCases((cases as any) || []);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeListeners = () => {
    if (!userIdRef.current) return;

    // Listen to case updates
    const casesChannel = listenToCases(userIdRef.current, 'farmer', (caseData) => {
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
        activeCases: prev.activeCases + (caseData.status !== 'resolved' ? 1 : 0),
      }));
    });

    channelsRef.current.push(casesChannel);

    // Listen to appointment updates
    const appointmentsChannel = listenToAppointments(userIdRef.current, 'farmer', (appointment) => {
      setRecentAppointments((prev) => {
        const existing = prev.find((a) => a.id === appointment.id);
        if (existing) {
          return prev.map((a) => (a.id === appointment.id ? appointment : a));
        }
        return [appointment, ...prev].slice(0, 5);
      });

      // Update stats
      setStats((prev) => ({
        ...prev,
        appointments: prev.appointments + 1,
        upcomingAppointments: appointment.status !== 'completed' && appointment.status !== 'cancelled' 
          ? prev.upcomingAppointments + 1 
          : prev.upcomingAppointments,
      }));
    });

    channelsRef.current.push(appointmentsChannel);
  };

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-primary mb-2">Farmer Dashboard</h1>
        <p className="text-gray-600">Welcome back! Here's an overview of your farm.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Total Livestock"
          value={stats.livestock}
          icon={Heart}
        />
        <StatsCard
          title="Appointments"
          value={stats.appointments}
          icon={Calendar}
        />
        <StatsCard
          title="Upcoming"
          value={stats.upcomingAppointments}
          icon={Calendar}
        />
        <StatsCard
          title="Alerts"
          value={stats.alerts}
          icon={AlertCircle}
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Link href="/farmer/livestock">
          <Card className="text-center p-6 hover:shadow-medium transition-shadow cursor-pointer">
            <Heart className="w-8 h-8 text-primary mx-auto mb-2" />
            <h3 className="font-bold mb-1">Manage Livestock</h3>
            <p className="text-sm text-gray-600">View and add animals</p>
          </Card>
        </Link>
        <Link href="/vet-directory">
          <Card className="text-center p-6 hover:shadow-medium transition-shadow cursor-pointer">
            <Calendar className="w-8 h-8 text-primary mx-auto mb-2" />
            <h3 className="font-bold mb-1">Book Appointment</h3>
            <p className="text-sm text-gray-600">Find a veterinarian</p>
          </Card>
        </Link>
        <Link href="/farmer/ai-symptom-checker">
          <Card className="text-center p-6 hover:shadow-medium transition-shadow cursor-pointer">
            <AlertCircle className="w-8 h-8 text-primary mx-auto mb-2" />
            <h3 className="font-bold mb-1">Symptom Checker</h3>
            <p className="text-sm text-gray-600">AI health guidance</p>
          </Card>
        </Link>
        <Link href="/farmer/feed-calculator">
          <Card className="text-center p-6 hover:shadow-medium transition-shadow cursor-pointer">
            <BookOpen className="w-8 h-8 text-primary mx-auto mb-2" />
            <h3 className="font-bold mb-1">Feed Calculator</h3>
            <p className="text-sm text-gray-600">Calculate feed needs</p>
          </Card>
        </Link>
      </div>

      {/* Recent Cases */}
      {recentCases.length > 0 && (
        <Card className="mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Recent Cases</h2>
            <Link href="/farmer/report-case">
              <Button variant="ghost" size="sm">
                Report New Case
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
                </div>
                <span
                  className={`badge ${
                    caseItem.status === 'resolved'
                      ? 'badge-success'
                      : caseItem.status === 'assigned'
                      ? 'badge-info'
                      : caseItem.status === 'diagnosed'
                      ? 'badge-warning'
                      : 'badge-error'
                  }`}
                >
                  {caseItem.status}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Recent Appointments */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Recent Appointments</h2>
          <Link href="/farmer/appointments">
            <Button variant="ghost" size="sm">
              View All
            </Button>
          </Link>
        </div>
        {recentAppointments.length === 0 ? (
          <p className="text-gray-600 text-center py-8">
            No appointments yet. <Link href="/vet-directory" className="text-primary hover:underline">Book one now</Link>
          </p>
        ) : (
          <div className="space-y-4">
            {recentAppointments.map((apt) => (
              <div
                key={apt.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-12"
              >
                <div>
                  <p className="font-semibold">{apt.reason}</p>
                  <p className="text-sm text-gray-600">
                    {new Date(apt.date).toLocaleDateString()} at {apt.time}
                  </p>
                </div>
                <span
                  className={`badge ${
                    apt.status === 'confirmed'
                      ? 'badge-success'
                      : apt.status === 'pending'
                      ? 'badge-warning'
                      : 'badge-error'
                  }`}
                >
                  {apt.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

