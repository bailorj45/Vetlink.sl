'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { checkSymptoms, type SymptomInput, type SymptomResult } from '@/lib/ai/symptom-checker';
import { AlertCircle, Stethoscope, CheckCircle } from 'lucide-react';

const speciesOptions = [
  { value: 'cattle', label: 'Cattle' },
  { value: 'goat', label: 'Goat' },
  { value: 'sheep', label: 'Sheep' },
  { value: 'poultry', label: 'Poultry' },
  { value: 'pig', label: 'Pig' },
];

const commonSymptoms = [
  'Loss of appetite',
  'Lethargy',
  'Fever',
  'Diarrhea',
  'Coughing',
  'Lameness',
  'Difficulty breathing',
  'Discharge from eyes/nose',
  'Reduced milk production',
  'Weight loss',
  'Swelling',
  'Skin lesions',
];

export default function SymptomCheckerPage() {
  const [species, setSpecies] = useState('');
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [customSymptom, setCustomSymptom] = useState('');
  const [age, setAge] = useState('');
  const [duration, setDuration] = useState('');
  const [severity, setSeverity] = useState<'mild' | 'moderate' | 'severe'>('moderate');
  const [result, setResult] = useState<SymptomResult | null>(null);
  const [loading, setLoading] = useState(false);

  const toggleSymptom = (symptom: string) => {
    setSelectedSymptoms((prev) =>
      prev.includes(symptom)
        ? prev.filter((s) => s !== symptom)
        : [...prev, symptom]
    );
  };

  const handleCheck = () => {
    if (!species || selectedSymptoms.length === 0) {
      alert('Please select a species and at least one symptom');
      return;
    }

    setLoading(true);
    const input: SymptomInput = {
      species,
      symptoms: selectedSymptoms,
      age,
      duration,
      severity,
    };

    const analysis = checkSymptoms(input);
    setResult(analysis);
    setLoading(false);
  };

  const addCustomSymptom = () => {
    if (customSymptom.trim() && !selectedSymptoms.includes(customSymptom.trim())) {
      setSelectedSymptoms((prev) => [...prev, customSymptom.trim()]);
      setCustomSymptom('');
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-primary mb-2">AI Symptom Checker</h1>
        <p className="text-gray-600">
          Get AI-powered guidance on livestock health symptoms
        </p>
      </div>

      <Card className="mb-6">
        <h2 className="text-2xl font-bold mb-6">Enter Symptoms</h2>
        <div className="space-y-6">
          <Select
            label="Species"
            options={speciesOptions}
            value={species}
            onChange={(e) => setSpecies(e.target.value)}
          />

          <div>
            <label className="label">Select Symptoms</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
              {commonSymptoms.map((symptom) => (
                <button
                  key={symptom}
                  type="button"
                  onClick={() => toggleSymptom(symptom)}
                  className={`p-3 rounded-8 border-2 text-left transition-colors ${
                    selectedSymptoms.includes(symptom)
                      ? 'border-primary bg-primary/10'
                      : 'border-gray-200 hover:border-primary/50'
                  }`}
                >
                  {symptom}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <Input
              placeholder="Add custom symptom..."
              value={customSymptom}
              onChange={(e) => setCustomSymptom(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addCustomSymptom()}
            />
            <Button type="button" onClick={addCustomSymptom}>
              Add
            </Button>
          </div>

          {selectedSymptoms.length > 0 && (
            <div>
              <p className="text-sm text-gray-600 mb-2">Selected symptoms:</p>
              <div className="flex flex-wrap gap-2">
                {selectedSymptoms.map((symptom) => (
                  <Badge key={symptom} variant="info">
                    {symptom}
                    <button
                      onClick={() => toggleSymptom(symptom)}
                      className="ml-2 hover:text-error"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Age (optional)"
              placeholder="e.g., 2 years"
              value={age}
              onChange={(e) => setAge(e.target.value)}
            />
            <Input
              label="Duration (optional)"
              placeholder="e.g., 3 days"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
            />
            <Select
              label="Severity"
              options={[
                { value: 'mild', label: 'Mild' },
                { value: 'moderate', label: 'Moderate' },
                { value: 'severe', label: 'Severe' },
              ]}
              value={severity}
              onChange={(e) => setSeverity(e.target.value as any)}
            />
          </div>

          <Button
            variant="primary"
            onClick={handleCheck}
            disabled={loading || !species || selectedSymptoms.length === 0}
            className="w-full"
          >
            {loading ? 'Analyzing...' : 'Check Symptoms'}
          </Button>
        </div>
      </Card>

      {result && (
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <Stethoscope className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-bold">Analysis Results</h2>
          </div>

          <div
            className={`p-4 rounded-12 mb-6 ${
              result.urgency === 'emergency' || result.urgency === 'high'
                ? 'bg-red-50 border-2 border-red-200'
                : result.urgency === 'medium'
                ? 'bg-yellow-50 border-2 border-yellow-200'
                : 'bg-blue-50 border-2 border-blue-200'
            }`}
          >
            <div className="flex items-start gap-3">
              <AlertCircle
                className={`w-6 h-6 flex-shrink-0 ${
                  result.urgency === 'emergency' || result.urgency === 'high'
                    ? 'text-red-600'
                    : result.urgency === 'medium'
                    ? 'text-yellow-600'
                    : 'text-blue-600'
                }`}
              />
              <div>
                <p className="font-bold mb-2">
                  Urgency Level: <Badge variant={result.urgency === 'high' || result.urgency === 'emergency' ? 'error' : result.urgency === 'medium' ? 'warning' : 'info'}>{result.urgency.toUpperCase()}</Badge>
                </p>
                <p className="text-gray-700">{result.generalAdvice}</p>
                {result.shouldSeeVet && (
                  <p className="mt-2 font-semibold text-red-600">
                    ⚠️ We recommend consulting a veterinarian as soon as possible.
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-bold">Possible Conditions</h3>
            {result.possibleConditions.map((condition, index) => (
              <div key={index} className="border border-gray-200 rounded-12 p-4">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-bold text-lg">{condition.condition}</h4>
                  <div className="flex items-center gap-2">
                    <Badge variant={condition.urgency === 'high' || condition.urgency === 'emergency' ? 'error' : condition.urgency === 'medium' ? 'warning' : 'info'}>
                      {condition.urgency}
                    </Badge>
                    <span className="text-sm text-gray-600">
                      {Math.round(condition.confidence * 100)}% confidence
                    </span>
                  </div>
                </div>
                <p className="text-gray-700 mb-3">{condition.description}</p>
                <div>
                  <p className="font-semibold mb-2">Recommendations:</p>
                  <ul className="list-disc list-inside space-y-1 text-gray-700">
                    {condition.recommendations.map((rec, recIndex) => (
                      <li key={recIndex}>{rec}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-primary/10 rounded-12">
            <div className="flex items-start gap-2">
              <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <p className="text-sm text-gray-700">
                <strong>Disclaimer:</strong> This AI symptom checker provides general guidance
                only and should not replace professional veterinary diagnosis. Always consult
                with a certified veterinarian for accurate diagnosis and treatment.
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

