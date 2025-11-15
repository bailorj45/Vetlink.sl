'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { supabase } from '@/lib/supabase/client';
import { Veterinarian } from '@/lib/types';
import { CheckCircle, XCircle, Clock } from 'lucide-react';

export default function VerificationsPage() {
  const [vets, setVets] = useState<Veterinarian[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadVets();
  }, []);

  const loadVets = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('role', 'vet')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setVets((data as any) || []);
    } catch (error) {
      console.error('Error loading vets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerification = async (vetId: string, verified: boolean) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ verified })
        .eq('id', vetId);

      if (error) throw error;
      loadVets();
    } catch (error: any) {
      alert('Error: ' + error.message);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  const pendingVets = vets.filter((v) => !v.verified);
  const verifiedVets = vets.filter((v) => v.verified);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-primary mb-2">Veterinarian Verifications</h1>
        <p className="text-gray-600">Review and verify veterinarian credentials</p>
      </div>

      {/* Pending Verifications */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Pending Verifications ({pendingVets.length})</h2>
        {pendingVets.length === 0 ? (
          <Card className="text-center py-8">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
            <p className="text-gray-600">All veterinarians have been verified</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {pendingVets.map((vet) => (
              <Card key={vet.id}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-xl font-bold">{vet.fullName}</h3>
                      <Badge variant="warning">
                        <Clock className="w-3 h-3 mr-1" />
                        Pending
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Email</p>
                        <p className="font-semibold">{vet.email}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Phone</p>
                        <p className="font-semibold">{vet.phone}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">License</p>
                        <p className="font-semibold">{vet.licenseNumber}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">District</p>
                        <p className="font-semibold">{vet.district}</p>
                      </div>
                    </div>
                    <div className="mt-4">
                      <p className="text-gray-600 mb-1">Specialization</p>
                      <p className="font-semibold">{vet.specialization}</p>
                    </div>
                    <div className="mt-4">
                      <p className="text-gray-600 mb-1">Bio</p>
                      <p className="text-gray-700">{vet.bio}</p>
                    </div>
                    <div className="mt-4">
                      <p className="text-gray-600">Experience: {vet.yearsOfExperience} years</p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 ml-6">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleVerification(vet.id, true)}
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Verify
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleVerification(vet.id, false)}
                    >
                      <XCircle className="w-4 h-4 mr-1" />
                      Reject
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Verified Veterinarians */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Verified Veterinarians ({verifiedVets.length})</h2>
        {verifiedVets.length === 0 ? (
          <Card className="text-center py-8">
            <p className="text-gray-600">No verified veterinarians yet</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {verifiedVets.map((vet) => (
              <Card key={vet.id}>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-bold">{vet.fullName}</h3>
                      <Badge variant="success">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Verified
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">{vet.specialization}</p>
                    <p className="text-sm text-gray-600">{vet.district}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleVerification(vet.id, false)}
                  >
                    Revoke
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

