'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { breedingRecordSchema, type BreedingRecordInput } from '@/lib/validators/livestock';
import { supabase } from '@/lib/supabase/client';
import { BreedingRecord, Livestock } from '@/lib/types';
import { Plus, Calendar, Baby } from 'lucide-react';
import { format, addDays } from 'date-fns';

export default function BreedingPage() {
  const [records, setRecords] = useState<BreedingRecord[]>([]);
  const [livestock, setLivestock] = useState<Livestock[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<BreedingRecordInput>({
    resolver: zodResolver(breedingRecordSchema),
  });

  const breedingDate = watch('breedingDate');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      // Load livestock
      const { data: livestockData } = await supabase
        .from('livestock')
        .select('*')
        .eq('farmer_id', user.id)
        .eq('gender', 'female');

      setLivestock((livestockData as any) || []);

      // Load breeding records
      const { data: breedingData } = await supabase
        .from('breeding_records')
        .select('*, livestock(*)')
        .eq('farmer_id', user.id)
        .order('breeding_date', { ascending: false });

      setRecords((breedingData as any) || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: BreedingRecordInput) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        alert('Please login');
        return;
      }

      // Calculate expected delivery date (approximately 280 days for cattle, 150 for goats/sheep)
      const selectedLivestock = livestock.find((l) => l.id === data.livestockId);
      let gestationDays = 280; // Default for cattle
      if (selectedLivestock?.species === 'goat' || selectedLivestock?.species === 'sheep') {
        gestationDays = 150;
      }

      const expectedDelivery = breedingDate
        ? format(addDays(new Date(breedingDate), gestationDays), 'yyyy-MM-dd')
        : undefined;

      const { error } = await supabase.from('breeding_records').insert({
        ...data,
        expected_delivery_date: expectedDelivery,
        farmer_id: user.id,
      });

      if (error) throw error;

      setShowModal(false);
      reset();
      loadData();
    } catch (error: any) {
      alert('Error saving record: ' + error.message);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-primary mb-2">Breeding Tracker</h1>
          <p className="text-gray-600">Track breeding cycles and expected deliveries</p>
        </div>
        <Button variant="primary" onClick={() => setShowModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Breeding Record
        </Button>
      </div>

      {records.length === 0 ? (
        <Card className="text-center py-12">
          <Baby className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">No breeding records yet</p>
          <Button variant="primary" onClick={() => setShowModal(true)}>
            Add Your First Record
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {records.map((record) => {
            const livestockItem = (record as any).livestock;
            return (
              <Card key={record.id}>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold">
                      {livestockItem?.name || 'Unknown'}
                    </h3>
                    <p className="text-secondary text-sm">{livestockItem?.species}</p>
                  </div>
                  {record.expectedDeliveryDate && (
                    <div className="text-right">
                      <p className="text-xs text-gray-600">Expected</p>
                      <p className="font-bold text-primary">
                        {format(new Date(record.expectedDeliveryDate), 'MMM dd, yyyy')}
                      </p>
                    </div>
                  )}
                </div>

                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>
                      Bred: {format(new Date(record.breedingDate), 'MMM dd, yyyy')}
                    </span>
                  </div>
                  {record.sireId && (
                    <p>Sire ID: {record.sireId}</p>
                  )}
                  {record.notes && (
                    <p className="text-gray-700">{record.notes}</p>
                  )}
                </div>

                {record.deliveryDate ? (
                  <div className="bg-green-50 p-3 rounded-8">
                    <p className="text-sm font-semibold text-green-800">
                      Delivered: {format(new Date(record.deliveryDate), 'MMM dd, yyyy')}
                    </p>
                  </div>
                ) : (
                  <div className="bg-yellow-50 p-3 rounded-8">
                    <p className="text-sm font-semibold text-yellow-800">
                      Awaiting delivery
                    </p>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          reset();
        }}
        title="Add Breeding Record"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Select
            label="Livestock (Female)"
            options={livestock.map((l) => ({
              value: l.id,
              label: `${l.name} (${l.species})`,
            }))}
            {...register('livestockId')}
            error={errors.livestockId?.message}
          />

          <Input
            label="Breeding Date"
            type="date"
            {...register('breedingDate')}
            error={errors.breedingDate?.message}
          />

          {breedingDate && (
            <div className="bg-primary/10 p-4 rounded-8">
              <p className="text-sm text-gray-700">
                <strong>Expected Delivery:</strong>{' '}
                {format(
                  addDays(new Date(breedingDate), 280),
                  'MMMM dd, yyyy'
                )}{' '}
                (approximately 280 days for cattle, 150 days for goats/sheep)
              </p>
            </div>
          )}

          <Input
            label="Sire ID (optional)"
            placeholder="ID of the male"
            {...register('sireId')}
            error={errors.sireId?.message}
          />

          <Textarea
            label="Notes (optional)"
            placeholder="Additional information..."
            {...register('notes')}
            error={errors.notes?.message}
          />

          <div className="flex gap-4">
            <Button type="submit" variant="primary" className="flex-1">
              Add Record
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowModal(false);
                reset();
              }}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

