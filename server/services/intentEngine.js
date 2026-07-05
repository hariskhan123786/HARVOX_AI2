/**
 * HARVOX AI — Intent Detection Engine (Phase 13.2)
 *
 * Converts natural language user input into structured automation intents.
 * This is the "brain" layer that sits between the chat interface and the
 * automation planner — enabling HARVOX to understand what the user wants
 * before executing anything.
 *
 * Pipeline:
 *   User Input → Intent Detection → Structured Intent → Planner
 */

import * as aiProviderManager from './aiProviderManager.js';

// ─── Intent Schema ────────────────────────────────────────────────────────────

/**
 * Supported top-level intent categories.
 * Maps to automation module domains.
 */
export const INTENT_CATEGORIES = {
  AUTOMATION: 'automation',   // Execute one or more automation actions
  CHAT: 'chat',               // Pure conversation — no automation needed
  CODE: 'code',               // Code generation, debug, explain
  FILE: 'file',               // File system operations
  WORKFLOW: 'workflow',       // Multi-step predefined workflow trigger
  SYSTEM: 'system',           // OS-level: power, settings, display
  SEARCH: 'search',           // Search the web, GitHub, docs
  MEMORY: 'memory',           // Read/update user memory
  STUDY: 'study',             // Study assistant
  UNKNOWN: 'unknown',
};

/**
 * @typedef {Object} IntentAction
 * @property {string} action    - Registry action key (e.g. 'open_app')
 * @property {string[]} args    - Arguments for the action
 * @property {string} label     - Human-readable description
 * @property {boolean} sensitive - Requires user confirmation
 * @property {number} order     - Execution order (1-based)
 * @property {boolean} parallel - Can run in parallel with other steps
 */

/**
 * @typedef {Object} DetectedIntent
 * @property {string} category          - INTENT_CATEGORIES value
 * @property {string} summary           - One-line summary of what the user wants
 * @property {IntentAction[]} actions   - Ordered list of automation steps
 * @property {string} workflowId        - If this matches a predefined workflow
 * @property {number} confidence        - 0.0–1.0 confidence score
 * @property {boolean} requiresConfirmation - True if any action is sensitive
 * @property {string} rawInput          - Original user message
 * @property {string[]} missingInfo     - What the AI needs to know to proceed
 */

// ─── System Prompt ────────────────────────────────────────────────────────────

const INTENT_SYSTEM_PROMPT = `You are HARVOX AI's Intent Detection Engine.
Your job is to analyze the user's natural language input and convert it into a structured JSON intent object.

Available automation actions (use ONLY these exact keys):
SYSTEM: shutdown, restart, sleep, hibernate, lock, logout, volume_up, volume_down, mute, set_volume, screenshot, get_clipboard, set_clipboard, system_info, task_manager, open_settings, disk_cleanup, empty_recycle_bin, night_mode, network_status
APPS: app_open, app_close  (args: ["appName"])
BROWSER: browser_open, browser_navigate, browser_search, browser_new_tab, browser_close_tab, browser_activate_window, navigate_tab, open_chrome, open_edge, open_firefox, search_google, search_github
MEDIA: spotify_play, spotify_pause, spotify_next, spotify_prev, youtube_play, media_play_pause, media_next, media_prev, media_mute, media_volume_up, media_volume_down
FILE: file_create_file, file_create_folder, file_delete, file_rename, file_move, file_compress, file_extract_zip, file_search, file_organize_downloads
DEVELOPER: git_init, git_add, git_commit, git_push, git_status, npm_install, npm_run_dev, npm_build, dev_open_vscode, dev_open_terminal, dev_open_localhost
PRODUCTIVITY: pomodoro_start, pomodoro_stop, focus_mode_enable, study_mode_enable, meeting_mode_enable, prod_create_task, prod_create_reminder, prod_take_note, prod_daily_plan, prod_weekly_plan
COMMUNICATION: whatsapp_open, whatsapp_open_chat, whatsapp_send_message, open_gmail, open_gdrive
STUDY: generate_notes, generate_mcqs, generate_flashcards, log_study
CLOUD: deploy_vercel, deploy_railway

Predefined Workflows (set workflowId, leave actions=[]):
- start_coding: Open VS Code + browser + music + focus mode
- study_session: Open notes + browser + timer + focus mode + music
- deploy_project: git add + commit + push
- morning_routine: Check system + email + weather + tasks
- end_of_day: Commit work + disk cleanup + lock

Return ONLY valid JSON matching this exact schema:
{
  "category": "<automation|chat|code|file|workflow|system|search|study|unknown>",
  "summary": "<one sentence what user wants>",
  "confidence": <0.0-1.0>,
  "workflowId": "<workflow_id or null>",
  "requiresConfirmation": <boolean>,
  "missingInfo": ["<what info is needed, if any>"],
  "actions": [
    {
      "action": "<exact registry key from list above>",
      "args": ["<arg1>", "<arg2>"],
      "label": "<human readable>",
      "sensitive": <boolean>,
      "order": <1-based integer>,
      "parallel": <boolean>
    }
  ]
}

Rules:
- If the input is pure conversation (question, help, discussion), set category="chat" and actions=[]
- If the input mentions code generation/debugging/explanation, set category="code" and actions=[]
- If the input matches a predefined workflow, set workflowId and actions=[] (workflow engine handles it)
- For sensitive actions (shutdown, delete, send message, deploy), set sensitive=true and requiresConfirmation=true
- If you are missing critical info (e.g. "open app" but no app name), add to missingInfo
- confidence < 0.5 means you are guessing — set missingInfo accordingly
- All args must be strings
- ONLY use action keys from the list above — never invent new ones
- Return ONLY the JSON object, no markdown, no explanation`;

// ─── Intent Detection ─────────────────────────────────────────────────────────

/**
 * Detect the user's intent from natural language input.
 * @param {string} input - User's message
 * @param {object} context - Additional context (userId, conversationHistory, memory)
 * @param {object} aiOptions - AI provider options from getAIOptions()
 * @returns {Promise<DetectedIntent>}
 */
export async function detectIntent(input, context = {}, aiOptions = {}) {
  const { conversationHistory = [], memoryContext = '', userId } = context;

  // Fast-path: single-word or very short inputs are almost always chat
  if (input.trim().split(/\s+/).length <= 2 && !hasActionKeyword(input)) {
    return buildChatIntent(input);
  }

  const contextBlock = memoryContext
    ? `\nUser memory context:\n${memoryContext}\n`
    : '';

  const messages = [
    ...conversationHistory.slice(-4).map(m => ({
      role: m.role,
      content: typeof m.content === 'string' ? m.content : JSON.stringify(m.content)
    })),
    {
      role: 'user',
      content: `${contextBlock}Analyze this input and return the intent JSON:\n"${input}"`
    }
  ];

  try {
    const provider = aiOptions.provider || 'groq';
    const model = aiOptions.model || 'llama-3.3-70b-versatile';

    const result = await aiProviderManager.chat({
      messages,
      systemPrompt: INTENT_SYSTEM_PROMPT,
      provider,
      model,
      temperature: 0.1,    // Low temp for deterministic JSON output
      max_tokens: 1024,
      apiKeys: aiOptions.apiKeys || {},
    });

    const text = result.text || result.content || '';
    const intent = parseIntentJSON(text, input);
    return intent;

  } catch (err) {
    console.error('[IntentEngine] Detection failed:', err.message);
    // Fallback: return unknown intent, let planner handle as chat
    return buildUnknownIntent(input, err.message);
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Action keyword hints that suggest automation (not pure chat) */
const ACTION_KEYWORDS = [
  'open', 'launch', 'start', 'run', 'execute', 'close', 'kill',
  'play', 'pause', 'stop', 'next', 'previous', 'mute', 'volume',
  'create', 'make', 'build', 'generate', 'install', 'deploy',
  'shutdown', 'restart', 'sleep', 'lock', 'logout',
  'screenshot', 'record', 'capture', 'copy', 'paste',
  'search', 'find', 'browse', 'navigate', 'download',
  'send', 'email', 'message', 'whatsapp',
  'backup', 'compress', 'extract', 'move', 'delete',
  'git', 'commit', 'push', 'pull',
  'set', 'increase', 'decrease', 'enable', 'disable', 'toggle',
];

function hasActionKeyword(input) {
  const lower = input.toLowerCase();
  return ACTION_KEYWORDS.some(kw => lower.includes(kw));
}

function parseIntentJSON(text, rawInput) {
  try {
    // Strip markdown code blocks if present
    const cleaned = text.replace(/^```(?:json)?\n?/m, '').replace(/\n?```$/m, '').trim();
    const parsed = JSON.parse(cleaned);

    // Validate required fields
    if (!parsed.category || !Array.isArray(parsed.actions)) {
      throw new Error('Invalid intent schema');
    }

    return {
      category: parsed.category || INTENT_CATEGORIES.UNKNOWN,
      summary: parsed.summary || 'Unknown intent',
      confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 0.5,
      workflowId: parsed.workflowId || null,
      requiresConfirmation: parsed.requiresConfirmation === true,
      missingInfo: Array.isArray(parsed.missingInfo) ? parsed.missingInfo : [],
      actions: (parsed.actions || []).map((a, i) => ({
        action: a.action || '',
        args: Array.isArray(a.args) ? a.args.map(String) : [],
        label: a.label || a.action || 'Unknown action',
        sensitive: a.sensitive === true,
        order: a.order || i + 1,
        parallel: a.parallel === true,
      })),
      rawInput,
    };
  } catch (e) {
    console.warn('[IntentEngine] JSON parse failed:', e.message, '| Raw:', text.substring(0, 200));
    return buildUnknownIntent(rawInput, 'Parse error');
  }
}

function buildChatIntent(input) {
  return {
    category: INTENT_CATEGORIES.CHAT,
    summary: 'Conversational message',
    confidence: 0.95,
    workflowId: null,
    requiresConfirmation: false,
    missingInfo: [],
    actions: [],
    rawInput: input,
  };
}

function buildUnknownIntent(input, reason = '') {
  return {
    category: INTENT_CATEGORIES.UNKNOWN,
    summary: reason || 'Could not determine intent',
    confidence: 0.0,
    workflowId: null,
    requiresConfirmation: false,
    missingInfo: ['Please clarify what you would like HARVOX to do.'],
    actions: [],
    rawInput: input,
  };
}

/**
 * Quick synchronous check: does this message look like an automation request?
 * Used to decide whether to route through intent detection or go straight to AI chat.
 * @param {string} input
 * @returns {boolean}
 */
export function looksLikeAutomation(input) {
  return hasActionKeyword(input.toLowerCase());
}
