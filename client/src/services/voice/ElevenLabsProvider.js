/**
 * HARVOX AI - ElevenLabs TTS Provider
 * Primary voice provider with quota detection and error handling
 */

import {
  VoiceProvider,
  ProviderType,
  ProviderStatus,
  ProviderErrorType,
  VoiceMetadata,
  VoiceQuality
} from './VoiceProvider.js';
import { aiAPI } from '../api.js';

/**
 * ElevenLabs Voice IDs (matching VoiceAssistant configuration)
 * Note: ElevenLabs voices are primarily English voices with multilingual capabilities
 * For Hindi/Urdu text, we rely on fallback providers (Edge TTS / Browser Speech)
 */
export const ELEVENLABS_VOICES = {
  // Female Hindi Voices (Multilingual English voices that can speak Hindi)
  'hi-IN-female-premium': { id: 'cgSgspJ2msm6clMCkdW9', name: 'Hindi Female Premium (Priya)', language: 'hi-IN', gender: 'female', isDefault: true, multilingual: true },
  'hi-IN-female-1': { id: '21m00Tcm4TlvDq8ikWAM', name: 'Hindi Female 1 (Rachel)', language: 'hi-IN', gender: 'female', multilingual: true },
  'hi-IN-female-2': { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Hindi Female 2 (Sarah)', language: 'hi-IN', gender: 'female', multilingual: true },
  'hi-IN-female-3': { id: 'XB0fDUnUDz4sSJJ5qy5z', name: 'Hindi Female 3 (Charlotte)', language: 'hi-IN', gender: 'female', multilingual: true },
  
  // Male Hindi Voices
  'hi-IN-male-1': { id: 'pNInz6obpgfrhhF2E4DY', name: 'Hindi Male 1 (Adam)', language: 'hi-IN', gender: 'male', multilingual: true },
  'hi-IN-male-2': { id: 'ErXwobaYiN019PkySvjV', name: 'Hindi Male 2 (Antoni)', language: 'hi-IN', gender: 'male', multilingual: true },
  'hi-IN-male-3': { id: 'onwF48T1CtxCmqQRPOHJ', name: 'Hindi Male 3 (Daniel)', language: 'hi-IN', gender: 'male', multilingual: true },
  
  // Urdu Voices
  'ur-PK-female-1': { id: 'ohvvU75FpBEB8fdaLOMh', name: 'Urdu Female 1', language: 'ur-PK', gender: 'female', multilingual: true },
  'ur-PK-female-2': { id: 'VG7gYikNQ71LJ52W9fAD', name: 'Urdu Female 2 (Priya)', language: 'ur-PK', gender: 'female', multilingual: true },
  'ur-PK-male-1': { id: 'CYZATuZ1tjgW8es1QfPG', name: 'Urdu Male', language: 'ur-PK', gender: 'male', multilingual: true },
  
  // English Female Voices (Native English)
  'en-US-female-emily': { id: 'Lcfc5ZowlhAlwG5vBb22', name: 'Emily (Calm)', language: 'en-US', gender: 'female', multilingual: false },
  'en-US-female-rachel': { id: '21m00Tcm4TlvDq8ikWAM', name: 'Rachel', language: 'en-US', gender: 'female', multilingual: true },
  'en-US-female-bella': { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Bella', language: 'en-US', gender: 'female', multilingual: true },
  
  // English Male Voices (Native English)
  'en-US-male-charlie': { id: 'IKne3meq5aKbA1x0m7Ed', name: 'Charlie (Conversational)', language: 'en-US', gender: 'male', multilingual: false },
  'en-US-male-adam': { id: 'pNInz6obpgfrhhF2E4DY', name: 'Adam', language: 'en-US', gender: 'male', multilingual: true },
  'en-US-male-josh': { id: 'TxGEqnHWrfWFTfGW9XjX', name: 'Josh', language: 'en-US', gender: 'male', multilingual: true }
};

// Default voice ID - Hindi Female Premium
export const DEFAULT_VOICE_ID = 'cgSgspJ2msm6clMCkdW9';

/**
 * Check if text contains non-Latin scripts (Hindi, Urdu, etc.)
 */
function hasNonLatinScript(text) {
  // Devanagari (Hindi): U+0900–U+097F
  // Arabic/Urdu: U+0600–U+06FF
  return /[\u0900-\u097F\u0600-\u06FF]/.test(text);
}

export class ElevenLabsProvider extends VoiceProvider {
  constructor(config = {}) {
    super(config);
    this.apiKey = config.apiKey || null;
    this.timeout = config.timeout || 15000; // 15 second timeout
    this.maxRetries = config.maxRetries || 2;
  }

  getType() {
    return ProviderType.ELEVENLABS;
  }

  getName() {
    return 'ElevenLabs';
  }

  /**
   * Check if provider is available
   */
  async isAvailable() {
    try {
      // Quick health check - don't actually call API to save quota
      // Just verify we have what we need
      if (!aiAPI || !aiAPI.tts) {
        this.setStatus(ProviderStatus.UNAVAILABLE);
        return false;
      }

      // If we recently had a quota error, consider unavailable
      if (this.status === ProviderStatus.QUOTA_EXCEEDED) {
        const timeSinceError = Date.now() - (this.lastErrorTime || 0);
        // Don't retry for 5 minutes after quota exceeded
        if (timeSinceError < 5 * 60 * 1000) {
          return false;
        }
      }

      this.setStatus(ProviderStatus.AVAILABLE);
      return true;
    } catch (error) {
      this.setStatus(ProviderStatus.UNAVAILABLE);
      return false;
    }
  }

  /**
   * Get available voices
   */
  async getVoices() {
    const voices = [];
    
    for (const [key, voice] of Object.entries(ELEVENLABS_VOICES)) {
      voices.push(new VoiceMetadata({
        id: voice.id,
        name: voice.name,
        language: voice.language,
        gender: voice.gender,
        provider: ProviderType.ELEVENLABS,
        quality: VoiceQuality.HIGH,
        description: `ElevenLabs ${voice.name}${voice.multilingual ? ' (Multilingual)' : ''}`
      }));
    }

    return voices;
  }

  /**
   * Check if text contains non-Latin scripts (Hindi, Urdu, etc.)
   */
  _hasNonLatinScript(text) {
    // Devanagari (Hindi): U+0900–U+097F
    // Arabic/Urdu: U+0600–U+06FF
    return /[\u0900-\u097F\u0600-\u06FF]/.test(text);
  }

  /**
   * Synthesize speech using ElevenLabs API
   */
  async synthesize(text, options = {}) {
    const startTime = Date.now();

    try {
      // Clean text
      const cleanText = (text || '').replace(/[#*`\->_]/g, '').slice(0, 800).trim();
      if (!cleanText) {
        throw new Error('Empty text provided');
      }

      // IMPORTANT: Skip ElevenLabs for Hindi/Urdu scripts
      // ElevenLabs works best with English/Latin text
      // For Hindi/Urdu, we use Edge TTS or Browser Speech instead
      if (this._hasNonLatinScript(cleanText)) {
        if (process.env.NODE_ENV === 'development') {
          console.log('[ElevenLabs] Skipping - Hindi/Urdu text detected, using fallback provider');
        }
        // Throw error to trigger automatic fallback to Edge TTS / Browser Speech
        throw new Error('SKIP_FOR_NON_LATIN: ElevenLabs works best with English text');
      }

      // Get voice ID - with smart defaults for English
      let voiceId = options.voiceId;
      
      // Auto-select voice if not specified
      if (!voiceId) {
        const language = options.language || 'en-US';
        const gender = options.gender || 'female';
        
        // For English, use native English voices
        // For Hindi/Urdu requests, we already skipped above
        const matchingVoice = Object.values(ELEVENLABS_VOICES).find(v => 
          v.language === language && v.gender === gender
        );
        
        voiceId = matchingVoice?.id || DEFAULT_VOICE_ID;
        
        if (process.env.NODE_ENV === 'development') {
          console.log('[ElevenLabs] Auto-selected voice:', {
            language,
            gender,
            voiceId,
            name: matchingVoice?.name || 'Default'
          });
        }
      }

      if (process.env.NODE_ENV === 'development') {
        console.log('[ElevenLabs] Synthesizing:', {
          text: cleanText.slice(0, 50) + '...',
          voiceId,
          length: cleanText.length
        });
      }

      // Call ElevenLabs API with timeout
      const response = await Promise.race([
        aiAPI.tts({ text: cleanText, voiceId }),
        this._timeoutPromise(this.timeout)
      ]);

      // Check for errors in response
      if (!response || !response.data) {
        throw new Error('Invalid API response');
      }

      if (response.data.error) {
        this._handleAPIError(response.data.error);
        throw new Error(response.data.error);
      }

      // Check for audio data
      if (!response.data.audioBase64) {
        throw new Error('No audio data in response');
      }

      // Create audio element
      const audio = new Audio(`data:audio/mpeg;base64,${response.data.audioBase64}`);
      audio.playbackRate = options.speed || 1.0;

      // Calculate duration (estimate based on text length)
      const duration = this._estimateDuration(cleanText, options.speed || 1.0);

      // Mark as available on success
      this.setStatus(ProviderStatus.AVAILABLE);

      if (process.env.NODE_ENV === 'development') {
        console.log('[ElevenLabs] Success:', {
          duration: `${Date.now() - startTime}ms`,
          audioLength: response.data.audioBase64.length
        });
      }

      return { audio, duration };

    } catch (error) {
      // Determine error type
      const errorType = this._categorizeError(error);
      this.handleError(error, errorType);

      // Log detailed error in development
      if (process.env.NODE_ENV === 'development') {
        console.error('[ElevenLabs] Synthesis failed:', {
          error: error.message,
          type: errorType,
          duration: `${Date.now() - startTime}ms`
        });
      }

      throw error;
    }
  }

  /**
   * Handle API-specific errors
   */
  _handleAPIError(errorMessage) {
    const msg = errorMessage.toLowerCase();

    // Quota exceeded patterns
    if (msg.includes('quota') || msg.includes('limit') || msg.includes('exceeded')) {
      throw new Error('QUOTA_EXCEEDED: ' + errorMessage);
    }

    // Rate limit patterns
    if (msg.includes('rate') || msg.includes('429') || msg.includes('too many')) {
      throw new Error('RATE_LIMIT: ' + errorMessage);
    }

    // Invalid API key
    if (msg.includes('unauthorized') || msg.includes('invalid') || msg.includes('401')) {
      throw new Error('INVALID_KEY: ' + errorMessage);
    }

    // Generic error
    throw new Error(errorMessage);
  }

  /**
   * Categorize error type
   */
  _categorizeError(error) {
    const msg = error.message.toLowerCase();

    // Quota exceeded
    if (msg.includes('quota_exceeded') || msg.includes('quota') || msg.includes('character limit')) {
      return ProviderErrorType.QUOTA_EXCEEDED;
    }

    // Rate limit
    if (msg.includes('rate_limit') || msg.includes('429') || msg.includes('too many requests')) {
      return ProviderErrorType.RATE_LIMIT;
    }

    // Invalid API key
    if (msg.includes('invalid_key') || msg.includes('unauthorized') || msg.includes('401')) {
      return ProviderErrorType.INVALID_KEY;
    }

    // Timeout
    if (msg.includes('timeout') || msg.includes('timed out')) {
      return ProviderErrorType.TIMEOUT;
    }

    // Network error
    if (msg.includes('network') || msg.includes('fetch') || msg.includes('connection')) {
      return ProviderErrorType.NETWORK_ERROR;
    }

    return ProviderErrorType.UNKNOWN;
  }

  /**
   * Create timeout promise
   */
  _timeoutPromise(ms) {
    return new Promise((_, reject) => {
      setTimeout(() => reject(new Error(`Timeout after ${ms}ms`)), ms);
    });
  }

  /**
   * Estimate audio duration based on text length
   * Average speaking rate: ~150 words per minute
   */
  _estimateDuration(text, speed = 1.0) {
    const words = text.split(/\s+/).length;
    const baseSeconds = (words / 150) * 60; // 150 WPM
    return (baseSeconds / speed) * 1000; // Convert to ms
  }

  /**
   * Cleanup
   */
  cleanup() {
    // Nothing to cleanup for ElevenLabs
  }
}

export default ElevenLabsProvider;
