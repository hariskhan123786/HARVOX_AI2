/**
 * HARVOX AI - CVoice AI TTS Provider
 * Secondary voice provider with multilingual support (Hindi/Urdu/English)
 */

import {
  VoiceProvider,
  ProviderType,
  ProviderStatus,
  ProviderErrorType,
  VoiceMetadata,
  VoiceQuality
} from './VoiceProvider.js';

/**
 * CVoice AI Voice Catalog
 * Organized by language and gender
 */
export const CVOICE_VOICES = {
  // Hindi Female Voices (Default)
  'hi-IN-female-1': {
    id: 'hi-IN-neural-female-1',
    name: 'Priya (Hindi Female)',
    language: 'hi-IN',
    gender: 'female',
    isDefault: true,
    quality: 'high',
    neural: true
  },
  'hi-IN-female-2': {
    id: 'hi-IN-neural-female-2',
    name: 'Ananya (Hindi Female)',
    language: 'hi-IN',
    gender: 'female',
    quality: 'high',
    neural: true
  },
  'hi-IN-female-3': {
    id: 'hi-IN-neural-female-3',
    name: 'Kavya (Hindi Female)',
    language: 'hi-IN',
    gender: 'female',
    quality: 'high',
    neural: true
  },
  'hi-IN-female-4': {
    id: 'hi-IN-standard-female',
    name: 'Maya (Hindi Female)',
    language: 'hi-IN',
    gender: 'female',
    quality: 'medium',
    neural: false
  },
  
  // Hindi Male Voices
  'hi-IN-male-1': {
    id: 'hi-IN-neural-male-1',
    name: 'Arjun (Hindi Male)',
    language: 'hi-IN',
    gender: 'male',
    quality: 'high',
    neural: true
  },
  'hi-IN-male-2': {
    id: 'hi-IN-neural-male-2',
    name: 'Rohan (Hindi Male)',
    language: 'hi-IN',
    gender: 'male',
    quality: 'high',
    neural: true
  },
  'hi-IN-male-3': {
    id: 'hi-IN-standard-male',
    name: 'Vikram (Hindi Male)',
    language: 'hi-IN',
    gender: 'male',
    quality: 'medium',
    neural: false
  },
  
  // Urdu Female Voices
  'ur-PK-female-1': {
    id: 'ur-PK-neural-female-1',
    name: 'Aisha (Urdu Female)',
    language: 'ur-PK',
    gender: 'female',
    quality: 'high',
    neural: true
  },
  'ur-PK-female-2': {
    id: 'ur-PK-neural-female-2',
    name: 'Zainab (Urdu Female)',
    language: 'ur-PK',
    gender: 'female',
    quality: 'high',
    neural: true
  },
  'ur-PK-female-3': {
    id: 'ur-PK-standard-female',
    name: 'Fatima (Urdu Female)',
    language: 'ur-PK',
    gender: 'female',
    quality: 'medium',
    neural: false
  },
  
  // Urdu Male Voices
  'ur-PK-male-1': {
    id: 'ur-PK-neural-male-1',
    name: 'Hassan (Urdu Male)',
    language: 'ur-PK',
    gender: 'male',
    quality: 'high',
    neural: true
  },
  'ur-PK-male-2': {
    id: 'ur-PK-standard-male',
    name: 'Ali (Urdu Male)',
    language: 'ur-PK',
    gender: 'male',
    quality: 'medium',
    neural: false
  },
  
  // English Female Voices
  'en-US-female-1': {
    id: 'en-US-neural-female-1',
    name: 'Emma (English Female)',
    language: 'en-US',
    gender: 'female',
    quality: 'high',
    neural: true
  },
  'en-US-female-2': {
    id: 'en-US-neural-female-2',
    name: 'Olivia (English Female)',
    language: 'en-US',
    gender: 'female',
    quality: 'high',
    neural: true
  },
  'en-US-female-3': {
    id: 'en-US-neural-female-3',
    name: 'Sophia (English Female)',
    language: 'en-US',
    gender: 'female',
    quality: 'high',
    neural: true
  },
  'en-US-female-4': {
    id: 'en-US-standard-female',
    name: 'Grace (English Female)',
    language: 'en-US',
    gender: 'female',
    quality: 'medium',
    neural: false
  },
  
  // English Male Voices
  'en-US-male-1': {
    id: 'en-US-neural-male-1',
    name: 'James (English Male)',
    language: 'en-US',
    gender: 'male',
    quality: 'high',
    neural: true
  },
  'en-US-male-2': {
    id: 'en-US-neural-male-2',
    name: 'Michael (English Male)',
    language: 'en-US',
    gender: 'male',
    quality: 'high',
    neural: true
  },
  'en-US-male-3': {
    id: 'en-US-standard-male',
    name: 'David (English Male)',
    language: 'en-US',
    gender: 'male',
    quality: 'medium',
    neural: false
  }
};

// Default voice ID - Hindi Female Neural
export const DEFAULT_CVOICE_ID = 'hi-IN-neural-female-1';

export class CVoiceProvider extends VoiceProvider {
  constructor(config = {}) {
    super(config);
    this.apiEndpoint = config.apiEndpoint || `${import.meta.env.VITE_API_URL}/ai/voice/speak`;
    this.timeout = config.timeout || 15000; // 15 second timeout
    this.maxRetries = config.maxRetries || 2;
    this.supportsStreaming = false; // Server-side synthesis doesn't support streaming yet
  }

  getType() {
    return 'cvoice';
  }

  getName() {
    return 'CVoice AI';
  }

  /**
   * Check if CVoice AI is available
   */
  async isAvailable() {
    try {
      // CVoice is server-side, so we just check if the API is accessible
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
    
    for (const [key, voice] of Object.entries(CVOICE_VOICES)) {
      voices.push(new VoiceMetadata({
        id: voice.id,
        name: voice.name,
        language: voice.language,
        gender: voice.gender,
        provider: 'cvoice',
        quality: voice.quality === 'high' ? VoiceQuality.HIGH : VoiceQuality.MEDIUM,
        description: `CVoice ${voice.name}${voice.neural ? ' (Neural)' : ''}`
      }));
    }

    return voices;
  }

  /**
   * Fetch available voices from server API
   * Fallback to static catalog if API fails
   */
  async fetchVoicesFromAPI() {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/ai/voice/list`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        signal: AbortSignal.timeout(5000) // 5 second timeout for voice listing
      });

      if (!response.ok) {
        throw new Error(`API returned ${response.status}`);
      }

      const data = await response.json();
      
      if (data && data.cvoiceVoices && Array.isArray(data.cvoiceVoices)) {
        // Convert API voices to our format
        return data.cvoiceVoices.map(v => new VoiceMetadata({
          id: v.id,
          name: v.name,
          language: v.language,
          gender: v.gender,
          provider: 'cvoice',
          quality: v.quality === 'high' ? VoiceQuality.HIGH : VoiceQuality.MEDIUM,
          description: `CVoice ${v.name}`
        }));
      }

      // Fallback to static catalog
      return this.getVoices();
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('[CVoice] Failed to fetch voices from API, using static catalog:', error.message);
      }
      // Fallback to static catalog
      return this.getVoices();
    }
  }

  /**
   * Synthesize speech using CVoice AI via server API
   */
  async synthesize(text, options = {}) {
    const startTime = Date.now();

    try {
      // Clean text
      const cleanText = (text || '').replace(/[#*`\->_]/g, '').slice(0, 2000).trim();
      if (!cleanText) {
        throw new Error('Empty text provided');
      }

      // Get voice ID - with smart defaults
      let voiceId = options.voiceId;
      
      // Auto-select voice if not specified
      if (!voiceId) {
        const language = options.language || 'hi';
        const gender = options.gender || 'female';
        
        // Find matching voice
        const matchingVoice = Object.values(CVOICE_VOICES).find(v => 
          v.language.startsWith(language) && v.gender === gender && v.neural
        );
        
        // Fallback to any voice for that language/gender
        const fallbackVoice = Object.values(CVOICE_VOICES).find(v => 
          v.language.startsWith(language) && v.gender === gender
        );
        
        voiceId = (matchingVoice || fallbackVoice || CVOICE_VOICES['hi-IN-female-1']).id;
        
        if (process.env.NODE_ENV === 'development') {
          console.log('[CVoice] Auto-selected voice:', {
            language,
            gender,
            voiceId,
            name: (matchingVoice || fallbackVoice)?.name || 'Default'
          });
        }
      }

      if (process.env.NODE_ENV === 'development') {
        console.log('[CVoice] Synthesizing:', {
          text: cleanText.slice(0, 50) + '...',
          voiceId,
          length: cleanText.length
        });
      }

      // Call server API with timeout
      const response = await Promise.race([
        fetch(this.apiEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            text: cleanText,
            language: options.language || 'hi',
            voiceId: voiceId,
            provider: 'cvoice'
          })
        }),
        this._timeoutPromise(this.timeout)
      ]);

      // Check for errors
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Server returned ${response.status}`);
      }

      const data = await response.json();

      // Check if synthesis was successful
      if (!data.success || !data.audioBase64) {
        throw new Error(data.error || 'Synthesis failed');
      }

      // Convert base64 to audio URL
      const audioBlob = this._base64ToBlob(data.audioBase64, 'audio/mpeg');
      const audioUrl = URL.createObjectURL(audioBlob);

      const duration = Date.now() - startTime;

      if (process.env.NODE_ENV === 'development') {
        console.log(`[CVoice] Synthesis successful (${duration}ms)`);
      }

      this.setStatus(ProviderStatus.AVAILABLE);

      return {
        audioUrl,
        text: cleanText,
        duration,
        voiceId,
        provider: this.getType()
      };

    } catch (error) {
      const duration = Date.now() - startTime;
      
      if (process.env.NODE_ENV === 'development') {
        console.error(`[CVoice] Synthesis failed (${duration}ms):`, error.message);
      }

      this.setStatus(ProviderStatus.ERROR);
      this.lastError = error;
      this.lastErrorTime = Date.now();

      throw error;
    }
  }

  /**
   * Convert base64 to Blob
   */
  _base64ToBlob(base64, mimeType) {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: mimeType });
  }

  /**
   * Check if streaming is supported (CVoice does support it, but not through server API yet)
   */
  supportsStreamingSynthesis() {
    return false; // Server-side synthesis doesn't support streaming yet
  }

  /**
   * Timeout promise helper
   */
  _timeoutPromise(ms) {
    return new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Request timeout')), ms);
    });
  }

  /**
   * Cleanup resources
   */
  async cleanup() {
    // No persistent resources to clean up for server-side provider
    this.setStatus(ProviderStatus.IDLE);
  }
}

export default CVoiceProvider;
