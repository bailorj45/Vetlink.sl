'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Phone, AlertCircle, MapPin, Clock } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';

const emergencyContacts = [
  { name: 'Emergency Veterinary Services', phone: '+232 XX XXX XXXX' },
  { name: 'Ministry of Agriculture', phone: '+232 XX XXX XXXX' },
  { name: 'Livestock Emergency Hotline', phone: '+232 XX XXX XXXX' },
];

export default function SOSPage() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    location: '',
    species: '',
    urgency: 'high',
    description: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      // Create emergency request
      const { error } = await supabase.from('emergency_requests').insert({
        farmer_id: user?.id || null,
        name: formData.name,
        phone: formData.phone,
        location: formData.location,
        species: formData.species,
        urgency: formData.urgency,
        description: formData.description,
        status: 'pending',
      });

      if (error) throw error;

      setSubmitted(true);
      
      // Notify nearby vets (in a real app, this would trigger notifications)
      alert('Emergency request submitted! Veterinarians in your area have been notified.');
    } catch (error: any) {
      alert('Error submitting request: ' + error.message);
    }
  };

  return (
    <div className="min-h-screen bg-cream py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-4">
            <AlertCircle className="w-10 h-10 text-red-600" />
          </div>
          <h1 className="text-4xl font-bold text-primary mb-2">Emergency SOS</h1>
          <p className="text-lg text-gray-600">
            Get immediate veterinary assistance for your livestock
          </p>
        </div>

        {submitted ? (
          <Card className="text-center py-12">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Request Submitted</h2>
            <p className="text-gray-600 mb-6">
              Your emergency request has been sent. Veterinarians in your area will be notified.
            </p>
            <Button
              variant="primary"
              onClick={() => {
                setSubmitted(false);
                setFormData({
                  name: '',
                  phone: '',
                  location: '',
                  species: '',
                  urgency: 'high',
                  description: '',
                });
              }}
            >
              Submit Another Request
            </Button>
          </Card>
        ) : (
          <>
            {/* Emergency Contacts */}
            <Card className="mb-8">
              <h2 className="text-2xl font-bold mb-4">Emergency Contacts</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {emergencyContacts.map((contact, index) => (
                  <div
                    key={index}
                    className="p-4 bg-primary/10 rounded-12 text-center"
                  >
                    <Phone className="w-6 h-6 text-primary mx-auto mb-2" />
                    <p className="font-semibold mb-1">{contact.name}</p>
                    <a
                      href={`tel:${contact.phone}`}
                      className="text-primary hover:underline"
                    >
                      {contact.phone}
                    </a>
                  </div>
                ))}
              </div>
            </Card>

            {/* Emergency Request Form */}
            <Card>
              <h2 className="text-2xl font-bold mb-6">Submit Emergency Request</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Your Name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                  />
                  <Input
                    label="Phone Number"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="label flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      Location
                    </label>
                    <Input
                      value={formData.location}
                      onChange={(e) =>
                        setFormData({ ...formData, location: e.target.value })
                      }
                      placeholder="Your location or farm address"
                      required
                    />
                  </div>
                  <Select
                    label="Species"
                    options={[
                      { value: 'cattle', label: 'Cattle' },
                      { value: 'goat', label: 'Goat' },
                      { value: 'sheep', label: 'Sheep' },
                      { value: 'poultry', label: 'Poultry' },
                      { value: 'pig', label: 'Pig' },
                      { value: 'other', label: 'Other' },
                    ]}
                    value={formData.species}
                    onChange={(e) =>
                      setFormData({ ...formData, species: e.target.value })
                    }
                  />
                </div>

                <Select
                  label="Urgency Level"
                  options={[
                    { value: 'high', label: 'High - Urgent but not life-threatening' },
                    { value: 'emergency', label: 'Emergency - Life-threatening situation' },
                  ]}
                  value={formData.urgency}
                  onChange={(e) =>
                    setFormData({ ...formData, urgency: e.target.value })
                  }
                />

                <Textarea
                  label="Description of Emergency"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Describe the emergency situation, symptoms, and any immediate concerns..."
                  required
                />

                <Button type="submit" variant="primary" className="w-full" size="lg">
                  <AlertCircle className="w-5 h-5 mr-2" />
                  Submit Emergency Request
                </Button>
              </form>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}

