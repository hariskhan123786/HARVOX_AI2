import { supabase } from '../config/supabase.js';

const FIELD_MAP = {
  chats: 'usage_chats',
  codeGen: 'usage_code_gen',
  files: 'usage_files',
  projects: 'usage_projects',
};

const ACTION_MAP = {
  chats: { actionType: 'chat', details: 'Initiated a conversation with AI assistant' },
  codeGen: { actionType: 'code_gen', details: 'Generated source code template' },
  files: { actionType: 'upload', details: 'Analyzed uploaded document/file' },
  projects: { actionType: 'project', details: 'Scaffolded complete project configuration' },
};

export const incrementUsage = async (userId, field) => {
  const validFields = ['chats', 'codeGen', 'files', 'projects'];
  if (!validFields.includes(field)) return;

  const column = FIELD_MAP[field];

  try {
    // Use RPC to atomically increment the counter
    const { data: user, error: fetchErr } = await supabase
      .from('users')
      .select(column)
      .eq('id', userId)
      .single();

    if (fetchErr) throw fetchErr;

    const currentVal = Number(user[column] || 0);
    await supabase
      .from('users')
      .update({ [column]: currentVal + 1 })
      .eq('id', userId);

    // Log activity for analytics
    const { actionType, details } = ACTION_MAP[field];
    await supabase.from('activity_logs').insert({
      user_id: userId,
      action_type: actionType,
      details,
    });
  } catch (err) {
    console.error('[UsageService] Failed to increment usage:', err.message);
  }
};
