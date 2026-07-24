/**
 * HARVOX AI - Voice Provider System
 * Base interface and abstract class for all TTS providers
 */

/**
 * Voice Provider Types
 */
export const ProviderType = {
  ELEVENLABS: 'elevenlabs',
  EDGE_TTS: 'edge-tts',
  BROWSER_SPEECH: 'browser-speech',
  AUTO: 'auto'
};

/**
 * Provider Status
 */
export const ProviderStatus = {
  AVAILABLE: 'available',
  UNAVAILABLE: 'unavailable',
  QUOTA_EXCEEDED: 'quota_exceeded',
  ERROR: 'error',
  UNKNOWN: 'unknown'
};

/**
 * Error Types for Provider Failures
 */
export const ProviderErrorType = {
  QUOTA_EXCEEDED: 'quota_exceeded',
  RATE_LIMIT: 'rate_limit',
  NETWORK_ERROR: 'network_error',
  TIMEOUT: 'timeout',
  INVALID_KEY: 'invalid_key',
  PROVIDER_UNAVAILABLE: 'provider_unavailable',
  PLAYBACK_ERROR: 'playback_error',
  UNKNOWN: 'unknown'
};

/**
 * Voice Quality Levels
 */
export const VoiceQuality = {
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low'
};

/**
 * Base Voice Provider Interface
 * All providers must implement these methods
 */
export class VoiceProvider {
  constructor(config = {}) {
    this.config = config;
    this.status = ProviderStatus.UNKNOWN;
    this.lastError = null;
    this.lastErrorTime = null;
  }

  /**
   * Get provider type
   * @returns {string} Provider type
   */
  getType() {
    throw new Error('getType() must be implemented');
  }

  /**
   * Get provider name
   * @returns {string} Provider display name
   */
  getName() {
    throw new Error('getName() must be implemented');
  }

  /**
   * Check if provider is available
   * @returns {Promise<boolean>}
   */
  async isAvailable() {
    throw new Error('isAvailable() must be implemented');
  }

  /**
   * Get available voices for this provider
   * @returns {Promise<Array>} List of available voices
   */
  async getVoices() {
    throw new Error('getVoices() must be implemented');
  }

  /**
   * Synthesize speech from text
   * @param {string} text - Text to synthesize
   * @param {object} options - Voice options (voiceId, speed, pitch, etc.)
   * @returns {Promise<{audio: Audio|string, duration: number}>}
   */
  async synthesize(text, options = {}) {
    throw new Error('synthesize() must be implemented');
  }

  /**
   * Get current provider status
   * @returns {string} Provider status
   */
  getStatus() {
    return this.status;
  }

  /**
   * Set provider status
   * @param {string} status - New status
   */
  setStatus(status) {
    this.status = status;
    if (status === ProviderStatus.AVAILABLE) {
      this.lastError = null;
      this.lastErrorTime = null;
    }
  }

  /**
   * Handle provider error
   * @param {Error} error - Error object
   * @param {string} errorType - Error type from ProviderErrorType
   */
  handleError(error, errorType = ProviderErrorType.UNKNOWN) {
    this.lastError = { error, type: errorType, message: error.message };
    this.lastErrorTime = Date.now();

    // Update status based on error type
    if (errorType === ProviderErrorType.QUOTA_EXCEEDED) {
      this.status = ProviderStatus.QUOTA_EXCEEDED;
    } else if (errorType === ProviderErrorType.RATE_LIMIT) {
      this.status = ProviderStatus.QUOTA_EXCEEDED;
    } else if (errorType === ProviderErrorType.PROVIDER_UNAVAILABLE) {
      this.status = ProviderStatus.UNAVAILABLE;
    } else {
      this.status = ProviderStatus.ERROR;
    }

    // Log error in development
    if (process.env.NODE_ENV === 'development') {
      console.error(`[${this.getName()}] Error:`, {
        type: errorType,
        message: error.message,
        status: this.status
      });
    }
  }

  /**
   * Get last error information
   * @returns {object|null} Error details
   */
  getLastError() {
    return this.lastError;
  }

  /**
   * Reset provider to available state
   */
  reset() {
    this.status = ProviderStatus.UNKNOWN;
    this.lastError = null;
    this.lastErrorTime = null;
  }

  /**
   * Clean up resources
   */
  cleanup() {
    // Override in subclass if needed
  }
}

/**
 * Voice configuration object
 */
export class VoiceConfig {
  constructor(config = {}) {
    this.voiceId = config.voiceId || null;
    this.speed = config.speed || 1.0;
    this.pitch = config.pitch || 1.0;
    this.volume = config.volume || 1.0;
    this.quality = config.quality || VoiceQuality.HIGH;
    this.streaming = config.streaming !== false;
    this.language = config.language || 'en-US';
    this.gender = config.gender || 'female';
  }

  toJSON() {
    return {
      voiceId: this.voiceId,
      speed: this.speed,
      pitch: this.pitch,
      volume: this.volume,
      quality: this.quality,
      streaming: this.streaming,
      language: this.language,
      gender: this.gender
    };
  }
}

/**
 * Voice metadata object
 */
export class VoiceMetadata {
  constructor(data = {}) {
    this.id = data.id;
    this.name = data.name;
    this.language = data.language || 'en-US';
    this.gender = data.gender || 'female';
    this.provider = data.provider;
    this.quality = data.quality || VoiceQuality.MEDIUM;
    this.description = data.description || '';
    this.sample = data.sample || null;
  }
}

/**
 * Audio cache entry
 */
export class AudioCacheEntry {
  constructor(audio, text, voiceId, timestamp) {
    this.audio = audio;
    this.text = text;
    this.voiceId = voiceId;
    this.timestamp = timestamp;
    this.accessCount = 0;
    this.lastAccessed = timestamp;
  }

  access() {
    this.accessCount++;
    this.lastAccessed = Date.now();
  }
}
