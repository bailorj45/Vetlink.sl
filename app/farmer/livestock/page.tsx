'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Badge } from '@/components/ui/Badge';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { livestockSchema, type LivestockInput } from '@/lib/validators/livestock';
import { supabase } from '@/lib/supabase/client';
import { Livestock } from '@/lib/types';
import { Heart, Plus, Edit, Trash2 } from 'lucide-react';

const speciesOptions = [
  { value: 'cattle', label: 'Cattle' },
  { value: 'goat', label: 'Goat' },
  { value: 'sheep', label: 'Sheep' },
  { value: 'poultry', label: 'Poultry' },
  { value: 'pig', label: 'Pig' },
  { value: 'other', label: 'Other' },
];

export default function LivestockPage() {
  const [livestock, setLivestock] = useState<Livestock[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingLivestock, setEditingLivestock] = useState<Livestock | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<LivestockInput>({
    resolver: zodResolver(livestockSchema),
  });

  useEffect(() => {
    loadLivestock();
  }, []);

  const loadLivestock = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data, error } = await supabase
        .from('livestock')
        .select('*')
        .eq('farmer_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLivestock((data as any) || []);
    } catch (error) {
      console.error('Error loading livestock:', error);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: LivestockInput) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        alert('Please login');
        return;
      }

      if (editingLivestock) {
        const { error } = await supabase
          .from('livestock')
          .update({
            ...data,
            farmer_id: user.id,
          })
          .eq('id', editingLivestock.id);

        if (error) throw error;
      } else {
        const { error } = await supabase.from('livestock').insert({
          ...data,
          farmer_id: user.id,
        });

        if (error) throw error;
      }

      setShowModal(false);
      setEditingLivestock(null);
      reset();
      loadLivestock();
    } catch (error: any) {
      alert('Error saving livestock: ' + error.message);
    }
  };

  const handleEdit = (item: Livestock) => {
    setEditingLivestock(item);
    reset({
      name: item.name,
      species: item.species,
      breed: item.breed || '',
      age: item.age,
      gender: item.gender,
      weight: item.weight || '',
      color: item.color || '',
      tagNumber: item.tagNumber || '',
      dateOfBirth: item.dateOfBirth || '',
      purchaseDate: item.purchaseDate || '',
      notes: item.notes || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this livestock record?')) return;

    try {
      const { error } = await supabase.from('livestock').delete().eq('id', id);
      if (error) throw error;
      loadLivestock();
    } catch (error: any) {
      alert('Error deleting livestock: ' + error.message);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-primary mb-2">My Livestock</h1>
          <p className="text-gray-600">Manage your livestock records</p>
        </div>
        <Button
          variant="primary"
          onClick={() => {
            setEditingLivestock(null);
            reset();
            setShowModal(true);
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Livestock
        </Button>
      </div>

      {livestock.length === 0 ? (
        <Card className="text-center py-12">
          <Heart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">No livestock records yet</p>
          <Button
            variant="primary"
            onClick={() => {
              setEditingLivestock(null);
              reset();
              setShowModal(true);
            }}
          >
            Add Your First Livestock
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {livestock.map((item) => (
            <Card key={item.id}>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold">{item.name}</h3>
                  <p className="text-secondary font-medium capitalize">{item.species}</p>
                </div>
                <Badge variant="info">{item.gender}</Badge>
              </div>

              <div className="space-y-2 text-sm text-gray-600 mb-4">
                {item.breed && <p>Breed: {item.breed}</p>}
                <p>Age: {item.age}</p>
                {item.weight && <p>Weight: {item.weight} kg</p>}
                {item.tagNumber && <p>Tag: {item.tagNumber}</p>}
                {item.notes && (
                  <p className="text-gray-700 mt-2">{item.notes}</p>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(item)}
                >
                  <Edit className="w-4 h-4 mr-1" />
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(item.id)}
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Delete
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingLivestock(null);
          reset();
        }}
        title={editingLivestock ? 'Edit Livestock' : 'Add New Livestock'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Name"
            placeholder="e.g., Bessie"
            {...register('name')}
            error={errors.name?.message}
          />

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Species"
              options={speciesOptions}
              {...register('species')}
              error={errors.species?.message}
            />
            <Input
              label="Breed (optional)"
              placeholder="e.g., Holstein"
              {...register('breed')}
              error={errors.breed?.message}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Age"
              placeholder="e.g., 2 years"
              {...register('age')}
              error={errors.age?.message}
            />
            <Select
              label="Gender"
              options={[
                { value: 'male', label: 'Male' },
                { value: 'female', label: 'Female' },
                { value: 'unknown', label: 'Unknown' },
              ]}
              {...register('gender')}
              error={errors.gender?.message}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Weight (kg) - Optional"
              type="number"
              {...register('weight')}
              error={errors.weight?.message}
            />
            <Input
              label="Color - Optional"
              {...register('color')}
              error={errors.color?.message}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Tag Number - Optional"
              {...register('tagNumber')}
              error={errors.tagNumber?.message}
            />
            <Input
              label="Date of Birth - Optional"
              type="date"
              {...register('dateOfBirth')}
              error={errors.dateOfBirth?.message}
            />
          </div>

          <Input
            label="Purchase Date - Optional"
            type="date"
            {...register('purchaseDate')}
            error={errors.purchaseDate?.message}
          />

          <Textarea
            label="Notes - Optional"
            placeholder="Additional information..."
            {...register('notes')}
            error={errors.notes?.message}
          />

          <div className="flex gap-4">
            <Button type="submit" variant="primary" className="flex-1">
              {editingLivestock ? 'Update' : 'Add'} Livestock
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowModal(false);
                setEditingLivestock(null);
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

