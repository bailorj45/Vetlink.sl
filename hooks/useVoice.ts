/**
 * useVoice Hook
 * React hook for voice recording and AI interaction
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { getVoiceStreamer, type TranscriptionToken, type VoiceResponse } from '@/lib/utils/voice';

export interface UseVoiceOptions {
  apiKey: string;
  model?: string;
  voice?: string;
  temperature?: number;
  autoPlay?: boolean;
}

export interface UseVoiceReturn {
  isRecording: boolean;
  isProcessing: boolean;
  transcription: string;
  aiResponse: string;
  error: string | null;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<void>;
  cleanup: () => void;
}

export function useVoice(options: UseVoiceOptions): UseVoiceReturn {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [error, setError] = useState<string | null>(null);
  const streamerRef = useRef<ReturnType<typeof getVoiceStreamer> | null>(null);

  // Initialize voice streamer
  useEffect(() => {
    if (!options.apiKey) {
      setError('OpenAI API key is required');
      return;
    }

    try {
      streamerRef.current = getVoiceStreamer({
        apiKey: options.apiKey,
        model: options.model,
        voice: options.voice,
        temperature: options.temperature,
      });

      // Set up transcription callback
      streamerRef.current.onTranscription((token: TranscriptionToken) => {
        if (token.isComplete) {
          setTranscription(token.text);
        } else {
          setTranscription((prev) => prev + token.text);
        }
      });

      // Set up AI response callback
      streamerRef.current.onAIResponse((response: VoiceResponse) => {
        if (response.isComplete) {
          setAiResponse(response.text);
          setIsProcessing(false);
        } else {
          setAiResponse((prev) => prev + response.text);
        }
      });
    } catch (err: any) {
      setError(err.message || 'Failed to initialize voice streamer');
    }

    return () => {
      if (streamerRef.current) {
        streamerRef.current.cleanup();
      }
    };
  }, [options.apiKey, options.model, options.voice, options.temperature]);

  const startRecording = useCallback(async () => {
    if (!streamerRef.current) {
      setError('Voice streamer not initialized');
      return;
    }

    try {
      setError(null);
      setTranscription('');
      setAiResponse('');
      setIsRecording(true);
      setIsProcessing(false);

      await streamerRef.current.startRecording();
    } catch (err: any) {
      setError(err.message || 'Failed to start recording');
      setIsRecording(false);
    }
  }, []);

  const stopRecording = useCallback(async () => {
    if (!streamerRef.current) {
      return;
    }

    try {
      setIsRecording(false);
      setIsProcessing(true);

      await streamerRef.current.stopRecording();
    } catch (err: any) {
      setError(err.message || 'Failed to stop recording');
      setIsProcessing(false);
    }
  }, []);

  const cleanup = useCallback(() => {
    if (streamerRef.current) {
      streamerRef.current.cleanup();
      streamerRef.current = null;
    }
    setIsRecording(false);
    setIsProcessing(false);
    setTranscription('');
    setAiResponse('');
    setError(null);
  }, []);

  return {
    isRecording,
    isProcessing,
    transcription,
    aiResponse,
    error,
    startRecording,
    stopRecording,
    cleanup,
  };
}

