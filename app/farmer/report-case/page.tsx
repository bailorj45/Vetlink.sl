'use client';

import React, { useState, useRef } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { VoiceRecorder } from '@/components/VoiceRecorder';
import { Badge } from '@/components/ui/Badge';
import { Camera, Upload, AlertCircle, CheckCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { diagnoseSymptom } from '@/lib/utils/ai';
import { createCase, updateCaseDiagnosis } from '@/lib/utils/db';
import { Livestock } from '@/lib/types';

export default function ReportCasePage() {
  const [livestock, setLivestock] = useState<Livestock[]>([]);
  const [selectedLivestock, setSelectedLivestock] = useState<string>('');
  const [symptomText, setSymptomText] = useState('');
  const [imageBase64, setImageBase64] = useState<string>('');
  const [imagePreview, setImagePreview] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [diagnosis, setDiagnosis] = useState<any>(null);
  const [caseId, setCaseId] = useState<string | null>(null);
  const [transcription, setTranscription] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    loadLivestock();
  }, []);

  const loadLivestock = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data } = await supabase
        .from('livestock')
        .select('*')
        .eq('farmer_id', user.id);

      setLivestock((data as any) || []);
    } catch (error) {
      console.error('Error loading livestock:', error);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setImageBase64(base64);
      setImagePreview(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleVoiceTranscription = (text: string) => {
    setTranscription(text);
    setSymptomText(text);
  };

  const handleSubmit = async () => {
    if (!symptomText.trim() && !transcription.trim()) {
      alert('Please describe the symptoms or use voice recording');
      return;
    }

    setIsProcessing(true);
    setDiagnosis(null);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        alert('Please login');
        return;
      }

      const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY || '';
      if (!apiKey) {
        throw new Error('OpenAI API key not configured');
      }

      const selectedLivestockData = livestock.find((l) => l.id === selectedLivestock);
      const symptomDescription = symptomText || transcription;

      // Step 1: Create case in database
      const newCase = await createCase({
        farmer_id: user.id,
        livestock_id: selectedLivestock || undefined,
        symptom_description: symptomDescription,
        image_base64: imageBase64 || undefined,
        emergency_flag: false, // Will be updated by AI
      });

      setCaseId(newCase.id);

      // Step 2: Get AI diagnosis
      const diagnosisResult = await diagnoseSymptom(
        {
          text: symptomDescription,
          imageBase64: imageBase64 || undefined,
          species: selectedLivestockData?.species,
          age: selectedLivestockData?.age,
        },
        apiKey
      );

      setDiagnosis(diagnosisResult);

      // Step 3: Update case with diagnosis
      await updateCaseDiagnosis(newCase.id, {
        diagnosis: diagnosisResult.predicted_disease,
        confidence_score: diagnosisResult.confidence_score,
        ai_reasoning: diagnosisResult.full_reasoning,
        vet_required: diagnosisResult.vet_required,
        emergency_flag: diagnosisResult.emergency_flag,
      });

      // Step 4: If emergency or vet required, trigger notification
      if (diagnosisResult.emergency_flag || diagnosisResult.vet_required) {
        // In a real app, this would trigger a notification to nearby vets
        console.log('Emergency or vet required - notification should be sent');
      }
    } catch (error: any) {
      console.error('Error processing case:', error);
      alert('Error: ' + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-primary mb-2">Report Case</h1>
        <p className="text-gray-600">
          Describe symptoms using voice or text, and get AI-powered diagnosis
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Input */}
        <div className="space-y-6">
          <Card>
            <h2 className="text-xl font-bold mb-4">Livestock Information</h2>
            <Select
              label="Select Livestock (Optional)"
              options={[
                { value: '', label: 'None selected' },
                ...livestock.map((l) => ({
                  value: l.id,
                  label: `${l.name} (${l.species})`,
                })),
              ]}
              value={selectedLivestock}
              onChange={(e) => setSelectedLivestock(e.target.value)}
            />
          </Card>

          <Card>
            <h2 className="text-xl font-bold mb-4">Voice Recording</h2>
            <VoiceRecorder
              onTranscriptionComplete={handleVoiceTranscription}
              className="mb-4"
            />
            {transcription && (
              <div className="mt-4 p-3 bg-gray-50 rounded-8">
                <p className="text-sm text-gray-600 mb-1">Transcription:</p>
                <p className="text-sm">{transcription}</p>
              </div>
            )}
          </Card>

          <Card>
            <h2 className="text-xl font-bold mb-4">Or Type Symptoms</h2>
            <Textarea
              label="Symptom Description"
              placeholder="Describe the symptoms you're observing..."
              value={symptomText}
              onChange={(e) => setSymptomText(e.target.value)}
              rows={6}
            />
          </Card>

          <Card>
            <h2 className="text-xl font-bold mb-4">Upload Image (Optional)</h2>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
            <div className="space-y-4">
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="w-full"
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload Image
              </Button>
              {imagePreview && (
                <div className="relative">
                  <Image
                    src={imagePreview}
                    alt="Symptom preview"
                    width={800}
                    height={600}
                    className="w-full rounded-12"
                  />
                  <button
                    onClick={() => {
                      setImagePreview('');
                      setImageBase64('');
                    }}
                    className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full"
                  >
                    ×
                  </button>
                </div>
              )}
            </div>
          </Card>

          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={isProcessing || (!symptomText.trim() && !transcription.trim())}
            className="w-full"
            size="lg"
          >
            {isProcessing ? 'Processing...' : 'Get AI Diagnosis'}
          </Button>
        </div>

        {/* Right Column: Results */}
        <div className="space-y-6">
          {isProcessing && (
            <Card>
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-gray-600">Analyzing symptoms...</p>
              </div>
            </Card>
          )}

          {diagnosis && (
            <Card>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold">Diagnosis Results</h2>
                  {diagnosis.emergency_flag && (
                    <Badge variant="error">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      Emergency
                    </Badge>
                  )}
                </div>

                <div>
                  <h3 className="font-bold mb-2">Predicted Disease</h3>
                  <p className="text-lg">{diagnosis.predicted_disease}</p>
                  <div className="mt-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">Confidence:</span>
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full"
                          style={{
                            width: `${diagnosis.confidence_score * 100}%`,
                          }}
                        ></div>
                      </div>
                      <span className="text-sm font-semibold">
                        {Math.round(diagnosis.confidence_score * 100)}%
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-bold mb-2">Recommended Action</h3>
                  <p className="text-gray-700">{diagnosis.recommended_action}</p>
                </div>

                {diagnosis.suggested_treatment && (
                  <div>
                    <h3 className="font-bold mb-2">Suggested Treatment</h3>
                    <p className="text-gray-700">{diagnosis.suggested_treatment}</p>
                  </div>
                )}

                <div>
                  <h3 className="font-bold mb-2">Full Reasoning</h3>
                  <p className="text-gray-700 text-sm">{diagnosis.full_reasoning}</p>
                </div>

                {diagnosis.prevention_tips && diagnosis.prevention_tips.length > 0 && (
                  <div>
                    <h3 className="font-bold mb-2">Prevention Tips</h3>
                    <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm">
                      {diagnosis.prevention_tips.map((tip: string, index: number) => (
                        <li key={index}>{tip}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="flex gap-2 pt-4 border-t">
                  {diagnosis.vet_required && (
                    <Button variant="primary" className="flex-1">
                      Find a Veterinarian
                    </Button>
                  )}
                  {caseId && (
                    <Button variant="outline" className="flex-1">
                      View Case Details
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

