/**
 * HARVOX AI — Voice & Speech Service (Phase 13.6)
 *
 * Exposes Speech-to-Text (STT) using Whisper-large-v3 via Groq API
 * and handles Text-to-Speech (TTS) configuration for English + Urdu code-switching.
 */

import fs from 'fs';
import Groq from 'groq-sdk';
import { getAIOptions } from '../controllers/ai/chatController.js';

/**
 * Transcribe an audio file using Groq's Whisper-large-v3 model.
 * Handles English, Urdu, and bilingual code-switching automatically.
 *
 * @param {string} userId
 * @param {string} filePath - Path to uploaded audio file (mp3, wav, m4a, webm)
 * @returns {Promise<{text: string, language: string}>}
 */
export async function transcribeAudio(userId, filePath) {
  try {
    const aiOptions = await getAIOptions(userId).catch(() => ({ apiKeys: {} }));
    const apiKey = aiOptions.apiKeys?.groq || process.env.GROQ_API_KEY;

    if (!apiKey) {
      throw new Error('Groq API Key is not configured for Whisper transcription.');
    }

    const groq = new Groq({ apiKey });
    
    console.log(`[VoiceService] Sending ${filePath} to Whisper via Groq...`);
    const response = await groq.audio.transcriptions.create({
      file: fs.createReadStream(filePath),
      model: 'whisper-large-v3',
      response_format: 'json',
      temperature: 0.0, // Low temperature for higher transcription accuracy
    });

    const text = response.text || '';
    
    // Auto-detect Urdu vs English
    const isUrdu = /[\u0600-\u06FF]/.test(text);

    return {
      text,
      language: isUrdu ? 'ur' : 'en',
    };
  } catch (err) {
    console.error('[VoiceService] Whisper transcription failed:', err.message);
    throw err;
  }
}

export async function synthesizeSpeech(text, language = 'en', voiceId = 'pNInz6obpgfrhhF2E4DY') {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    return {
      success: false,
      fallback: true,
      text,
      language,
      message: 'ElevenLabs API key not configured. Using browser native speech synthesis.',
    };
  }

  try {
    console.log(`[VoiceService] Synthesizing text using ElevenLabs voice: ${voiceId}`);
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'xi-api-key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_multilingual_v2', // v2 supports English + Urdu code-switching
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
        },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`ElevenLabs returned: ${errText || response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');

    return {
      success: true,
      audioBase64: base64,
      text,
      language,
      voiceId,
    };
  } catch (err) {
    console.error('[VoiceService] ElevenLabs synthesis failed:', err.message);
    return {
      success: false,
      fallback: true,
      text,
      language,
      error: err.message,
    };
  }
}
