'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { supabase } from '@/lib/supabase/client';
import { Settings } from 'lucide-react';

export default function SettingsPage() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    district: '',
    address: '',
    farmSize: '',
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (data) {
        setFormData({
          fullName: data.full_name || '',
          phone: data.phone || '',
          district: data.district || '',
          address: data.address || '',
          farmSize: data.farm_size || '',
        });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        alert('Please login');
        return;
      }

      const { error } = await supabase
        .from('users')
        .update({
          full_name: formData.fullName,
          phone: formData.phone,
          district: formData.district,
          address: formData.address,
          farm_size: formData.farmSize,
        })
        .eq('id', user.id);

      if (error) throw error;
      alert('Profile updated successfully!');
    } catch (error: any) {
      alert('Error updating profile: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-primary mb-2">Settings</h1>
        <p className="text-gray-600">Manage your account settings and preferences</p>
      </div>

      <Card>
        <div className="flex items-center gap-2 mb-6">
          <Settings className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-bold">Profile Settings</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Full Name"
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            required
          />

          <Input
            label="Phone Number"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            required
          />

          <Select
            label="District"
            options={[
              { value: 'Western Area Urban', label: 'Western Area Urban' },
              { value: 'Western Area Rural', label: 'Western Area Rural' },
              { value: 'Bo', label: 'Bo' },
              { value: 'Bombali', label: 'Bombali' },
              { value: 'Bonthe', label: 'Bonthe' },
              { value: 'Kailahun', label: 'Kailahun' },
              { value: 'Kambia', label: 'Kambia' },
              { value: 'Kenema', label: 'Kenema' },
              { value: 'Koinadugu', label: 'Koinadugu' },
              { value: 'Kono', label: 'Kono' },
              { value: 'Moyamba', label: 'Moyamba' },
              { value: 'Port Loko', label: 'Port Loko' },
              { value: 'Pujehun', label: 'Pujehun' },
              { value: 'Tonkolili', label: 'Tonkolili' },
            ]}
            value={formData.district}
            onChange={(e) => setFormData({ ...formData, district: e.target.value })}
          />

          <Input
            label="Address"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            required
          />

          <Select
            label="Farm Size"
            options={[
              { value: 'Small (1-10 animals)', label: 'Small (1-10 animals)' },
              { value: 'Medium (11-50 animals)', label: 'Medium (11-50 animals)' },
              { value: 'Large (51-200 animals)', label: 'Large (51-200 animals)' },
              { value: 'Commercial (200+ animals)', label: 'Commercial (200+ animals)' },
            ]}
            value={formData.farmSize}
            onChange={(e) => setFormData({ ...formData, farmSize: e.target.value })}
          />

          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </form>
      </Card>
    </div>
  );
}

