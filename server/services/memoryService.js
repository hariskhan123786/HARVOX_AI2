import { supabase } from '../config/supabase.js';
import { eventBus } from '../utils/eventBus.js';

// Setup asynchronous listener for central activity logs
eventBus.on('activity', async ({ userId, actionKey, description, details }) => {
  try {
    await supabase.from('brain_memory').insert({
      user_id: userId,
      category: 'activity',
      key: actionKey,
      value: description,
      metadata: details || {},
    });
  } catch (err) {
    console.error('[Memory Core Listener] Failed to log activity memory:', err.message);
  }
});

/**
 * Ensures default memories are seeded for the user.
 */
export async function ensureDefaultMemories(userId) {
  try {
    const { count, error } = await supabase
      .from('brain_memory')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (error) throw error;
    if (count > 0) return;

    const defaults = [
      { category: 'identity', key: 'creator', value: 'Haris Khan', is_pinned: true },
      { category: 'identity', key: 'role', value: 'Full Stack Developer', is_pinned: true },
      { category: 'identity', key: 'education', value: 'BSCS Student', is_pinned: true },
      { category: 'identity', key: 'university', value: 'University of Balochistan', is_pinned: true },
      { category: 'identity', key: 'project', value: 'HARVOX AI', is_pinned: true },
      { category: 'preferences', key: 'preferredLanguage', value: 'JavaScript', is_pinned: false },
      { category: 'preferences', key: 'preferredFramework', value: 'React', is_pinned: false },
      { category: 'preferences', key: 'themePreference', value: 'cyberpunk', is_pinned: false },
      { category: 'preferences', key: 'favoriteModel', value: 'Gemini 2.5 Flash', is_pinned: false },
      {
        category: 'project',
        key: 'activeProject',
        value: 'HARVOX AI Workspace',
        is_pinned: true,
        metadata: {
          description: 'Autonomous AI Operating System and Interactive Developer Environment.',
          architecture: 'Vite React + Node.js/Express + Supabase PostgreSQL + WebSockets',
          status: 'Phase 14 — Supabase Migration Complete',
        },
      },
      {
        category: 'activity',
        key: 'systemStart',
        value: 'System Uplink Stabilized',
        is_pinned: false,
        metadata: { details: 'HARVOX Brain Core initialized successfully.' },
      },
    ];

    const records = defaults.map((d) => ({ ...d, user_id: userId }));
    await supabase.from('brain_memory').insert(records);
    console.log(`[Memory Core] Seeded default operator context for user ${userId}`);
  } catch (err) {
    console.error('[Memory Core] Failed to seed default memories:', err.message);
  }
}

/**
 * Returns formatted text context from the operator's Memory Core to inject into AI System Prompts.
 */
export async function getContextPrompt(userId) {
  try {
    await ensureDefaultMemories(userId);

    const { data: memories, error } = await supabase
      .from('brain_memory')
      .select('*')
      .eq('user_id', userId)
      .neq('category', 'activity')
      .order('is_pinned', { ascending: false })
      .order('category', { ascending: true });

    if (error) throw error;
    if (!memories || !memories.length) return '';

    const grouped = { identity: [], preferences: [], project: [], conversation: [] };
    memories.forEach((m) => {
      if (grouped[m.category]) grouped[m.category].push(m);
    });

    let contextText = '\n\n==================================================\n';
    contextText += "OPERATOR'S LONG-TERM MEMORY CORE (HARVOX Brain Core):\n";

    if (grouped.identity.length) {
      contextText += '\n[OPERATOR IDENTITY MATRIX]\n';
      grouped.identity.forEach((m) => { contextText += `- ${m.key}: ${m.value}\n`; });
    }
    if (grouped.preferences.length) {
      contextText += '\n[OPERATOR PREFERENCES]\n';
      grouped.preferences.forEach((m) => { contextText += `- ${m.key}: ${m.value}\n`; });
    }
    if (grouped.project.length) {
      contextText += '\n[PROJECT METADATA]\n';
      grouped.project.forEach((m) => {
        let metaStr = '';
        if (m.metadata && typeof m.metadata === 'object') {
          metaStr = Object.entries(m.metadata).map(([k, v]) => `${k}: ${v}`).join(', ');
        }
        contextText += `- ${m.key}: ${m.value} (${metaStr})\n`;
      });
    }
    if (grouped.conversation.length) {
      contextText += '\n[IMPORTANT HISTORICAL CONVERSATIONS]\n';
      grouped.conversation.forEach((m) => { contextText += `- Goal/Topic: ${m.key} -> ${m.value}\n`; });
    }

    contextText += '==================================================\n\n';
    return contextText;
  } catch (err) {
    console.error('[Memory Core] Error building context prompt:', err);
    return '';
  }
}

/**
 * Save or update activity log in Memory Core (Emits event to Central Event Bus).
 */
export async function logActivity(userId, actionKey, description, details = {}) {
  eventBus.emitActivity(userId, actionKey, description, details);
}
