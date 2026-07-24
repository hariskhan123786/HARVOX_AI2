/**
 * HARVOX AI - Voice Service Entry Point
 * Exports all voice-related functionality
 */

export { VoiceProvider, ProviderType, ProviderStatus, ProviderErrorType, VoiceQuality, VoiceConfig, VoiceMetadata } from './VoiceProvider.js';
export { ElevenLabsProvider, ELEVENLABS_VOICES } from './ElevenLabsProvider.js';
export { CVoiceProvider, CVOICE_VOICES } from './CVoiceProvider.js';
export { EdgeTTSProvider, EDGE_VOICES } from './EdgeTTSProvider.js';
export { BrowserSpeechProvider } from './BrowserSpeechProvider.js';
export { VoiceProviderManager } from './VoiceProviderManager.js';
export { VoiceConfigStore, getVoiceConfigStore } from './VoiceConfigStore.js';
export { detectLanguage, detectLanguageAndSelectVoice, LANGUAGE_CODES } from './LanguageDetector.js';

// Re-export for convenience
export { default as VoiceProviderManagerClass } from './VoiceProviderManager.js';
export { default as VoiceConfigStoreClass } from './VoiceConfigStore.js';
export { default as LanguageDetector } from './LanguageDetector.js';
