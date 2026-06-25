import Memory from '../models/Memory.js';

/**
 * Ensures default memories are seeded for the user (specifically matching Haris Khan identity).
 */
export async function ensureDefaultMemories(userId) {
  try {
    const count = await Memory.countDocuments({ userId });
    if (count > 0) return;

    const defaults = [
      // Identity Matrix
      { category: 'identity', key: 'creator', value: 'Haris Khan', isPinned: true },
      { category: 'identity', key: 'role', value: 'Full Stack Developer', isPinned: true },
      { category: 'identity', key: 'education', value: 'BSCS Student', isPinned: true },
      { category: 'identity', key: 'university', value: 'University of Balochistan', isPinned: true },
      { category: 'identity', key: 'project', value: 'HARVOX AI', isPinned: true },

      // Preferences Matrix
      { category: 'preferences', key: 'preferredLanguage', value: 'JavaScript', isPinned: false },
      { category: 'preferences', key: 'preferredFramework', value: 'React', isPinned: false },
      { category: 'preferences', key: 'themePreference', value: 'cyberpunk', isPinned: false },
      { category: 'preferences', key: 'favoriteModel', value: 'Gemini 2.5 Flash', isPinned: false },

      // Initial Project Memory
      {
        category: 'project',
        key: 'activeProject',
        value: 'HARVOX AI Workspace',
        isPinned: true,
        metadata: {
          description: 'Autonomous AI Operating System and Interactive Developer Environment.',
          architecture: 'MERN (Vite React + Node.js/Express + Mongoose + node-pty + WebSockets)',
          status: 'Phase 7 In Development'
        }
      },

      // Initial Activity Memory
      {
        category: 'activity',
        key: 'systemStart',
        value: 'System Uplink Stabilized',
        isPinned: false,
        metadata: {
          details: 'HARVOX Brain Core initialized successfully.'
        }
      }
    ];

    const records = defaults.map(d => ({ ...d, userId }));
    await Memory.insertMany(records);
    console.log(`[Memory Core] Seeded default operator context for user ${userId}`);
  } catch (err) {
    console.error('[Memory Core] Failed to seed default memories:', err.message);
  }
}

/**
 * Returns formatted text context from the operator\'s Memory Core to inject into AI System Prompts.
 */
export async function getContextPrompt(userId) {
  try {
    await ensureDefaultMemories(userId);

    // Retrieve pinned or critical memories (excluding activities unless they are pinned)
    const memories = await Memory.find({ 
      userId, 
      category: { $ne: 'activity' } 
    }).sort({ isPinned: -1, category: 1 });

    if (!memories.length) return '';

    // Group memories by category for neat presentation
    const grouped = {
      identity: [],
      preferences: [],
      project: [],
      conversation: []
    };

    memories.forEach(m => {
      if (grouped[m.category]) {
        grouped[m.category].push(m);
      }
    });

    let contextText = '\n\n==================================================\n';
    contextText += 'OPERATOR\'S LONG-TERM MEMORY CORE (HARVOX Brain Core):\n';
    
    if (grouped.identity.length) {
      contextText += '\n[OPERATOR IDENTITY MATRIX]\n';
      grouped.identity.forEach(m => {
        contextText += `- ${m.key}: ${m.value}\n`;
      });
    }

    if (grouped.preferences.length) {
      contextText += '\n[OPERATOR PREFERENCES]\n';
      grouped.preferences.forEach(m => {
        contextText += `- ${m.key}: ${m.value}\n`;
      });
    }

    if (grouped.project.length) {
      contextText += '\n[PROJECT METADATA]\n';
      grouped.project.forEach(m => {
        let metaStr = '';
        if (m.metadata && typeof m.metadata === 'object') {
          metaStr = Object.entries(m.metadata)
            .map(([k, v]) => `${k}: ${v}`)
            .join(', ');
        }
        contextText += `- ${m.key}: ${m.value} (${metaStr})\n`;
      });
    }

    if (grouped.conversation.length) {
      contextText += '\n[IMPORTANT HISTORICAL CONVERSATIONS]\n';
      grouped.conversation.forEach(m => {
        contextText += `- Goal/Topic: ${m.key} -> ${m.value}\n`;
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
 * Save or update activity log in Memory Core.
 */
export async function logActivity(userId, actionKey, description, details = {}) {
  try {
    await Memory.create({
      userId,
      category: 'activity',
      key: actionKey,
      value: description,
      metadata: details
    });
  } catch (err) {
    console.error('[Memory Core] Failed to log activity memory:', err.message);
  }
}
