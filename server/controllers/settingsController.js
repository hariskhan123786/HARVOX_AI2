import { supabase } from '../config/supabase.js';

const mapSettings = (s) => {
  if (!s) return null;
  return {
    _id: s.id,
    userId: s.user_id,
    appearance: s.appearance,
    ai: s.ai,
    voice: s.voice,
    notifications: s.notifications,
    memory: s.memory,
    workspace: s.workspace,
    apiKeys: s.api_keys,
    createdAt: s.created_at,
    updatedAt: s.updated_at,
  };
};

export const getSettings = async (req, res) => {
  try {
    const userId = req.user._id;
    let { data: settings, error } = await supabase
      .from('settings')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw error;

    if (!settings) {
      const { data: newSettings, error: createError } = await supabase
        .from('settings')
        .insert({ user_id: userId })
        .select('*')
        .single();
      
      if (createError) throw createError;
      settings = newSettings;
    }

    res.json({ settings: mapSettings(settings) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateSettings = async (req, res) => {
  try {
    const userId = req.user._id;
    const { appearance, ai, voice, notifications, memory, workspace, apiKeys } = req.body;

    // Fetch current settings first
    let { data: settings, error } = await supabase
      .from('settings')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw error;

    if (!settings) {
      const { data: newSettings, error: createError } = await supabase
        .from('settings')
        .insert({ user_id: userId })
        .select('*')
        .single();
      
      if (createError) throw createError;
      settings = newSettings;
    }

    const updates = {};
    if (appearance) updates.appearance = { ...settings.appearance, ...appearance };
    if (ai) updates.ai = { ...settings.ai, ...ai };
    if (voice) updates.voice = { ...settings.voice, ...voice };
    if (notifications) updates.notifications = { ...settings.notifications, ...notifications };
    if (memory) updates.memory = { ...settings.memory, ...memory };
    if (workspace) updates.workspace = { ...settings.workspace, ...workspace };
    if (apiKeys !== undefined) updates.api_keys = apiKeys;

    const { data: updatedSettings, error: updateError } = await supabase
      .from('settings')
      .update(updates)
      .eq('user_id', userId)
      .select('*')
      .single();

    if (updateError) throw updateError;

    res.json({ settings: mapSettings(updatedSettings) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
