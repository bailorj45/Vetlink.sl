'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  farmerRegistrationSchema,
  vetRegistrationSchema,
  type FarmerRegistrationInput,
  type VetRegistrationInput,
} from '@/lib/validators/auth';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { supabase } from '@/lib/supabase/client';

const districts = [
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

const livestockCategories = [
  'Cattle',
  'Goats',
  'Sheep',
  'Poultry',
  'Pigs',
  'Other',
];

const farmSizes = [
  'Small (1-10 animals)',
  'Medium (11-50 animals)',
  'Large (51-200 animals)',
  'Commercial (200+ animals)',
];

const specializations = [
  'Large Animal Medicine',
  'Small Animal Medicine',
  'Poultry Medicine',
  'Mixed Practice',
  'Surgery',
  'Reproductive Health',
  'Preventive Medicine',
];

export default function RegisterPage() {
  const router = useRouter();
  const [userType, setUserType] = useState<'farmer' | 'vet'>('farmer');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const farmerForm = useForm<FarmerRegistrationInput>({
    resolver: zodResolver(farmerRegistrationSchema),
  });

  const vetForm = useForm<VetRegistrationInput>({
    resolver: zodResolver(vetRegistrationSchema),
  });

  const handleCategoryToggle = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const onFarmerSubmit = async (data: FarmerRegistrationInput) => {
    setError(null);
    setLoading(true);

    try {
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
      });

      if (authError) throw authError;

      if (authData.user) {
        // Create user profile
        const { error: profileError } = await supabase.from('users').insert({
          id: authData.user.id,
          email: data.email,
          full_name: data.fullName,
          phone: data.phone,
          role: 'farmer',
          farm_size: data.farmSize,
          livestock_categories: data.livestockCategories,
          district: data.district,
          address: data.address,
        });

        if (profileError) throw profileError;

        router.push('/farmer/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to register. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const onVetSubmit = async (data: VetRegistrationInput) => {
    setError(null);
    setLoading(true);

    try {
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
      });

      if (authError) throw authError;

      if (authData.user) {
        // Create user profile
        const { error: profileError } = await supabase.from('users').insert({
          id: authData.user.id,
          email: data.email,
          full_name: data.fullName,
          phone: data.phone,
          role: 'vet',
          license_number: data.licenseNumber,
          specialization: data.specialization,
          district: data.district,
          years_of_experience: parseInt(data.yearsOfExperience),
          bio: data.bio,
          verified: false, // Requires admin verification
        });

        if (profileError) throw profileError;

        router.push('/vet/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to register. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center py-12 px-4">
      <Card className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">Create Account</h1>
          <p className="text-gray-600">Join VetLink Sierra Leone</p>
        </div>

        {/* User Type Selector */}
        <div className="flex gap-4 mb-8">
          <button
            type="button"
            onClick={() => setUserType('farmer')}
            className={`flex-1 py-3 rounded-12 font-semibold transition-colors ${
              userType === 'farmer'
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            I&apos;m a Farmer
          </button>
          <button
            type="button"
            onClick={() => setUserType('vet')}
            className={`flex-1 py-3 rounded-12 font-semibold transition-colors ${
              userType === 'vet'
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            I&apos;m a Veterinarian
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-error-light border border-error rounded-8 text-error text-sm">
            {error}
          </div>
        )}

        {userType === 'farmer' ? (
          <form onSubmit={farmerForm.handleSubmit(onFarmerSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Full Name"
                placeholder="John Doe"
                {...farmerForm.register('fullName')}
                error={farmerForm.formState.errors.fullName?.message}
              />
              <Input
                label="Email"
                type="email"
                placeholder="your.email@example.com"
                {...farmerForm.register('email')}
                error={farmerForm.formState.errors.email?.message}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Phone"
                type="tel"
                placeholder="+232 XX XXX XXXX"
                {...farmerForm.register('phone')}
                error={farmerForm.formState.errors.phone?.message}
              />
              <Input
                label="Password"
                type="password"
                placeholder="At least 6 characters"
                {...farmerForm.register('password')}
                error={farmerForm.formState.errors.password?.message}
              />
            </div>

            <Select
              label="District"
              options={districts.map((d) => ({ value: d, label: d }))}
              {...farmerForm.register('district')}
              error={farmerForm.formState.errors.district?.message}
            />

            <Input
              label="Address"
              placeholder="Your farm address"
              {...farmerForm.register('address')}
              error={farmerForm.formState.errors.address?.message}
            />

            <Select
              label="Farm Size"
              options={farmSizes.map((s) => ({ value: s, label: s }))}
              {...farmerForm.register('farmSize')}
              error={farmerForm.formState.errors.farmSize?.message}
            />

            <div>
              <label className="label">Livestock Categories</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                {livestockCategories.map((category) => (
                  <label key={category} className="flex items-center">
                    <input
                      type="checkbox"
                      value={category}
                      checked={selectedCategories.includes(category)}
                      onChange={() => handleCategoryToggle(category)}
                      className="mr-2"
                    />
                    <span className="text-sm">{category}</span>
                  </label>
                ))}
              </div>
              {farmerForm.formState.errors.livestockCategories && (
                <p className="mt-1 text-sm text-error">
                  {farmerForm.formState.errors.livestockCategories.message}
                </p>
              )}
              <input
                type="hidden"
                {...farmerForm.register('livestockCategories')}
                value={JSON.stringify(selectedCategories)}
              />
            </div>

            <Button type="submit" variant="primary" className="w-full" disabled={loading}>
              {loading ? 'Creating account...' : 'Create Farmer Account'}
            </Button>
          </form>
        ) : (
          <form onSubmit={vetForm.handleSubmit(onVetSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Full Name"
                placeholder="Dr. Jane Smith"
                {...vetForm.register('fullName')}
                error={vetForm.formState.errors.fullName?.message}
              />
              <Input
                label="Email"
                type="email"
                placeholder="your.email@example.com"
                {...vetForm.register('email')}
                error={vetForm.formState.errors.email?.message}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Phone"
                type="tel"
                placeholder="+232 XX XXX XXXX"
                {...vetForm.register('phone')}
                error={vetForm.formState.errors.phone?.message}
              />
              <Input
                label="Password"
                type="password"
                placeholder="At least 6 characters"
                {...vetForm.register('password')}
                error={vetForm.formState.errors.password?.message}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="License Number"
                placeholder="VET-XXXX-XXXX"
                {...vetForm.register('licenseNumber')}
                error={vetForm.formState.errors.licenseNumber?.message}
              />
              <Select
                label="Specialization"
                options={specializations.map((s) => ({ value: s, label: s }))}
                {...vetForm.register('specialization')}
                error={vetForm.formState.errors.specialization?.message}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Select
                label="District"
                options={districts.map((d) => ({ value: d, label: d }))}
                {...vetForm.register('district')}
                error={vetForm.formState.errors.district?.message}
              />
              <Input
                label="Years of Experience"
                type="number"
                placeholder="5"
                {...vetForm.register('yearsOfExperience')}
                error={vetForm.formState.errors.yearsOfExperience?.message}
              />
            </div>

            <Textarea
              label="Bio"
              placeholder="Tell us about your experience and expertise..."
              {...vetForm.register('bio')}
              error={vetForm.formState.errors.bio?.message}
            />

            <Button type="submit" variant="primary" className="w-full" disabled={loading}>
              {loading ? 'Creating account...' : 'Create Veterinarian Account'}
            </Button>
          </form>
        )}

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-primary font-semibold hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </Card>
    </div>
  );
}

