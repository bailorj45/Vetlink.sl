'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { calculateFeed, type FeedInput, type FeedRecommendation } from '@/lib/ai/feed-calculator';
import { Calculator, Droplet, Calendar } from 'lucide-react';

const speciesOptions = [
  { value: 'cattle', label: 'Cattle' },
  { value: 'goat', label: 'Goat' },
  { value: 'sheep', label: 'Sheep' },
  { value: 'poultry', label: 'Poultry' },
  { value: 'pig', label: 'Pig' },
];

const purposeOptions = [
  { value: 'general', label: 'General' },
  { value: 'meat', label: 'Meat Production' },
  { value: 'dairy', label: 'Dairy Production' },
  { value: 'breeding', label: 'Breeding' },
];

export default function FeedCalculatorPage() {
  const [species, setSpecies] = useState('');
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | ''>('');
  const [purpose, setPurpose] = useState('general');
  const [pregnancyStatus, setPregnancyStatus] = useState<'pregnant' | 'lactating' | 'none'>('none');
  const [result, setResult] = useState<FeedRecommendation | null>(null);
  const [loading, setLoading] = useState(false);

  const handleCalculate = () => {
    if (!species || !age) {
      alert('Please select species and enter age');
      return;
    }

    setLoading(true);
    const input: FeedInput = {
      species,
      age,
      weight: weight || undefined,
      gender: gender || undefined,
      purpose: purpose as any,
      pregnancyStatus,
    };

    const recommendation = calculateFeed(input);
    setResult(recommendation);
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-primary mb-2">AI Feed Calculator</h1>
        <p className="text-gray-600">
          Get personalized feeding recommendations for your livestock
        </p>
      </div>

      <Card className="mb-6">
        <h2 className="text-2xl font-bold mb-6">Enter Livestock Information</h2>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Species"
              options={speciesOptions}
              value={species}
              onChange={(e) => setSpecies(e.target.value)}
            />
            <Input
              label="Age"
              placeholder="e.g., 2 years, 6 months, young"
              value={age}
              onChange={(e) => setAge(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Weight (kg) - Optional"
              type="number"
              placeholder="e.g., 500"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
            />
            <Select
              label="Gender - Optional"
              options={[
                { value: '', label: 'Not specified' },
                { value: 'male', label: 'Male' },
                { value: 'female', label: 'Female' },
              ]}
              value={gender}
              onChange={(e) => setGender(e.target.value as any)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Purpose"
              options={purposeOptions}
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
            />
            <Select
              label="Pregnancy Status (if female)"
              options={[
                { value: 'none', label: 'Not pregnant/lactating' },
                { value: 'pregnant', label: 'Pregnant' },
                { value: 'lactating', label: 'Lactating' },
              ]}
              value={pregnancyStatus}
              onChange={(e) => setPregnancyStatus(e.target.value as any)}
            />
          </div>

          <Button
            variant="primary"
            onClick={handleCalculate}
            disabled={loading || !species || !age}
            className="w-full"
          >
            {loading ? 'Calculating...' : 'Calculate Feed Requirements'}
          </Button>
        </div>
      </Card>

      {result && (
        <Card>
          <div className="flex items-center gap-2 mb-6">
            <Calculator className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-bold">Feed Recommendations</h2>
          </div>

          <div className="space-y-6">
            {/* Daily Feed Amount */}
            <div className="bg-primary/10 rounded-12 p-6">
              <h3 className="text-xl font-bold mb-4">Daily Feed Amount</h3>
              <div className="flex items-center gap-4">
                <div className="text-4xl font-bold text-primary">
                  {result.dailyFeedAmount.quantity}
                </div>
                <div>
                  <p className="text-2xl font-semibold">{result.dailyFeedAmount.unit}</p>
                  <p className="text-gray-600">{result.dailyFeedAmount.feedType}</p>
                </div>
              </div>
            </div>

            {/* Water Requirement */}
            <div className="bg-blue-50 rounded-12 p-6">
              <div className="flex items-center gap-2 mb-2">
                <Droplet className="w-5 h-5 text-blue-600" />
                <h3 className="text-xl font-bold">Water Requirement</h3>
              </div>
              <p className="text-2xl font-bold text-blue-600">
                {result.waterRequirement.quantity} {result.waterRequirement.unit} per day
              </p>
            </div>

            {/* Feeding Schedule */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="w-5 h-5 text-primary" />
                <h3 className="text-xl font-bold">Feeding Schedule</h3>
              </div>
              <div className="space-y-3">
                {result.feedingSchedule.map((schedule, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-12"
                  >
                    <div>
                      <p className="font-semibold">{schedule.time}</p>
                      <p className="text-sm text-gray-600">{schedule.feedType}</p>
                    </div>
                    <p className="text-lg font-bold">
                      {schedule.amount} {schedule.unit}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Nutritional Notes */}
            {result.nutritionalNotes.length > 0 && (
              <div>
                <h3 className="text-xl font-bold mb-4">Nutritional Notes</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  {result.nutritionalNotes.map((note, index) => (
                    <li key={index}>{note}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Supplements */}
            {result.supplements && result.supplements.length > 0 && (
              <div>
                <h3 className="text-xl font-bold mb-4">Recommended Supplements</h3>
                <div className="space-y-2">
                  {result.supplements.map((supplement, index) => (
                    <div key={index} className="p-4 bg-yellow-50 rounded-12">
                      <p className="font-semibold">{supplement.name}</p>
                      <p className="text-sm text-gray-600">
                        {supplement.amount} - {supplement.frequency}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-6 p-4 bg-primary/10 rounded-12">
              <p className="text-sm text-gray-700">
                <strong>Note:</strong> These recommendations are general guidelines. Actual
                feed requirements may vary based on individual animal health, activity level,
                and environmental conditions. Consult with a veterinarian for personalized
                feeding plans.
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

