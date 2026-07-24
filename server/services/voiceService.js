/**
 * HARVOX AI — Voice & Speech Service (Phase 13.6 + Phase 15 Upgrade)
 *
 * Exposes Speech-to-Text (STT) using Whisper-large-v3 via Groq API
 * and handles Text-to-Speech (TTS) configuration for English, Hindi, and Urdu voices via ElevenLabs and CVoice AI.
 */

import fs from 'fs';
import { File } from 'node:buffer';
import Groq from 'groq-sdk';
import { getAIOptions } from '../controllers/ai/chatController.js';
import { supabase } from '../config/supabase.js';

export const ELEVENLABS_VOICE_CATALOG = [
  // ── Female Hindi Voices (Default category for new users) ──────────────────────
  { id: 'cgSgspJ2msm6clMCkdW9', name: 'Hindi Female Premium (Priya)', category: 'hindi_female', gender: 'F', language: 'hi', isDefault: true },
  { id: '21m00Tcm4TlvDq8ikWAM', name: 'Hindi Female 1 (Rachel)',       category: 'hindi_female', gender: 'F', language: 'hi', isDefault: false },
  { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Hindi Female 2 (Sarah)',        category: 'hindi_female', gender: 'F', language: 'hi', isDefault: false },
  { id: 'XB0fDUnUDz4sSJJ5qy5z', name: 'Hindi Female 3 (Charlotte)',    category: 'hindi_female', gender: 'F', language: 'hi', isDefault: false },

  // ── Male Hindi Voices ──────────────────────────────────────────────────────────
  { id: 'pNInz6obpgfrhhF2E4DY', name: 'Hindi Male 1 (Adam)',           category: 'hindi_male',   gender: 'M', language: 'hi', isDefault: false },
  { id: 'ErXwobaYiN019PkySvjV', name: 'Hindi Male 2 (Antoni)',         category: 'hindi_male',   gender: 'M', language: 'hi', isDefault: false },
  { id: 'onwF48T1CtxCmqQRPOHJ', name: 'Hindi Male 3 (Daniel)',         category: 'hindi_male',   gender: 'M', language: 'hi', isDefault: false },

  // ── Urdu Voices ────────────────────────────────────────────────────────────────
  { id: 'ohvvU75FpBEB8fdaLOMh', name: 'Female Urdu Voice 1',          category: 'urdu',         gender: 'F', language: 'ur', isDefault: false },
  { id: 'VG7gYikNQ71LJ52W9fAD', name: 'Female Urdu Voice 2 (Priya)',   category: 'urdu',         gender: 'F', language: 'ur', isDefault: false },
  { id: 'CYZATuZ1tjgW8es1QfPG', name: 'Male Urdu Voice',              category: 'urdu',         gender: 'M', language: 'ur', isDefault: false },

  // ── English Voices ─────────────────────────────────────────────────────────────
  { id: 'Lcfc5ZowlhAlwG5vBb22', name: 'English Female (Emily)',       category: 'english',      gender: 'F', language: 'en', isDefault: false },
  { id: 'IKne3meq5aKbA1x0m7Ed', name: 'English Male (Charlie)',        category: 'english',      gender: 'M', language: 'en', isDefault: false },
];

export const CVOICE_VOICE_CATALOG = [
  // ── Hindi Female Voices (Default for CVoice) ──────────────────────────────────
  { id: 'hi-IN-neural-female-1', name: 'Priya (Hindi Female)', category: 'hindi_female', gender: 'F', language: 'hi', isDefault: true, quality: 'high' },
  { id: 'hi-IN-neural-female-2', name: 'Ananya (Hindi Female)', category: 'hindi_female', gender: 'F', language: 'hi', isDefault: false, quality: 'high' },
  { id: 'hi-IN-neural-female-3', name: 'Kavya (Hindi Female)', category: 'hindi_female', gender: 'F', language: 'hi', isDefault: false, quality: 'high' },
  { id: 'hi-IN-standard-female', name: 'Maya (Hindi Female)', category: 'hindi_female', gender: 'F', language: 'hi', isDefault: false, quality: 'medium' },

  // ── Hindi Male Voices ──────────────────────────────────────────────────────────
  { id: 'hi-IN-neural-male-1', name: 'Arjun (Hindi Male)', category: 'hindi_male', gender: 'M', language: 'hi', isDefault: false, quality: 'high' },
  { id: 'hi-IN-neural-male-2', name: 'Rohan (Hindi Male)', category: 'hindi_male', gender: 'M', language: 'hi', isDefault: false, quality: 'high' },
  { id: 'hi-IN-standard-male', name: 'Raj (Hindi Male)', category: 'hindi_male', gender: 'M', language: 'hi', isDefault: false, quality: 'medium' },

  // ── Urdu Voices ────────────────────────────────────────────────────────────────
  { id: 'ur-PK-neural-female-1', name: 'Fatima (Urdu Female)', category: 'urdu', gender: 'F', language: 'ur', isDefault: false, quality: 'high' },
  { id: 'ur-PK-neural-female-2', name: 'Zara (Urdu Female)', category: 'urdu', gender: 'F', language: 'ur', isDefault: false, quality: 'high' },
  { id: 'ur-PK-standard-female', name: 'Ayesha (Urdu Female)', category: 'urdu', gender: 'F', language: 'ur', isDefault: false, quality: 'medium' },
  { id: 'ur-PK-neural-male', name: 'Hassan (Urdu Male)', category: 'urdu', gender: 'M', language: 'ur', isDefault: false, quality: 'high' },
  { id: 'ur-PK-standard-male', name: 'Ahmed (Urdu Male)', category: 'urdu', gender: 'M', language: 'ur', isDefault: false, quality: 'medium' },

  // ── English Voices ─────────────────────────────────────────────────────────────
  { id: 'en-US-neural-female-1', name: 'Sophia (English Female)', category: 'english', gender: 'F', language: 'en', isDefault: false, quality: 'high' },
  { id: 'en-US-neural-female-2', name: 'Emma (English Female)', category: 'english', gender: 'F', language: 'en', isDefault: false, quality: 'high' },
  { id: 'en-US-neural-male-1', name: 'James (English Male)', category: 'english', gender: 'M', language: 'en', isDefault: false, quality: 'high' },
  { id: 'en-US-neural-male-2', name: 'Michael (English Male)', category: 'english', gender: 'M', language: 'en', isDefault: false, quality: 'high' },
  { id: 'en-GB-neural-female', name: 'Olivia (British Female)', category: 'english', gender: 'F', language: 'en', isDefault: false, quality: 'high' },
  { id: 'en-GB-neural-male', name: 'Oliver (British Male)', category: 'english', gender: 'M', language: 'en', isDefault: false, quality: 'high' },
  { id: 'en-AU-neural-female', name: 'Isabella (Australian Female)', category: 'english', gender: 'F', language: 'en', isDefault: false, quality: 'high' },
  { id: 'en-AU-neural-male', name: 'William (Australian Male)', category: 'english', gender: 'M', language: 'en', isDefault: false, quality: 'high' },
  { id: 'en-IN-neural-female', name: 'Aarti (Indian English Female)', category: 'english', gender: 'F', language: 'en', isDefault: false, quality: 'high' },
  { id: 'en-IN-neural-male', name: 'Ravi (Indian English Male)', category: 'english', gender: 'M', language: 'en', isDefault: false, quality: 'high' },
];

export const DEFAULT_VOICE_ID = 'cgSgspJ2msm6clMCkdW9'; // Hindi Female Premium (Default)
export const DEFAULT_CVOICE_ID = 'hi-IN-neural-female-1'; // Priya (Hindi Female)

/**
 * Transcribe an audio file using Groq's Whisper-large-v3 model.
 * Handles English, Urdu, and bilingual code-switching automatically.
 */
export async function transcribeAudio(userId, audio) {
  try {
    const aiOptions = await getAIOptions(userId).catch(() => ({ apiKeys: {} }));
    const apiKey = aiOptions.apiKeys?.groq || process.env.GROQ_API_KEY;

    if (!apiKey) {
      throw new Error('Groq API Key is not configured for Whisper transcription.');
    }

    const groq = new Groq({ apiKey });

    const file = Buffer.isBuffer(audio)
      ? new File([audio], 'recording.webm', { type: 'audio/webm' })
      : fs.createReadStream(audio);

    console.log('[VoiceService] Sending audio to Whisper via Groq...');
    const response = await groq.audio.transcriptions.create({
      file,
      model: 'whisper-large-v3',
      response_format: 'json',
      temperature: 0.0,
    });

    const text = response.text || '';
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

/**
 * Synthesize text using CVoice AI (Hindi/Urdu specialist)
 */
export async function synthesizeSpeechCVoice(text, language = 'hi', voiceId = null, userId = null) {
  const apiKey = process.env.CVOICE_API_KEY;
  
  // Resolve target voiceId from user settings if not explicitly passed
  let targetVoiceId = voiceId;
  if (!targetVoiceId && userId) {
    try {
      const { data: userSettings } = await supabase
        .from('settings')
        .select('voice')
        .eq('user_id', userId)
        .maybeSingle();

      if (userSettings?.voice?.cvoiceSelection) {
        targetVoiceId = userSettings.voice.cvoiceSelection;
      }
    } catch {
      /* Fallback to default below */
    }
  }

  if (!targetVoiceId) {
    targetVoiceId = DEFAULT_CVOICE_ID;
  }

  if (!apiKey) {
    return {
      success: false,
      fallback: true,
      text,
      language,
      voiceId: targetVoiceId,
      message: 'CVoice API key not configured. Falling back to next provider.',
    };
  }

  try {
    console.log(`[VoiceService] Synthesizing text using CVoice voice: ${targetVoiceId}`);
    console.log(`[VoiceService] CVoice API Key: ${apiKey ? 'Present' : 'Missing'}`);
    console.log(`[VoiceService] CVoice endpoint: https://api.cvoice.ai/v1/tts`);
    
    const response = await fetch('https://api.cvoice.ai/v1/tts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        voice_id: targetVoiceId,
        language,
        model: 'neural',
        speed: 1.0,
        pitch: 1.0,
      }),
    });

    console.log(`[VoiceService] CVoice response status: ${response.status}`);

    if (!response.ok) {
      const errText = await response.text();
      console.error(`[VoiceService] CVoice error response:`, errText);
      throw new Error(`CVoice returned: ${errText || response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');

    return {
      success: true,
      audioBase64: base64,
      text,
      language,
      voiceId: targetVoiceId,
      provider: 'cvoice',
    };
  } catch (err) {
    console.error('[VoiceService] CVoice synthesis failed:', err.message);
    return {
      success: false,
      fallback: true,
      text,
      language,
      voiceId: targetVoiceId,
      error: err.message,
    };
  }
}

/**
 * Synthesize text into high quality natural speech via ElevenLabs API.
 */
export async function synthesizeSpeech(text, language = 'en', voiceId = null, userId = null) {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  
  // Resolve target voiceId from user settings if not explicitly passed
  let targetVoiceId = voiceId;
  if (!targetVoiceId && userId) {
    try {
      const { data: userSettings } = await supabase
        .from('settings')
        .select('voice')
        .eq('user_id', userId)
        .maybeSingle();

      if (userSettings?.voice?.voiceSelection) {
        targetVoiceId = userSettings.voice.voiceSelection;
      }
    } catch {
      /* Fallback to default below */
    }
  }

  if (!targetVoiceId) {
    targetVoiceId = DEFAULT_VOICE_ID;
  }

  if (!apiKey) {
    return {
      success: false,
      fallback: true,
      text,
      language,
      voiceId: targetVoiceId,
      message: 'ElevenLabs API key not configured. Using browser native speech synthesis.',
    };
  }

  try {
    console.log(`[VoiceService] Synthesizing text using ElevenLabs voice: ${targetVoiceId}`);
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${targetVoiceId}`, {
      method: 'POST',
      headers: {
        'xi-api-key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_multilingual_v2', // v2 supports English + Hindi + Urdu prosody
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.8,
          style: 0.15,
          use_speaker_boost: true,
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
      voiceId: targetVoiceId,
    };
  } catch (err) {
    console.error('[VoiceService] ElevenLabs synthesis failed:', err.message);
    return {
      success: false,
      fallback: true,
      text,
      language,
      voiceId: targetVoiceId,
      error: err.message,
    };
  }
}
