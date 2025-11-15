'use client';

import React, { useState } from 'react';
import { Mic, MicOff, Loader2 } from 'lucide-react';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { useVoice } from '@/hooks/useVoice';
import { cn } from '@/utils/cn';

interface VoiceRecorderProps {
  onTranscriptionComplete?: (transcription: string) => void;
  onAIResponseComplete?: (response: string) => void;
  className?: string;
  autoStart?: boolean;
}

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({
  onTranscriptionComplete,
  onAIResponseComplete,
  className,
  autoStart = false,
}) => {
  const [isHolding, setIsHolding] = useState(false);
  const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY || '';

  const {
    isRecording,
    isProcessing,
    transcription,
    aiResponse,
    error,
    startRecording,
    stopRecording,
    cleanup,
  } = useVoice({
    apiKey,
    model: 'gpt-4o-realtime-preview-2024-10-01',
    voice: 'alloy',
    temperature: 0.8,
    autoPlay: true,
  });

  React.useEffect(() => {
    if (transcription && onTranscriptionComplete && !isRecording) {
      onTranscriptionComplete(transcription);
    }
  }, [transcription, isRecording, onTranscriptionComplete]);

  React.useEffect(() => {
    if (aiResponse && onAIResponseComplete && !isProcessing) {
      onAIResponseComplete(aiResponse);
    }
  }, [aiResponse, isProcessing, onAIResponseComplete]);

  React.useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  const handleMouseDown = async () => {
    setIsHolding(true);
    await startRecording();
  };

  const handleMouseUp = async () => {
    setIsHolding(false);
    await stopRecording();
  };

  const handleTouchStart = async (e: React.TouchEvent) => {
    e.preventDefault();
    setIsHolding(true);
    await startRecording();
  };

  const handleTouchEnd = async (e: React.TouchEvent) => {
    e.preventDefault();
    setIsHolding(false);
    await stopRecording();
  };

  return (
    <Card className={cn('p-6', className)}>
      <div className="space-y-4">
        {/* Record Button */}
        <div className="flex justify-center">
          <button
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            disabled={isProcessing}
            className={cn(
              'w-24 h-24 rounded-full flex items-center justify-center transition-all duration-200',
              isRecording || isHolding
                ? 'bg-red-500 hover:bg-red-600 scale-110'
                : 'bg-primary hover:bg-primary-dark',
              isProcessing && 'opacity-50 cursor-not-allowed'
            )}
          >
            {isProcessing ? (
              <Loader2 className="w-8 h-8 text-white animate-spin" />
            ) : isRecording || isHolding ? (
              <MicOff className="w-8 h-8 text-white" />
            ) : (
              <Mic className="w-8 h-8 text-white" />
            )}
          </button>
        </div>

        {/* Status Text */}
        <div className="text-center">
          {isRecording && (
            <p className="text-sm text-gray-600 animate-pulse">Recording... Hold to speak</p>
          )}
          {isProcessing && (
            <p className="text-sm text-gray-600">Processing...</p>
          )}
          {!isRecording && !isProcessing && (
            <p className="text-sm text-gray-600">Hold to record</p>
          )}
        </div>

        {/* Live Transcription */}
        {transcription && (
          <div className="bg-gray-50 rounded-12 p-4">
            <p className="text-xs text-gray-500 mb-1">Your message:</p>
            <p className="text-sm text-gray-700">{transcription}</p>
          </div>
        )}

        {/* AI Response */}
        {aiResponse && (
          <div className="bg-primary/10 rounded-12 p-4">
            <p className="text-xs text-primary mb-1">AI Response:</p>
            <p className="text-sm text-gray-700">{aiResponse}</p>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-12 p-4">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}
      </div>
    </Card>
  );
};

