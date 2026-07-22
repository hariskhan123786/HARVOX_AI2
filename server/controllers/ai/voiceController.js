/**
 * HARVOX AI — Voice Pipeline Controllers (Phase 13.6 + Phase 15 Upgrade)
 *
 * Handles speech-to-text transcriptions, voice catalog retrieval, and speech synthesis configurations.
 */

import { transcribeAudio, synthesizeSpeech, ELEVENLABS_VOICE_CATALOG, DEFAULT_VOICE_ID } from '../../services/voiceService.js';

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
    const { text, language, voiceId } = req.body;
    if (!text) {
      return res.status(400).json({ message: 'Text is required.' });
    }
    const result = await synthesizeSpeech(text, language, voiceId, req.user?._id);
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: 'Speech synthesis failed', error: err.message });
  }
};

export const getVoicesList = async (req, res) => {
  try {
    res.json({
      defaultVoiceId: DEFAULT_VOICE_ID,
      voices: ELEVENLABS_VOICE_CATALOG,
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to retrieve voices catalog', error: err.message });
  }
};
