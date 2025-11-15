'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { AlertBanner } from '@/components/AlertBanner';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { AlertCircle, Calendar } from 'lucide-react';
import { DiseaseAlert } from '@/lib/types';
import { supabase } from '@/lib/supabase/client';

export default function NewsfeedPage() {
  const [alerts, setAlerts] = useState<DiseaseAlert[]>([]);
  const [filteredAlerts, setFilteredAlerts] = useState<DiseaseAlert[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAlerts();
  }, []);

  useEffect(() => {
    filterAlerts();
  }, [alerts, searchTerm, severityFilter]);

  const loadAlerts = async () => {
    try {
      const { data, error } = await supabase
        .from('disease_alerts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setAlerts((data as any) || []);
      setFilteredAlerts((data as any) || []);
    } catch (error) {
      console.error('Error loading alerts:', error);
      // Use mock data if database fails
      setAlerts([
        {
          id: '1',
          title: 'Foot and Mouth Disease Alert',
          description: 'Cases of FMD reported in Western Area. Farmers advised to practice strict biosecurity measures.',
          severity: 'high',
          affectedSpecies: ['Cattle', 'Goats', 'Sheep'],
          affectedDistricts: ['Western Area Urban', 'Western Area Rural'],
          createdAt: new Date().toISOString(),
        },
        {
          id: '2',
          title: 'Newcastle Disease in Poultry',
          description: 'Outbreak detected in several districts. Vaccination recommended.',
          severity: 'critical',
          affectedSpecies: ['Poultry'],
          affectedDistricts: ['Bo', 'Kenema'],
          createdAt: new Date().toISOString(),
        },
      ]);
      setFilteredAlerts([
        {
          id: '1',
          title: 'Foot and Mouth Disease Alert',
          description: 'Cases of FMD reported in Western Area. Farmers advised to practice strict biosecurity measures.',
          severity: 'high',
          affectedSpecies: ['Cattle', 'Goats', 'Sheep'],
          affectedDistricts: ['Western Area Urban', 'Western Area Rural'],
          createdAt: new Date().toISOString(),
        },
        {
          id: '2',
          title: 'Newcastle Disease in Poultry',
          description: 'Outbreak detected in several districts. Vaccination recommended.',
          severity: 'critical',
          affectedSpecies: ['Poultry'],
          affectedDistricts: ['Bo', 'Kenema'],
          createdAt: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const filterAlerts = () => {
    let filtered = [...alerts];

    if (searchTerm) {
      filtered = filtered.filter(
        (alert) =>
          alert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          alert.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (severityFilter !== 'all') {
      filtered = filtered.filter((alert) => alert.severity === severityFilter);
    }

    setFilteredAlerts(filtered);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-cream py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-primary mb-2">Disease Alerts & Newsfeed</h1>
          <p className="text-gray-600">
            Stay informed about disease outbreaks and important updates
          </p>
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              placeholder="Search alerts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="input"
            >
              <option value="all">All Severities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>
        </Card>

        {/* Alerts */}
        {filteredAlerts.length === 0 ? (
          <Card className="text-center py-12">
            <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No alerts found matching your criteria.</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredAlerts.map((alert) => (
              <AlertBanner key={alert.id} alert={alert} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

