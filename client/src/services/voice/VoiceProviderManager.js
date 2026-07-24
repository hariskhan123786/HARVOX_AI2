/**
 * HARVOX AI - Voice Provider Manager
 * Manages multiple TTS providers with automatic failover and caching
 */

import {
  ProviderType,
  ProviderStatus,
  ProviderErrorType,
  VoiceConfig
} from './VoiceProvider.js';
import ElevenLabsProvider from './ElevenLabsProvider.js';
import CVoiceProvider from './CVoiceProvider.js';
import EdgeTTSProvider from './EdgeTTSProvider.js';
import BrowserSpeechProvider from './BrowserSpeechProvider.js';
import { detectLanguageAndSelectVoice } from './LanguageDetector.js';

/**
 * Audio Cache for storing generated speech
 */
class AudioCache {
  constructor(maxSize = 50, maxAge = 3600000) { // 1 hour default
    this.cache = new Map();
    this.maxSize = maxSize;
    this.maxAge = maxAge;
  }

  /**
   * Generate cache key
   */
  _generateKey(text, voiceId, provider) {
    return `${provider}:${voiceId}:${text.slice(0, 100)}`;
  }

  /**
   * Get cached audio
   */
  get(text, voiceId, provider) {
    const key = this._generateKey(text, voiceId, provider);
    const entry = this.cache.get(key);

    if (!entry) return null;

    // Check if expired
    if (Date.now() - entry.timestamp > this.maxAge) {
      this.cache.delete(key);
      return null;
    }

    entry.accessCount++;
    entry.lastAccessed = Date.now();

    if (process.env.NODE_ENV === 'development') {
      console.log('[AudioCache] Hit:', {
        key: key.slice(0, 50),
        accessCount: entry.accessCount
      });
    }

    return entry.audio;
  }

  /**
   * Set cached audio
   */
  set(text, voiceId, provider, audio) {
    const key = this._generateKey(text, voiceId, provider);

    // Enforce max size
    if (this.cache.size >= this.maxSize) {
      this._evictOldest();
    }

    this.cache.set(key, {
      audio,
      text,
      voiceId,
      provider,
      timestamp: Date.now(),
      accessCount: 0,
      lastAccessed: Date.now()
    });

    if (process.env.NODE_ENV === 'development') {
      console.log('[AudioCache] Set:', {
        key: key.slice(0, 50),
        cacheSize: this.cache.size
      });
    }
  }

  /**
   * Evict oldest entry
   */
  _evictOldest() {
    let oldestKey = null;
    let oldestTime = Date.now();

    for (const [key, entry] of this.cache) {
      if (entry.lastAccessed < oldestTime) {
        oldestTime = entry.lastAccessed;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
      if (process.env.NODE_ENV === 'development') {
        console.log('[AudioCache] Evicted:', oldestKey.slice(0, 50));
      }
    }
  }

  /**
   * Clear cache
   */
  clear() {
    this.cache.clear();
    if (process.env.NODE_ENV === 'development') {
      console.log('[AudioCache] Cleared');
    }
  }

  /**
   * Get cache stats
   */
  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      entries: Array.from(this.cache.values()).map(e => ({
        text: e.text.slice(0, 30),
        provider: e.provider,
        accessCount: e.accessCount,
        age: Date.now() - e.timestamp
      }))
    };
  }
}

/**
 * Voice Provider Manager
 * Handles provider selection, failover, and caching
 */
export class VoiceProviderManager {
  constructor(config = {}) {
    this.config = config;
    this.providers = new Map();
    this.providerOrder = [
      ProviderType.ELEVENLABS,  // Primary
      'cvoice',                  // Secondary
      ProviderType.EDGE_TTS,     // Fallback
      ProviderType.BROWSER_SPEECH // Emergency Fallback
    ];
    this.currentProvider = null;
    this.preferredProvider = config.preferredProvider || ProviderType.ELEVENLABS;
    this.audioCache = new AudioCache(config.cacheSize, config.cacheMaxAge);
    this.restorationCheckInterval = config.restorationCheckInterval || 60000; // 1 minute
    this.restorationTimer = null;
    this.voiceConfig = new VoiceConfig(config.voiceConfig || {});
    
    this._initializeProviders();
    this._startRestorationCheck();
  }

  /**
   * Initialize all providers
   */
  _initializeProviders() {
    // Initialize ElevenLabs (Primary)
    this.providers.set(
      ProviderType.ELEVENLABS,
      new ElevenLabsProvider(this.config.elevenLabs || {})
    );

    // Initialize CVoice AI (Secondary)
    this.providers.set(
      'cvoice',
      new CVoiceProvider(this.config.cvoice || {})
    );

    // Initialize Edge TTS (Fallback)
    this.providers.set(
      ProviderType.EDGE_TTS,
      new EdgeTTSProvider(this.config.edgeTTS || {})
    );

    // Initialize Browser Speech (Emergency Fallback)
    this.providers.set(
      ProviderType.BROWSER_SPEECH,
      new BrowserSpeechProvider(this.config.browserSpeech || {})
    );

    if (process.env.NODE_ENV === 'development') {
      console.log('[VoiceProviderManager] Initialized providers:', {
        providers: Array.from(this.providers.keys()),
        preferredProvider: this.preferredProvider,
        order: this.providerOrder
      });
    }
  }

  /**
   * Start automatic provider restoration check
   */
  _startRestorationCheck() {
    if (this.restorationTimer) {
      clearInterval(this.restorationTimer);
    }

    this.restorationTimer = setInterval(async () => {
      await this._checkProviderRestoration();
    }, this.restorationCheckInterval);
  }

  /**
   * Check if preferred provider can be restored
   */
  async _checkProviderRestoration() {
    // Only check if we're not using the preferred provider
    if (this.currentProvider === this.preferredProvider) {
      return;
    }

    const preferredProvider = this.providers.get(this.preferredProvider);
    if (!preferredProvider) return;

    // Check if preferred provider is now available
    const isAvailable = await preferredProvider.isAvailable();

    if (isAvailable && preferredProvider.getStatus() === ProviderStatus.AVAILABLE) {
      if (process.env.NODE_ENV === 'development') {
        console.log('[VoiceProviderManager] Preferred provider restored:', {
          from: this.currentProvider,
          to: this.preferredProvider
        });
      }

      this.currentProvider = this.preferredProvider;
    }
  }

  /**
   * Get active provider
   */
  async getActiveProvider() {
    // If we have a current provider and it's available, use it
    if (this.currentProvider) {
      const provider = this.providers.get(this.currentProvider);
      if (provider && await provider.isAvailable()) {
        return provider;
      }
    }

    // Try to find an available provider in order
    for (const providerType of this.providerOrder) {
      const provider = this.providers.get(providerType);
      if (provider && await provider.isAvailable()) {
        this.currentProvider = providerType;
        
        if (process.env.NODE_ENV === 'development') {
          console.log('[VoiceProviderManager] Active provider:', providerType);
        }
        
        return provider;
      }
    }

    // No providers available
    throw new Error('No voice providers available');
  }

  /**
   * Synthesize speech with automatic failover and language detection
   */
  async synthesize(text, options = {}) {
    const startTime = Date.now();

    // Auto-detect language if enabled
    let synthOptions = { ...this.voiceConfig.toJSON(), ...options };
    
    if (synthOptions.autoDetectLanguage !== false) {
      const detection = detectLanguageAndSelectVoice(
        text,
        synthOptions.gender || 'female',
        synthOptions.userPreference || null
      );
      
      // Update options with detected language
      synthOptions = {
        ...synthOptions,
        language: detection.language,
        gender: detection.gender,
        voiceId: detection.voiceId || synthOptions.voiceId,
        detectedLanguage: detection.detected,
        languageConfidence: detection.confidence
      };
      
      if (process.env.NODE_ENV === 'development') {
        console.log('[VoiceProviderManager] Language detection:', {
          detected: detection.detected,
          language: detection.language,
          confidence: detection.confidence?.toFixed(2)
        });
      }
    }

    // Check cache first
    const cachedAudio = this.audioCache.get(
      text,
      synthOptions.voiceId,
      this.currentProvider
    );

    if (cachedAudio && synthOptions.useCache !== false) {
      if (process.env.NODE_ENV === 'development') {
        console.log('[VoiceProviderManager] Using cached audio');
      }
      return { audio: cachedAudio, duration: 0, cached: true, provider: this.currentProvider };
    }

    // Try each provider in order
    let lastError = null;

    for (const providerType of this.providerOrder) {
      const provider = this.providers.get(providerType);
      if (!provider) continue;

      try {
        // Check if provider is available
        const isAvailable = await provider.isAvailable();
        if (!isAvailable) {
          if (process.env.NODE_ENV === 'development') {
            console.log('[VoiceProviderManager] Provider unavailable:', providerType);
          }
          continue;
        }

        // Try to synthesize
        if (process.env.NODE_ENV === 'development') {
          console.log('[VoiceProviderManager] Attempting synthesis with:', providerType);
        }

        const result = await provider.synthesize(text, synthOptions);

        // Success! Cache the result
        this.audioCache.set(text, synthOptions.voiceId, providerType, result.audio);

        // Update current provider
        this.currentProvider = providerType;

        if (process.env.NODE_ENV === 'development') {
          console.log('[VoiceProviderManager] Synthesis success:', {
            provider: providerType,
            duration: `${Date.now() - startTime}ms`,
            cached: false,
            language: synthOptions.detectedLanguage || synthOptions.language
          });
        }

        return {
          audio: result.audio,
          duration: result.duration,
          cached: false,
          provider: providerType,
          language: synthOptions.language,
          detectedLanguage: synthOptions.detectedLanguage
        };

      } catch (error) {
        lastError = error;

        if (process.env.NODE_ENV === 'development') {
          console.warn('[VoiceProviderManager] Provider failed:', {
            provider: providerType,
            error: error.message,
            status: provider.getStatus()
          });
        }

        // Check if this is a fatal error or we should try next provider
        const errorInfo = provider.getLastError();
        
        if (errorInfo) {
          // Log the fallback reason
          if (process.env.NODE_ENV === 'development') {
            console.log('[VoiceProviderManager] Fallback reason:', {
              provider: providerType,
              errorType: errorInfo.type,
              message: errorInfo.message
            });
          }

          // Continue to next provider
          continue;
        }
      }
    }

    // All providers failed
    if (process.env.NODE_ENV === 'development') {
      console.error('[VoiceProviderManager] All providers failed:', {
        lastError: lastError?.message,
        duration: `${Date.now() - startTime}ms`
      });
    }

    throw new Error(
      lastError?.message || 'All voice providers failed. Please check your internet connection.'
    );
  }

  /**
   * Get all available voices across all providers
   */
  async getAllVoices() {
    const allVoices = [];

    for (const [providerType, provider] of this.providers) {
      try {
        const isAvailable = await provider.isAvailable();
        if (isAvailable) {
          const voices = await provider.getVoices();
          allVoices.push(...voices);
        }
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.warn(`[VoiceProviderManager] Failed to get voices from ${providerType}:`, error);
        }
      }
    }

    return allVoices;
  }

  /**
   * Set preferred provider
   */
  setPreferredProvider(providerType) {
    if (!this.providers.has(providerType)) {
      throw new Error(`Unknown provider: ${providerType}`);
    }

    this.preferredProvider = providerType;

    if (process.env.NODE_ENV === 'development') {
      console.log('[VoiceProviderManager] Preferred provider set:', providerType);
    }
  }

  /**
   * Get current provider type
   */
  getCurrentProvider() {
    return this.currentProvider;
  }

  /**
   * Get preferred provider type
   */
  getPreferredProvider() {
    return this.preferredProvider;
  }

  /**
   * Update voice configuration
   */
  updateVoiceConfig(config) {
    this.voiceConfig = new VoiceConfig({
      ...this.voiceConfig.toJSON(),
      ...config
    });

    if (process.env.NODE_ENV === 'development') {
      console.log('[VoiceProviderManager] Voice config updated:', this.voiceConfig.toJSON());
    }
  }

  /**
   * Get voice configuration
   */
  getVoiceConfig() {
    return this.voiceConfig.toJSON();
  }

  /**
   * Get provider status
   */
  getProviderStatus(providerType) {
    const provider = this.providers.get(providerType);
    return provider ? provider.getStatus() : ProviderStatus.UNKNOWN;
  }

  /**
   * Get all provider statuses
   */
  getAllProviderStatuses() {
    const statuses = {};
    
    for (const [providerType, provider] of this.providers) {
      statuses[providerType] = {
        status: provider.getStatus(),
        lastError: provider.getLastError()
      };
    }

    return statuses;
  }

  /**
   * Reset provider (clear errors)
   */
  resetProvider(providerType) {
    const provider = this.providers.get(providerType);
    if (provider) {
      provider.reset();
      
      if (process.env.NODE_ENV === 'development') {
        console.log('[VoiceProviderManager] Provider reset:', providerType);
      }
    }
  }

  /**
   * Clear audio cache
   */
  clearCache() {
    this.audioCache.clear();
  }

  /**
   * Get cache stats
   */
  getCacheStats() {
    return this.audioCache.getStats();
  }

  /**
   * Cleanup
   */
  cleanup() {
    // Stop restoration check
    if (this.restorationTimer) {
      clearInterval(this.restorationTimer);
      this.restorationTimer = null;
    }

    // Cleanup all providers
    for (const provider of this.providers.values()) {
      provider.cleanup();
    }

    // Clear cache
    this.audioCache.clear();

    if (process.env.NODE_ENV === 'development') {
      console.log('[VoiceProviderManager] Cleaned up');
    }
  }
}

export default VoiceProviderManager;
