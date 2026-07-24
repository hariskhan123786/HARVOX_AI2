/**
 * HARVOX AI - Browser SpeechSynthesis Provider
 * Final fallback provider using native browser speech synthesis
 * Works offline, no API key required, unlimited usage
 */

import {
  VoiceProvider,
  ProviderType,
  ProviderStatus,
  ProviderErrorType,
  VoiceMetadata,
  VoiceQuality
} from './VoiceProvider.js';

export class BrowserSpeechProvider extends VoiceProvider {
  constructor(config = {}) {
    super(config);
    this.synth = null;
    this.voices = [];
    this.timeout = config.timeout || 30000; // 30 second timeout for long text
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
      console.log('[BrowserSpeech] Loaded voices:', this.voices.length);
    }
  }

  getType() {
    return ProviderType.BROWSER_SPEECH;
  }

  getName() {
    return 'Browser Speech';
  }

  /**
   * Check if browser speech is available
   * This should always be available in modern browsers
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

      // Browser speech synthesis should always work if speechSynthesis exists
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

    // Group voices by language and gender
    const voiceMap = new Map();

    for (const voice of this.voices) {
      const lang = voice.lang.split('-')[0]; // e.g., 'en' from 'en-US'
      const gender = this._detectGender(voice.name);
      const key = `${lang}-${gender}`;

      if (!voiceMap.has(key)) {
        voiceMap.set(key, voice);
      }
    }

    // Create voice metadata for each unique language-gender combination
    for (const [key, voice] of voiceMap) {
      const [lang, gender] = key.split('-');
      
      voiceList.push(new VoiceMetadata({
        id: voice.name,
        name: voice.name,
        language: voice.lang,
        gender: gender,
        provider: ProviderType.BROWSER_SPEECH,
        quality: VoiceQuality.MEDIUM,
        description: `Browser Voice - ${voice.lang}`,
      }));
    }

    return voiceList;
  }

  /**
   * Synthesize speech using browser SpeechSynthesis
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
      const voice = this._findVoice(options.language, options.gender);

      if (process.env.NODE_ENV === 'development') {
        console.log('[BrowserSpeech] Synthesizing:', {
          text: cleanText.slice(0, 50) + '...',
          voice: voice?.name || 'default',
          language: options.language || 'auto',
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
          reject(new Error('Browser speech timeout'));
        }, this.timeout);

        utterance.onstart = () => {
          if (process.env.NODE_ENV === 'development') {
            console.log('[BrowserSpeech] Playback started');
          }
        };

        utterance.onend = () => {
          clearTimeout(timeout);
          const duration = Date.now() - startTime;
          if (process.env.NODE_ENV === 'development') {
            console.log('[BrowserSpeech] Success:', { duration: `${duration}ms` });
          }
          resolve({ utterance, duration });
        };

        utterance.onerror = (event) => {
          clearTimeout(timeout);
          this.synth.cancel();
          reject(new Error(`Browser speech error: ${event.error}`));
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
        console.error('[BrowserSpeech] Synthesis failed:', {
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
  _findVoice(language, gender) {
    if (this.voices.length === 0) return null;

    // Try to find exact match
    let voice = this.voices.find(v => {
      const matchLang = !language || v.lang.startsWith(language);
      const matchGender = !gender || this._detectGender(v.name) === gender;
      return matchLang && matchGender;
    });

    if (voice) return voice;

    // Try language only
    if (language) {
      voice = this.voices.find(v => v.lang.startsWith(language));
      if (voice) return voice;
    }

    // Try gender only
    if (gender) {
      voice = this.voices.find(v => this._detectGender(v.name) === gender);
      if (voice) return voice;
    }

    // Return first voice or default
    return this.voices[0] || null;
  }

  /**
   * Detect gender from voice name
   */
  _detectGender(name) {
    const nameLower = name.toLowerCase();
    
    // Female indicators
    if (nameLower.includes('female') || 
        nameLower.includes('woman') ||
        nameLower.includes('zira') ||
        nameLower.includes('hazel') ||
        nameLower.includes('samantha') ||
        nameLower.includes('victoria') ||
        nameLower.includes('karen') ||
        nameLower.includes('susan') ||
        nameLower.includes('fiona')) {
      return 'female';
    }

    // Male indicators
    if (nameLower.includes('male') ||
        nameLower.includes('man') ||
        nameLower.includes('david') ||
        nameLower.includes('daniel') ||
        nameLower.includes('rishi') ||
        nameLower.includes('james') ||
        nameLower.includes('tom') ||
        nameLower.includes('george')) {
      return 'male';
    }

    // Default to female if unknown
    return 'female';
  }

  /**
   * Categorize error type
   */
  _categorizeError(error) {
    const msg = error.message.toLowerCase();

    if (msg.includes('timeout')) {
      return ProviderErrorType.TIMEOUT;
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

export default BrowserSpeechProvider;
