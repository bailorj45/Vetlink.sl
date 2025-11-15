'use client';

import React, { useState, useEffect } from 'react';
import { VetCard } from '@/components/cards/VetCard';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Card } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { appointmentSchema, type AppointmentInput } from '@/lib/validators/appointment';
import { supabase } from '@/lib/supabase/client';
import { Veterinarian, Appointment } from '@/lib/types';

const districts = [
  'All Districts',
  'Western Area Urban',
  'Western Area Rural',
  'Bo',
  'Bombali',
  'Bonthe',
  'Kailahun',
  'Kambia',
  'Kenema',
  'Koinadugu',
  'Kono',
  'Moyamba',
  'Port Loko',
  'Pujehun',
  'Tonkolili',
];

const specializations = [
  'All Specializations',
  'Large Animal Medicine',
  'Small Animal Medicine',
  'Poultry Medicine',
  'Mixed Practice',
  'Surgery',
  'Reproductive Health',
  'Preventive Medicine',
];

export default function VetDirectoryPage() {
  const [vets, setVets] = useState<Veterinarian[]>([]);
  const [filteredVets, setFilteredVets] = useState<Veterinarian[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVet, setSelectedVet] = useState<Veterinarian | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [districtFilter, setDistrictFilter] = useState('All Districts');
  const [specializationFilter, setSpecializationFilter] = useState('All Specializations');

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<AppointmentInput>({
    resolver: zodResolver(appointmentSchema),
  });

  useEffect(() => {
    loadVets();
  }, []);

  useEffect(() => {
    filterVets();
  }, [vets, searchTerm, districtFilter, specializationFilter]);

  const loadVets = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('role', 'vet')
        .eq('verified', true);

      if (error) throw error;
      setVets((data as any) || []);
      setFilteredVets((data as any) || []);
    } catch (error) {
      console.error('Error loading vets:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterVets = () => {
    let filtered = [...vets];

    if (searchTerm) {
      filtered = filtered.filter(
        (vet) =>
          vet.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          vet.specialization.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (districtFilter !== 'All Districts') {
      filtered = filtered.filter((vet) => vet.district === districtFilter);
    }

    if (specializationFilter !== 'All Specializations') {
      filtered = filtered.filter((vet) => vet.specialization === specializationFilter);
    }

    setFilteredVets(filtered);
  };

  const handleBook = (vet: Veterinarian) => {
    setSelectedVet(vet);
    setShowBookingModal(true);
    reset({
      vetId: vet.id,
      urgency: 'medium',
    });
  };

  const onSubmitBooking = async (data: AppointmentInput) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        alert('Please login to book an appointment');
        return;
      }

      const { error } = await supabase.from('appointments').insert({
        farmer_id: user.id,
        vet_id: data.vetId,
        date: data.date,
        time: data.time,
        reason: data.reason,
        urgency: data.urgency,
        livestock_id: data.livestockId || null,
        status: 'pending',
      });

      if (error) throw error;

      alert('Appointment requested successfully!');
      setShowBookingModal(false);
      reset();
    } catch (error: any) {
      alert('Failed to book appointment: ' + error.message);
    }
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
          <h1 className="text-4xl font-bold text-primary mb-2">Find a Veterinarian</h1>
          <p className="text-gray-600">Search and connect with certified veterinarians</p>
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              placeholder="Search by name or specialization..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Select
              options={districts.map((d) => ({ value: d, label: d }))}
              value={districtFilter}
              onChange={(e) => setDistrictFilter(e.target.value)}
            />
            <Select
              options={specializations.map((s) => ({ value: s, label: s }))}
              value={specializationFilter}
              onChange={(e) => setSpecializationFilter(e.target.value)}
            />
          </div>
        </Card>

        {/* Results */}
        <div className="mb-4">
          <p className="text-gray-600">
            Found {filteredVets.length} veterinarian{filteredVets.length !== 1 ? 's' : ''}
          </p>
        </div>

        {filteredVets.length === 0 ? (
          <Card className="text-center py-12">
            <p className="text-gray-600">No veterinarians found matching your criteria.</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVets.map((vet) => (
              <VetCard key={vet.id} vet={vet} onBook={() => handleBook(vet)} />
            ))}
          </div>
        )}

        {/* Booking Modal */}
        <Modal
          isOpen={showBookingModal}
          onClose={() => {
            setShowBookingModal(false);
            setSelectedVet(null);
          }}
          title={`Book Appointment with ${selectedVet?.fullName}`}
        >
          <form onSubmit={handleSubmit(onSubmitBooking)} className="space-y-4">
            <input type="hidden" {...register('vetId')} />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Date"
                type="date"
                {...register('date')}
                error={errors.date?.message}
              />
              <Input
                label="Time"
                type="time"
                {...register('time')}
                error={errors.time?.message}
              />
            </div>
            <Select
              label="Urgency"
              options={[
                { value: 'low', label: 'Low' },
                { value: 'medium', label: 'Medium' },
                { value: 'high', label: 'High' },
                { value: 'emergency', label: 'Emergency' },
              ]}
              {...register('urgency')}
              error={errors.urgency?.message}
            />
            <Textarea
              label="Reason for Visit"
              placeholder="Describe the issue or reason for the appointment..."
              {...register('reason')}
              error={errors.reason?.message}
            />
            <div className="flex gap-4">
              <Button type="submit" variant="primary" className="flex-1">
                Book Appointment
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowBookingModal(false);
                  setSelectedVet(null);
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </div>
  );
}

