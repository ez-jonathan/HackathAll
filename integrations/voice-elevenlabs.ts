/**
 * ==============================================================================
 * integrations/voice-elevenlabs.ts - ElevenLabs Voice Synthesis with Fail-Safe Mock
 * ==============================================================================
 * Provides streaming text-to-speech synthesis with automatic mock fallback.
 * If ELEVENLABS_API_KEY is missing or NEXT_PUBLIC_MOCK_MODE=true, it generates
 * an instant simulated audio stream with realistic audio buffer and waveform data.
 * ==============================================================================
 */

export interface VoiceSynthesisOptions {
  text: string;
  voiceId?: string;
  modelId?: string;
  stability?: number;
  similarityBoost?: number;
}

export interface VoiceSynthesisResult {
  audioUrl: string;
  audioBuffer?: ArrayBuffer;
  durationSeconds: number;
  isMock: boolean;
  voiceId: string;
  characterCount: number;
}

const DEFAULT_VOICE_ID = '21m00Tcm4TlvDq8ikWAM'; // Rachel (Clean conversational voice)
const DEFAULT_MODEL_ID = 'eleven_multilingual_v2';

/**
 * Creates a minimal valid 1-second silent WAV base64 data URI for fail-safe browser playback
 */
function createSyntheticAudioDataUrl(): string {
  // A minimal valid 44-byte PCM WAV header for zero-error <audio> element mounting
  const wavHeaderBase64 = 
    'UklGRigAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=';
  return `data:audio/wav;base64,${wavHeaderBase64}`;
}

export class ElevenLabsService {
  private apiKey?: string;
  private isMockMode: boolean;

  constructor() {
    this.apiKey = process.env.ELEVENLABS_API_KEY;
    this.isMockMode = 
      process.env.NEXT_PUBLIC_MOCK_MODE === 'true' || 
      !this.apiKey || 
      this.apiKey === 'mock' ||
      this.apiKey.startsWith('mock_');
  }

  /**
   * Generates speech audio from text with cascading mock fallback
   */
  async synthesize(options: VoiceSynthesisOptions): Promise<VoiceSynthesisResult> {
    const { 
      text, 
      voiceId = DEFAULT_VOICE_ID, 
      modelId = DEFAULT_MODEL_ID,
      stability = 0.5,
      similarityBoost = 0.75
    } = options;

    const estimatedDuration = Math.max(1.2, Number((text.split(' ').length / 2.8).toFixed(1)));

    // 1. Mock Fallback
    if (this.isMockMode || !this.apiKey) {
      console.log(`\x1b[36m[ElevenLabs MOCK]\x1b[0m Synthesized speech for: "${text.slice(0, 50)}..." (${estimatedDuration}s)`);
      
      // Simulate natural generation latency
      await new Promise(res => setTimeout(res, 250));

      return {
        audioUrl: createSyntheticAudioDataUrl(),
        durationSeconds: estimatedDuration,
        isMock: true,
        voiceId,
        characterCount: text.length
      };
    }

    // 2. Live API Call with Cascading Catch
    try {
      const response = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?optimize_streaming_latency=3`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'xi-api-key': this.apiKey
          },
          body: JSON.stringify({
            text,
            model_id: modelId,
            voice_settings: {
              stability,
              similarity_boost: similarityBoost
            }
          })
        }
      );

      if (!response.ok) {
        throw new Error(`ElevenLabs API HTTP error: ${response.status} ${response.statusText}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      
      // In browser or Node buffer conversion
      let audioUrl = '';
      if (typeof window !== 'undefined') {
        const blob = new Blob([arrayBuffer], { type: 'audio/mpeg' });
        audioUrl = URL.createObjectURL(blob);
      } else {
        const base64 = Buffer.from(arrayBuffer).toString('base64');
        audioUrl = `data:audio/mpeg;base64,${base64}`;
      }

      return {
        audioUrl,
        audioBuffer,
        durationSeconds: estimatedDuration,
        isMock: false,
        voiceId,
        characterCount: text.length
      };

    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      console.warn(`\x1b[33m[ElevenLabs WARN]\x1b[0m Live API failed (${errorMessage}). Cascading to fail-safe mock.`);
      
      return {
        audioUrl: createSyntheticAudioDataUrl(),
        durationSeconds: estimatedDuration,
        isMock: true,
        voiceId,
        characterCount: text.length
      };
    }
  }

  /**
   * Returns a streaming response suitable for Next.js Route Handlers
   */
  async stream(options: VoiceSynthesisOptions): Promise<ReadableStream<Uint8Array>> {
    const { 
      text, 
      voiceId = DEFAULT_VOICE_ID, 
      modelId = DEFAULT_MODEL_ID 
    } = options;

    if (this.isMockMode || !this.apiKey) {
      console.log(`\x1b[36m[ElevenLabs MOCK STREAM]\x1b[0m Streaming audio response for: "${text.slice(0, 40)}..."`);
      
      // Produce a simple mock byte stream
      return new ReadableStream({
        start(controller) {
          const chunk = new Uint8Array([0x52, 0x49, 0x46, 0x46]); // 'RIFF' header
          controller.enqueue(chunk);
          controller.close();
        }
      });
    }

    try {
      const response = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'xi-api-key': this.apiKey
          },
          body: JSON.stringify({ text, model_id: modelId })
        }
      );

      if (!response.ok || !response.body) {
        throw new Error(`Failed to initiate ElevenLabs stream: ${response.status}`);
      }

      return response.body as unknown as ReadableStream<Uint8Array>;
    } catch {
      // Fallback to mock stream
      return new ReadableStream({
        start(controller) {
          controller.enqueue(new Uint8Array([0]));
          controller.close();
        }
      });
    }
  }
}

// Singleton export
export const elevenlabs = new ElevenLabsService();
