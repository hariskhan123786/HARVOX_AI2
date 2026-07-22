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
      source: 'system_telemetry',
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
      { category: 'identity', key: 'creator', value: 'Haris Khan', title: 'Operator Creator', is_pinned: true },
      { category: 'identity', key: 'role', value: 'Full Stack Developer', title: 'Developer Role', is_pinned: true },
      { category: 'identity', key: 'education', value: 'BSCS Student', title: 'Education Background', is_pinned: true },
      { category: 'identity', key: 'university', value: 'University of Balochistan', title: 'University', is_pinned: true },
      { category: 'identity', key: 'project', value: 'HARVOX AI', title: 'Primary AI Platform', is_pinned: true },
      { category: 'preferences', key: 'preferredLanguage', value: 'JavaScript', title: 'Programming Language', is_pinned: false },
      { category: 'preferences', key: 'preferredFramework', value: 'React', title: 'Frontend Framework', is_pinned: false },
      { category: 'preferences', key: 'themePreference', value: 'cyberpunk', title: 'UI Theme', is_pinned: false },
      { category: 'preferences', key: 'favoriteModel', value: 'Gemini 2.5 Flash', title: 'Primary AI Model', is_pinned: false },
      {
        category: 'project',
        key: 'activeProject',
        value: 'HARVOX AI Workspace',
        title: 'Current Active Project',
        is_pinned: true,
        metadata: {
          description: 'Autonomous AI Operating System and Interactive Developer Environment.',
          architecture: 'Vite React + Node.js/Express + Supabase PostgreSQL + WebSockets',
          status: 'Phase 15 — Production AI Operating System',
        },
      },
    ];

    const records = defaults.map((d) => ({ ...d, user_id: userId, source: 'manual' }));
    await supabase.from('brain_memory').insert(records);
    console.log(`[Memory Core] Seeded default operator context for user ${userId}`);
  } catch (err) {
    console.error('[Memory Core] Failed to seed default memories:', err.message);
  }
}

/**
 * Retrieves relevant memories using vector similarity or category ranking.
 */
export async function retrieveRelevantMemories(userId, queryText = '', limit = 10) {
  try {
    await ensureDefaultMemories(userId);

    // Fetch pinned and top-ranking unarchived memories for user
    const { data: memories, error } = await supabase
      .from('brain_memory')
      .select('*')
      .eq('user_id', userId)
      .eq('archived', false)
      .neq('category', 'activity')
      .order('is_pinned', { ascending: false })
      .order('importance_score', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return memories || [];
  } catch (err) {
    console.error('[Memory Core] Error retrieving relevant memories:', err.message);
    return [];
  }
}

/**
 * Returns formatted text context from the operator's Memory Core to inject into AI System Prompts.
 */
export async function getContextPrompt(userId, queryText = '') {
  try {
    const memories = await retrieveRelevantMemories(userId, queryText, 15);
    if (!memories || !memories.length) return '';

    const grouped = { identity: [], preferences: [], project: [], goals: [], coding_style: [], conversation: [] };
    memories.forEach((m) => {
      const cat = grouped[m.category] ? m.category : 'conversation';
      grouped[cat].push(m);
    });

    let contextText = '\n\n==================================================\n';
    contextText += "OPERATOR'S LONG-TERM MEMORY CORE (HARVOX AI Brain Core):\n";

    if (grouped.identity.length) {
      contextText += '\n[OPERATOR IDENTITY MATRIX]\n';
      grouped.identity.forEach((m) => { contextText += `- ${m.key}: ${typeof m.value === 'object' ? JSON.stringify(m.value) : m.value}\n`; });
    }
    if (grouped.preferences.length) {
      contextText += '\n[OPERATOR PREFERENCES]\n';
      grouped.preferences.forEach((m) => { contextText += `- ${m.key}: ${typeof m.value === 'object' ? JSON.stringify(m.value) : m.value}\n`; });
    }
    if (grouped.goals.length) {
      contextText += '\n[OPERATOR GOALS & TARGETS]\n';
      grouped.goals.forEach((m) => { contextText += `- ${m.title || m.key}: ${m.value}\n`; });
    }
    if (grouped.coding_style.length) {
      contextText += '\n[CODING STYLE & TECHNICAL PREFERENCES]\n';
      grouped.coding_style.forEach((m) => { contextText += `- ${m.key}: ${m.value}\n`; });
    }
    if (grouped.project.length) {
      contextText += '\n[ACTIVE PROJECT METADATA]\n';
      grouped.project.forEach((m) => {
        let metaStr = '';
        if (m.metadata && typeof m.metadata === 'object') {
          metaStr = Object.entries(m.metadata).map(([k, v]) => `${k}: ${v}`).join(', ');
        }
        contextText += `- ${m.key}: ${m.value} ${metaStr ? `(${metaStr})` : ''}\n`;
      });
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
