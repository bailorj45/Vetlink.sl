'use client';

import React, { useEffect, useState } from 'react';
import { StatsCard } from '@/components/cards/StatsCard';
import { Card } from '@/components/ui/Card';
import { Users, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    farmers: 0,
    vets: 0,
    pendingVerifications: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Load user counts
      const { count: totalUsers } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true });

      const { count: farmers } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'farmer');

      const { count: vets } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'vet');

      const { count: pendingVets } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'vet')
        .eq('verified', false);

      setStats({
        totalUsers: totalUsers || 0,
        farmers: farmers || 0,
        vets: vets || 0,
        pendingVerifications: pendingVets || 0,
      });
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-primary mb-2">Admin Dashboard</h1>
        <p className="text-gray-600">Platform overview and management</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Total Users"
          value={stats.totalUsers}
          icon={Users}
        />
        <StatsCard
          title="Farmers"
          value={stats.farmers}
          icon={Users}
        />
        <StatsCard
          title="Veterinarians"
          value={stats.vets}
          icon={Users}
        />
        <StatsCard
          title="Pending Verifications"
          value={stats.pendingVerifications}
          icon={Clock}
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="text-center p-6 hover:shadow-medium transition-shadow cursor-pointer">
          <CheckCircle className="w-12 h-12 text-primary mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">Verify Veterinarians</h3>
          <p className="text-gray-600 mb-4">
            Review and verify veterinarian credentials
          </p>
          <a href="/admin/verifications" className="text-primary hover:underline">
            Go to Verifications →
          </a>
        </Card>

        <Card className="text-center p-6 hover:shadow-medium transition-shadow cursor-pointer">
          <Users className="w-12 h-12 text-primary mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">Manage Users</h3>
          <p className="text-gray-600 mb-4">
            View and manage all platform users
          </p>
          <a href="/admin/users" className="text-primary hover:underline">
            View Users →
          </a>
        </Card>

        <Card className="text-center p-6 hover:shadow-medium transition-shadow cursor-pointer">
          <AlertCircle className="w-12 h-12 text-primary mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">Disease Alerts</h3>
          <p className="text-gray-600 mb-4">
            Create and manage disease alerts
          </p>
          <a href="/admin/alerts" className="text-primary hover:underline">
            Manage Alerts →
          </a>
        </Card>
      </div>
    </div>
  );
}

