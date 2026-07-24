/**
 * HARVOX AI — Voice Pipeline Controllers (Phase 13.6 + Phase 15 Upgrade)
 *
 * Handles speech-to-text transcriptions, voice catalog retrieval, and speech synthesis configurations.
 * Supports ElevenLabs (primary) and CVoice AI (secondary) providers.
 */

import { 
  transcribeAudio, 
  synthesizeSpeech, 
  synthesizeSpeechCVoice,
  ELEVENLABS_VOICE_CATALOG, 
  CVOICE_VOICE_CATALOG,
  DEFAULT_VOICE_ID,
  DEFAULT_CVOICE_ID
} from '../../services/voiceService.js';

export const transcribeSpeech = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No audio file uploaded.' });
    }

    const result = await transcribeAudio(req.user._id, req.file.buffer);

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: 'Speech transcription failed', error: err.message });
  }
};

export const speakText = async (req, res) => {
  try {
    const { text, language, voiceId, provider } = req.body;
    if (!text) {
      return res.status(400).json({ message: 'Text is required.' });
    }

    console.log('[VoiceController] Request:', { 
      text: text.substring(0, 50), 
      language, 
      voiceId, 
      provider,
      textLength: text.length 
    });

    let result;
    // Convert language code for API (hi-IN -> hi, ur-PK -> ur, en-US -> en)
    const apiLanguage = (language || '').split('-')[0] || 'en';
    
    console.log('[VoiceController] Language detection:', { original: language, api: apiLanguage });
    
    // For Hindi/Urdu, skip CVoice (doesn't exist) and go straight to ElevenLabs with Edge TTS fallback
    if (apiLanguage && ['hi', 'ur'].includes(apiLanguage)) {
      console.log('[VoiceController] Hindi/Urdu detected, using ElevenLabs with Edge TTS fallback');
      result = await synthesizeSpeech(text, apiLanguage, voiceId, req.user?._id);
      
      // If ElevenLabs fails, return fallback flag (client will use Edge TTS)
      if (!result.success && result.fallback) {
        console.log('[VoiceController] ElevenLabs failed, client will use Edge TTS fallback');
        return res.json({
          success: false,
          fallback: true,
          text,
          language: apiLanguage,
          message: 'Server providers unavailable. Use Edge TTS or Browser Speech.'
        });
      }
    } else {
      console.log('[VoiceController] Using ElevenLabs provider');
      result = await synthesizeSpeech(text, apiLanguage, voiceId, req.user?._id);
      
      // If ElevenLabs fails, return fallback flag
      if (!result.success && result.fallback) {
        console.log('[VoiceController] ElevenLabs failed, client will fallback to Edge TTS');
        return res.json({
          success: false,
          fallback: true,
          text,
          language: apiLanguage,
          message: 'Server providers unavailable. Use Edge TTS or Browser Speech.'
        });
      }
    }

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: 'Speech synthesis failed', error: err.message });
  }
};

export const getVoicesList = async (req, res) => {
  try {
    res.json({
      defaultVoiceId: DEFAULT_VOICE_ID,
      defaultCVoiceId: DEFAULT_CVOICE_ID,
      voices: ELEVENLABS_VOICE_CATALOG,
      cvoiceVoices: CVOICE_VOICE_CATALOG,
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to retrieve voices catalog', error: err.message });
  }
};
