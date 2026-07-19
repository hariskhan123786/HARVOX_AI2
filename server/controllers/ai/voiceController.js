/**
 * HARVOX AI — Voice Pipeline Controllers (Phase 13.6)
 *
 * Handles speech-to-text transcriptions and speech synthesis configurations.
 */

import { transcribeAudio, synthesizeSpeech } from '../../services/voiceService.js';

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
    const result = await synthesizeSpeech(text, language, voiceId);
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: 'Speech synthesis failed', error: err.message });
  }
};
