import { supabase } from '../config/supabase.js';

/**
 * Get user's voice preferences from settings
 */
export const getVoicePreferences = async (req, res) => {
  try {
    const userId = req.user._id;

    // Fetch settings
    const { data: settings, error } = await supabase
      .from('settings')
      .select('voice')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw error;

    // Default voice preferences
    const defaultPreferences = {
      preferredProvider: 'elevenlabs',
      language: 'hi-IN',
      gender: 'female',
      voiceId: null,
      speed: 1.0,
      pitch: 1.0,
      volume: 1.0,
      autoDetectLanguage: true,
      useCache: true,
      quality: 'high'
    };

    const voicePreferences = settings?.voice || defaultPreferences;

    res.json({
      success: true,
      preferences: voicePreferences
    });
  } catch (error) {
    console.error('[Voice] Get preferences error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Update user's voice preferences
 */
export const updateVoicePreferences = async (req, res) => {
  try {
    const userId = req.user._id;
    const updates = req.body;

    // Validate updates
    const allowedFields = [
      'preferredProvider',
      'language',
      'gender',
      'voiceId',
      'speed',
      'pitch',
      'volume',
      'autoDetectLanguage',
      'useCache',
      'quality'
    ];

    const sanitizedUpdates = {};
    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        sanitizedUpdates[field] = updates[field];
      }
    }

    // Validate values
    if (sanitizedUpdates.speed !== undefined) {
      sanitizedUpdates.speed = Math.max(0.5, Math.min(2.0, sanitizedUpdates.speed));
    }
    if (sanitizedUpdates.pitch !== undefined) {
      sanitizedUpdates.pitch = Math.max(0.5, Math.min(2.0, sanitizedUpdates.pitch));
    }
    if (sanitizedUpdates.volume !== undefined) {
      sanitizedUpdates.volume = Math.max(0.0, Math.min(1.0, sanitizedUpdates.volume));
    }

    // Fetch current settings
    let { data: settings, error } = await supabase
      .from('settings')
      .select('voice')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw error;

    // Merge with existing voice settings
    const currentVoice = settings?.voice || {};
    const updatedVoice = {
      ...currentVoice,
      ...sanitizedUpdates,
      updatedAt: new Date().toISOString()
    };

    // Update settings
    const { data: updatedSettings, error: updateError } = await supabase
      .from('settings')
      .update({ voice: updatedVoice })
      .eq('user_id', userId)
      .select('voice')
      .single();

    if (updateError) throw updateError;

    res.json({
      success: true,
      preferences: updatedSettings.voice
    });
  } catch (error) {
    console.error('[Voice] Update preferences error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Test voice endpoint for preview
 * Returns a test message in the selected voice
 */
export const testVoice = async (req, res) => {
  try {
    const {
      text = 'Hello, this is a test of your selected voice.',
      language = 'hi-IN',
      gender = 'female',
      voiceId = null,
      provider = 'elevenlabs'
    } = req.body;

    // This endpoint just validates the request
    // The actual TTS synthesis happens on the client side
    // We just return success to confirm the settings are valid

    res.json({
      success: true,
      message: 'Voice test initiated',
      params: {
        text,
        language,
        gender,
        voiceId,
        provider
      }
    });
  } catch (error) {
    console.error('[Voice] Test voice error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
