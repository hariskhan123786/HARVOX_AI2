/**
 * HARVOX AI - Microsoft Edge Neural TTS Provider
 * First fallback provider using Edge Speech Synthesis
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
 * Microsoft Edge Neural Voices
 * These are high-quality neural voices available through Edge browser
 */
export const EDGE_VOICES = {
  // Hindi Female Voices (DEFAULT for Hindi)
  'hi-IN-female-swara': {
    name: 'Microsoft Swara Online (Natural) - Hindi (India)',
    lang: 'hi-IN',
    gender: 'female',
    voiceName: 'hi-IN-SwaraNeural',
    isDefault: true
  },
  
  // Hindi Male Voices
  'hi-IN-male-madhur': {
    name: 'Microsoft Madhur Online (Natural) - Hindi (India)',
    lang: 'hi-IN',
    gender: 'male',
    voiceName: 'hi-IN-MadhurNeural'
  },
  
  // English Female Voices
  'en-US-female-aria': {
    name: 'Microsoft Aria Online (Natural) - English (United States)',
    lang: 'en-US',
    gender: 'female',
    voiceName: 'en-US-AriaNeural'
  },
  'en-US-female-jenny': {
    name: 'Microsoft Jenny Online (Natural) - English (United States)',
    lang: 'en-US',
    gender: 'female',
    voiceName: 'en-US-JennyNeural'
  },
  'en-US-female-michelle': {
    name: 'Microsoft Michelle Online (Natural) - English (United States)',
    lang: 'en-US',
    gender: 'female',
    voiceName: 'en-US-MichelleNeural'
  },
  
  // English Male Voices
  'en-US-male-guy': {
    name: 'Microsoft Guy Online (Natural) - English (United States)',
    lang: 'en-US',
    gender: 'male',
    voiceName: 'en-US-GuyNeural'
  },
  'en-US-male-eric': {
    name: 'Microsoft Eric Online (Natural) - English (United States)',
    lang: 'en-US',
    gender: 'male',
    voiceName: 'en-US-EricNeural'
  },
  
  // Urdu Voices (Pakistan)
  'ur-PK-female-uzma': {
    name: 'Microsoft Uzma Online (Natural) - Urdu (Pakistan)',
    lang: 'ur-PK',
    gender: 'female',
    voiceName: 'ur-PK-UzmaNeural'
  },
  'ur-PK-male-asad': {
    name: 'Microsoft Asad Online (Natural) - Urdu (Pakistan)',
    lang: 'ur-PK',
    gender: 'male',
    voiceName: 'ur-PK-AsadNeural'
  }
};

export class EdgeTTSProvider extends VoiceProvider {
  constructor(config = {}) {
    super(config);
    this.synth = null;
    this.voices = [];
    this.timeout = config.timeout || 10000; // 10 second timeout
    this._initializeSynth();
  }

  /**
   * Initialize speech synthesis
   */
  _initializeSynth() {
    if ('speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
      this._loadVoices();
      
      // Load voices when they change
      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = () => this._loadVoices();
      }
    }
  }

  /**
   * Load available voices
   */
  _loadVoices() {
    if (!this.synth) return;
    
    this.voices = this.synth.getVoices();
    
    if (process.env.NODE_ENV === 'development' && this.voices.length > 0) {
      console.log('[EdgeTTS] Loaded voices:', this.voices.length);
    }
  }

  getType() {
    return ProviderType.EDGE_TTS;
  }

  getName() {
    return 'Microsoft Edge TTS';
  }

  /**
   * Check if Edge TTS is available
   */
  async isAvailable() {
    try {
      if (!('speechSynthesis' in window)) {
        this.setStatus(ProviderStatus.UNAVAILABLE);
        return false;
      }

      // Ensure voices are loaded
      if (this.voices.length === 0) {
        this._loadVoices();
      }

      // Check if we have any neural voices
      const hasNeuralVoices = this.voices.some(v => 
        v.name.includes('Neural') || v.name.includes('Online')
      );

      if (hasNeuralVoices) {
        this.setStatus(ProviderStatus.AVAILABLE);
        return true;
      }

      // Fallback: any voices available
      if (this.voices.length > 0) {
        this.setStatus(ProviderStatus.AVAILABLE);
        return true;
      }

      this.setStatus(ProviderStatus.UNAVAILABLE);
      return false;
    } catch (error) {
      this.setStatus(ProviderStatus.UNAVAILABLE);
      return false;
    }
  }

  /**
   * Get available voices
   */
  async getVoices() {
    const voiceList = [];

    // Ensure voices are loaded
    if (this.voices.length === 0) {
      this._loadVoices();
      // Wait a bit for voices to load
      await new Promise(resolve => setTimeout(resolve, 100));
      if (this.voices.length === 0) {
        this.voices = this.synth?.getVoices() || [];
      }
    }

    for (const [key, edgeVoice] of Object.entries(EDGE_VOICES)) {
      // Try to find the exact voice
      const systemVoice = this.voices.find(v => 
        v.name.includes(edgeVoice.voiceName) ||
        (v.lang === edgeVoice.lang && v.name.includes('Neural'))
      );

      if (systemVoice) {
        voiceList.push(new VoiceMetadata({
          id: key,
          name: edgeVoice.name,
          language: edgeVoice.lang,
          gender: edgeVoice.gender,
          provider: ProviderType.EDGE_TTS,
          quality: VoiceQuality.HIGH,
          description: `Edge Neural Voice - ${edgeVoice.lang}`
        }));
      }
    }

    return voiceList;
  }

  /**
   * Synthesize speech using Edge TTS
   */
  async synthesize(text, options = {}) {
    const startTime = Date.now();

    try {
      // Check if synthesis is available
      if (!this.synth) {
        throw new Error('Speech synthesis not available');
      }

      // Ensure voices are loaded
      if (this.voices.length === 0) {
        this._loadVoices();
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // Clean text
      const cleanText = (text || '').replace(/[#*`\->_]/g, '').slice(0, 800).trim();
      if (!cleanText) {
        throw new Error('Empty text provided');
      }

      // Get voice
      const voiceId = options.voiceId || 'en-US-female-aria';
      const voice = this._findVoice(voiceId, options.language, options.gender);

      if (!voice) {
        if (process.env.NODE_ENV === 'development') {
          console.warn('[EdgeTTS] Voice not found:', voiceId, 'using default');
        }
      }

      if (process.env.NODE_ENV === 'development') {
        console.log('[EdgeTTS] Synthesizing:', {
          text: cleanText.slice(0, 50) + '...',
          voiceId,
          voice: voice?.name || 'default',
          length: cleanText.length
        });
      }

      // Create utterance
      const utterance = new SpeechSynthesisUtterance(cleanText);
      
      if (voice) {
        utterance.voice = voice;
        utterance.lang = voice.lang;
      } else {
        utterance.lang = options.language || 'en-US';
      }

      utterance.rate = options.speed || 1.0;
      utterance.pitch = options.pitch || 1.0;
      utterance.volume = options.volume || 1.0;

      // Create promise for speech synthesis
      const audioPromise = new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          this.synth.cancel();
          reject(new Error('Edge TTS timeout'));
        }, this.timeout);

        utterance.onstart = () => {
          if (process.env.NODE_ENV === 'development') {
            console.log('[EdgeTTS] Playback started');
          }
        };

        utterance.onend = () => {
          clearTimeout(timeout);
          const duration = Date.now() - startTime;
          if (process.env.NODE_ENV === 'development') {
            console.log('[EdgeTTS] Success:', { duration: `${duration}ms` });
          }
          resolve({ utterance, duration });
        };

        utterance.onerror = (event) => {
          clearTimeout(timeout);
          this.synth.cancel();
          reject(new Error(`Edge TTS error: ${event.error}`));
        };
      });

      // Cancel any ongoing speech
      this.synth.cancel();

      // Start speaking
      this.synth.speak(utterance);

      // Wait for completion
      const result = await audioPromise;

      // Mark as available
      this.setStatus(ProviderStatus.AVAILABLE);

      return {
        audio: utterance, // Return utterance for control
        duration: result.duration
      };

    } catch (error) {
      const errorType = this._categorizeError(error);
      this.handleError(error, errorType);

      if (process.env.NODE_ENV === 'development') {
        console.error('[EdgeTTS] Synthesis failed:', {
          error: error.message,
          type: errorType,
          duration: `${Date.now() - startTime}ms`
        });
      }

      throw error;
    }
  }

  /**
   * Find appropriate voice
   */
  _findVoice(voiceId, language, gender) {
    // If voiceId is in EDGE_VOICES, try to find matching system voice
    if (EDGE_VOICES[voiceId]) {
      const edgeVoice = EDGE_VOICES[voiceId];
      
      // Try exact match by voice name
      let voice = this.voices.find(v => v.name.includes(edgeVoice.voiceName));
      if (voice) return voice;

      // Try match by language and neural
      voice = this.voices.find(v => 
        v.lang === edgeVoice.lang && 
        (v.name.includes('Neural') || v.name.includes('Online'))
      );
      if (voice) return voice;

      // Try match by language only
      voice = this.voices.find(v => v.lang === edgeVoice.lang);
      if (voice) return voice;
    }

    // Try to find by language and gender
    if (language || gender) {
      const voice = this.voices.find(v => {
        const matchLang = !language || v.lang.startsWith(language);
        const matchGender = !gender || v.name.toLowerCase().includes(gender);
        const isNeural = v.name.includes('Neural') || v.name.includes('Online');
        return matchLang && matchGender && isNeural;
      });
      if (voice) return voice;
    }

    // Default to first available neural voice
    return this.voices.find(v => 
      v.name.includes('Neural') || v.name.includes('Online')
    ) || this.voices[0];
  }

  /**
   * Categorize error type
   */
  _categorizeError(error) {
    const msg = error.message.toLowerCase();

    if (msg.includes('timeout')) {
      return ProviderErrorType.TIMEOUT;
    }

    if (msg.includes('network') || msg.includes('connection')) {
      return ProviderErrorType.NETWORK_ERROR;
    }

    if (msg.includes('not available') || msg.includes('not supported')) {
      return ProviderErrorType.PROVIDER_UNAVAILABLE;
    }

    return ProviderErrorType.UNKNOWN;
  }

  /**
   * Cleanup
   */
  cleanup() {
    if (this.synth) {
      this.synth.cancel();
    }
  }
}

export default EdgeTTSProvider;
