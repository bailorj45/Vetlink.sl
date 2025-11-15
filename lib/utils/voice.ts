/**
 * Voice Streaming Utilities
 * Handles OpenAI Realtime API integration for voice streaming
 */

export interface VoiceConfig {
  apiKey: string;
  model?: string;
  voice?: string;
  temperature?: number;
}

export interface TranscriptionToken {
  text: string;
  isComplete: boolean;
}

export interface VoiceResponse {
  audio: ArrayBuffer;
  text: string;
  isComplete: boolean;
}

class VoiceStreamer {
  private ws: WebSocket | null = null;
  private mediaRecorder: MediaRecorder | null = null;
  private audioContext: AudioContext | null = null;
  private stream: MediaStream | null = null;
  private config: VoiceConfig;
  private onTranscriptionCallback?: (token: TranscriptionToken) => void;
  private onAIResponseCallback?: (response: VoiceResponse) => void;
  private audioQueue: ArrayBuffer[] = [];
  private isPlaying = false;

  constructor(config: VoiceConfig) {
    this.config = {
      model: 'gpt-4o-realtime-preview-2024-10-01',
      voice: 'alloy',
      temperature: 0.8,
      ...config,
    };
  }

  /**
   * Initialize WebSocket connection to OpenAI Realtime API
   */
  private async initializeWebSocket(): Promise<void> {
    return new Promise((resolve, reject) => {
      const wsUrl = 'wss://api.openai.com/v1/realtime?model=' + this.config.model;
      
      this.ws = new WebSocket(wsUrl, [], {
        headers: {
          Authorization: `Bearer ${this.config.apiKey}`,
          'OpenAI-Beta': 'realtime=v1',
        },
      } as any);

      this.ws.onopen = () => {
        // Send session configuration
        this.sendMessage({
          type: 'session.update',
          session: {
            modalities: ['text', 'audio'],
            instructions: 'You are a helpful veterinary assistant. Provide clear, concise advice about livestock health.',
            voice: this.config.voice,
            temperature: this.config.temperature,
            turn_detection: {
              type: 'server_vad',
              threshold: 0.5,
              prefix_padding_ms: 300,
              silence_duration_ms: 500,
            },
          },
        });
        resolve();
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleWebSocketMessage(data);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        reject(error);
      };

      this.ws.onclose = () => {
        console.log('WebSocket closed');
      };
    });
  }

  /**
   * Handle incoming WebSocket messages
   */
  private handleWebSocketMessage(data: any): void {
    switch (data.type) {
      case 'response.audio_transcript.delta':
        if (this.onTranscriptionCallback) {
          this.onTranscriptionCallback({
            text: data.delta,
            isComplete: false,
          });
        }
        break;

      case 'response.audio_transcript.done':
        if (this.onTranscriptionCallback) {
          this.onTranscriptionCallback({
            text: data.transcript,
            isComplete: true,
          });
        }
        break;

      case 'response.audio.delta':
        // Accumulate audio chunks
        if (data.delta) {
          this.audioQueue.push(this.base64ToArrayBuffer(data.delta));
        }
        break;

      case 'response.audio.done':
        // Play accumulated audio
        if (this.audioQueue.length > 0) {
          this.playAudioQueue();
        }
        if (this.onAIResponseCallback) {
          this.onAIResponseCallback({
            audio: new ArrayBuffer(0),
            text: data.transcript || '',
            isComplete: true,
          });
        }
        break;

      case 'response.content_block.done':
        if (data.content_block?.type === 'message') {
          const text = data.content_block.text || '';
          if (this.onAIResponseCallback) {
            this.onAIResponseCallback({
              audio: new ArrayBuffer(0),
              text,
              isComplete: true,
            });
          }
        }
        break;

      case 'error':
        console.error('OpenAI Realtime error:', data.error);
        break;
    }
  }

  /**
   * Send message to WebSocket
   */
  private sendMessage(message: any): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    }
  }

  /**
   * Convert base64 to ArrayBuffer
   */
  private base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  }

  /**
   * Play accumulated audio queue
   */
  private async playAudioQueue(): Promise<void> {
    if (this.isPlaying || this.audioQueue.length === 0) return;

    this.isPlaying = true;

    try {
      if (!this.audioContext) {
        this.audioContext = new AudioContext();
      }

      // Concatenate all audio chunks
      const totalLength = this.audioQueue.reduce((sum, chunk) => sum + chunk.byteLength, 0);
      const combined = new Uint8Array(totalLength);
      let offset = 0;
      for (const chunk of this.audioQueue) {
        combined.set(new Uint8Array(chunk), offset);
        offset += chunk.byteLength;
      }

      // Decode and play
      const audioBuffer = await this.audioContext.decodeAudioData(combined.buffer);
      const source = this.audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(this.audioContext.destination);
      source.onended = () => {
        this.isPlaying = false;
        this.audioQueue = [];
      };
      source.start();
    } catch (error) {
      console.error('Error playing audio:', error);
      this.isPlaying = false;
      this.audioQueue = [];
    }
  }

  /**
   * Start recording from microphone
   */
  async startRecording(): Promise<void> {
    try {
      // Initialize WebSocket if not already connected
      if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
        await this.initializeWebSocket();
      }

      // Get microphone access
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 24000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
        },
      });

      // Create MediaRecorder
      this.mediaRecorder = new MediaRecorder(this.stream, {
        mimeType: 'audio/webm',
        audioBitsPerSecond: 24000,
      });

      this.mediaRecorder.ondataavailable = async (event) => {
        if (event.data.size > 0 && this.ws && this.ws.readyState === WebSocket.OPEN) {
          // Convert blob to base64
          const arrayBuffer = await event.data.arrayBuffer();
          const base64 = btoa(
            String.fromCharCode(...new Uint8Array(arrayBuffer))
          );

          // Send audio to OpenAI
          this.sendMessage({
            type: 'input_audio_buffer.append',
            audio: base64,
          });
        }
      };

      // Start recording
      this.mediaRecorder.start(250); // Send chunks every 250ms

      // Signal start of conversation
      this.sendMessage({
        type: 'conversation.item.create',
        item: {
          type: 'message',
          role: 'user',
        },
      });

      this.sendMessage({
        type: 'input_audio_buffer.commit',
      });
    } catch (error) {
      console.error('Error starting recording:', error);
      throw error;
    }
  }

  /**
   * Stop recording
   */
  async stopRecording(): Promise<void> {
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop();
    }

    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
    }

    // Signal end of input
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.sendMessage({
        type: 'input_audio_buffer.commit',
      });

      this.sendMessage({
        type: 'response.create',
      });
    }
  }

  /**
   * Set transcription callback
   */
  onTranscription(callback: (token: TranscriptionToken) => void): void {
    this.onTranscriptionCallback = callback;
  }

  /**
   * Set AI response callback
   */
  onAIResponse(callback: (response: VoiceResponse) => void): void {
    this.onAIResponseCallback = callback;
  }

  /**
   * Cleanup resources
   */
  cleanup(): void {
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop();
    }

    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
    }

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }

    this.audioQueue = [];
    this.isPlaying = false;
  }
}

let voiceStreamerInstance: VoiceStreamer | null = null;

/**
 * Get or create voice streamer instance
 */
export function getVoiceStreamer(config: VoiceConfig): VoiceStreamer {
  if (!voiceStreamerInstance) {
    voiceStreamerInstance = new VoiceStreamer(config);
  }
  return voiceStreamerInstance;
}

/**
 * Create a new voice streamer instance
 */
export function createVoiceStreamer(config: VoiceConfig): VoiceStreamer {
  return new VoiceStreamer(config);
}

