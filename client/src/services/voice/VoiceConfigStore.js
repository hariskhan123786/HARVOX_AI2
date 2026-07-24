/**
 * HARVOX AI - Voice Configuration Store
 * Persists voice settings and provider preferences
 */

import { ProviderType } from './VoiceProvider.js';

const STORAGE_KEY = 'harvox_voice_config';

/**
 * Default voice configuration
 */
const DEFAULT_CONFIG = {
  // Provider settings
  preferredProvider: ProviderType.AUTO,
  autoFallback: true,
  
  // Voice selection
  // NOTE: ElevenLabs works best with English, so we use Edge TTS/Browser for Hindi/Urdu
  voiceId: null, // Auto-select based on language/gender
  language: 'hi-IN', // Default to Hindi - will use Edge TTS/Browser
  gender: 'female', // Default to female
  
  // Voice parameters
  speed: 1.0,
  pitch: 1.0,
  volume: 1.0,
  quality: 'high',
  streaming: true,
  
  // Cache settings
  useCache: true,
  cacheSize: 50,
  cacheMaxAge: 3600000, // 1 hour
  
  // Restoration settings
  restorationCheckInterval: 60000, // 1 minute
  
  // Provider-specific settings
  elevenLabs: {
    timeout: 15000,
    maxRetries: 2,
    // Skip ElevenLabs for non-Latin scripts (Hindi, Urdu, etc.)
    skipForNonLatin: true
  },
  edgeTTS: {
    timeout: 10000
  },
  browserSpeech: {
    timeout: 30000
  }
};

/**
 * Voice Configuration Store
 */
export class VoiceConfigStore {
  constructor() {
    this.config = this._loadConfig();
    this.listeners = new Set();
  }

  /**
   * Load configuration from localStorage
   */
  _loadConfig() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return { ...DEFAULT_CONFIG, ...parsed };
      }
    } catch (error) {
      console.warn('[VoiceConfigStore] Failed to load config:', error);
    }
    return { ...DEFAULT_CONFIG };
  }

  /**
   * Save configuration to localStorage
   */
  _saveConfig() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.config));
      this._notifyListeners();
    } catch (error) {
      console.warn('[VoiceConfigStore] Failed to save config:', error);
    }
  }

  /**
   * Get full configuration
   */
  getConfig() {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  updateConfig(updates) {
    this.config = { ...this.config, ...updates };
    this._saveConfig();
  }

  /**
   * Get specific setting
   */
  get(key) {
    return this.config[key];
  }

  /**
   * Set specific setting
   */
  set(key, value) {
    this.config[key] = value;
    this._saveConfig();
  }

  /**
   * Set preferred provider
   */
  setPreferredProvider(provider) {
    this.config.preferredProvider = provider;
    this._saveConfig();
  }

  /**
   * Get preferred provider
   */
  getPreferredProvider() {
    return this.config.preferredProvider;
  }

  /**
   * Set voice selection
   */
  setVoice(voiceId, language, gender) {
    this.config.voiceId = voiceId;
    if (language) this.config.language = language;
    if (gender) this.config.gender = gender;
    this._saveConfig();
  }

  /**
   * Get voice selection
   */
  getVoice() {
    return {
      voiceId: this.config.voiceId,
      language: this.config.language,
      gender: this.config.gender
    };
  }

  /**
   * Set voice parameters
   */
  setVoiceParams(speed, pitch, volume) {
    if (speed !== undefined) this.config.speed = speed;
    if (pitch !== undefined) this.config.pitch = pitch;
    if (volume !== undefined) this.config.volume = volume;
    this._saveConfig();
  }

  /**
   * Get voice parameters
   */
  getVoiceParams() {
    return {
      speed: this.config.speed,
      pitch: this.config.pitch,
      volume: this.config.volume
    };
  }

  /**
   * Set quality
   */
  setQuality(quality) {
    this.config.quality = quality;
    this._saveConfig();
  }

  /**
   * Get quality
   */
  getQuality() {
    return this.config.quality;
  }

  /**
   * Set streaming
   */
  setStreaming(enabled) {
    this.config.streaming = enabled;
    this._saveConfig();
  }

  /**
   * Get streaming
   */
  getStreaming() {
    return this.config.streaming;
  }

  /**
   * Set cache enabled
   */
  setCacheEnabled(enabled) {
    this.config.useCache = enabled;
    this._saveConfig();
  }

  /**
   * Get cache enabled
   */
  getCacheEnabled() {
    return this.config.useCache;
  }

  /**
   * Reset to defaults
   */
  reset() {
    this.config = { ...DEFAULT_CONFIG };
    this._saveConfig();
  }

  /**
   * Export configuration
   */
  export() {
    return JSON.stringify(this.config, null, 2);
  }

  /**
   * Import configuration
   */
  import(jsonString) {
    try {
      const imported = JSON.parse(jsonString);
      this.config = { ...DEFAULT_CONFIG, ...imported };
      this._saveConfig();
      return true;
    } catch (error) {
      console.error('[VoiceConfigStore] Failed to import config:', error);
      return false;
    }
  }

  /**
   * Add config change listener
   */
  addListener(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  /**
   * Notify listeners of changes
   */
  _notifyListeners() {
    for (const listener of this.listeners) {
      try {
        listener(this.config);
      } catch (error) {
        console.error('[VoiceConfigStore] Listener error:', error);
      }
    }
  }
}

// Singleton instance
let instance = null;

/**
 * Get voice config store instance
 */
export function getVoiceConfigStore() {
  if (!instance) {
    instance = new VoiceConfigStore();
  }
  return instance;
}

export default VoiceConfigStore;
