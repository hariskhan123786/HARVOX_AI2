/**
 * HARVOX Desktop Agent Proxy
 * ─────────────────────────────────────────────────────────────────────────────
 * In production (Vercel/cloud), the server cannot run PowerShell or GUI
 * automation directly. Instead, we proxy the request to the user's locally
 * running Desktop Agent (harvox desktop-agent/agent.mjs) on port 8765.
 *
 * The agent must be running on the user's machine:
 *   cd desktop-agent && node agent.mjs
 *
 * The flow:
 *   Browser → Vercel API → (this proxy) → localhost:8765 → Windows Desktop
 *
 * NOTE: This only works when the user's browser and agent are on the same
 * machine, which is the expected use case for personal automation.
 */

const AGENT_PORT = process.env.HARVOX_AGENT_PORT || 8765;

// In production we can't reach localhost:8765 directly — the request
// must go FROM the user's browser (client-side) or we rely on the frontend
// to make the direct call. This service provides a structured response
// telling the client to make the desktop agent call itself.

export const IS_SERVERLESS = process.env.VERCEL === '1' || process.env.NODE_ENV === 'production';

/**
 * Actions that require the desktop agent (OS-level, GUI, PowerShell).
 * These CANNOT run on a serverless server. They must be forwarded to
 * the local agent from the browser.
 */
export const DESKTOP_AGENT_ACTIONS = new Set([
  // Media
  'spotify_play', 'spotify_next', 'spotify_prev', 'spotify_pause',
  'spotify_shuffle', 'spotify_repeat', 'spotify_open', 'spotify_liked_songs',
  'youtube_play', 'youtube_search', 'youtube_open', 'youtube_fullscreen',
  'youtube_speed_up', 'youtube_speed_down', 'youtube_subtitles',
  'youtube_like', 'youtube_watch_later', 'youtube_skip',
  'open_netflix', 'open_prime_video', 'open_disney_plus', 'open_youtube_music',
  'media_volume_up', 'media_volume_down', 'media_mute', 'media_play_pause',
  'media_next_track', 'media_prev_track', 'media_stop',
  // Browser
  'open_chrome', 'open_edge', 'open_firefox', 'browser_open',
  'browser_navigate', 'browser_new_tab', 'browser_close_tab',
  'browser_reopen_tab', 'browser_next_tab', 'browser_downloads',
  'browser_bookmark', 'browser_activate_window', 'navigate_tab',
  'open_github', 'open_fiverr', 'open_linkedin', 'open_stackoverflow',
  'open_chatgpt', 'open_gmail', 'open_gdrive', 'open_notion',
  'open_trello', 'open_figma', 'open_claude', 'open_vercel',
  'open_netlify', 'open_railway', 'open_npmjs', 'open_mdn',
  'open_tailwindcss', 'open_whatsapp_web',
  'open_localhost', 'open_localhost_3000', 'open_localhost_5173', 'open_localhost_5000',
  'search_google', 'browser_search', 'search_github', 'search_npm',
  // System
  'system_lock', 'system_shutdown', 'system_restart', 'system_sleep',
  'volume_up', 'volume_down', 'mute',
  'open_settings', 'open_task_manager', 'open_file_explorer',
  'app_open', 'open_app',
  // Productivity (OS-level)
  'focus_mode_enable', 'study_mode_enable', 'pomodoro_start',
  // WhatsApp desktop
  'whatsapp_open_chat', 'whatsapp_send_message',
]);

/**
 * Returns a structured "needs desktop agent" response.
 * The frontend will use this to make the request directly to localhost:8765.
 *
 * @param {string} action
 * @param {string[]} args
 * @returns {{ requiresDesktopAgent: true, action, args, agentPort }}
 */
export function buildAgentProxyResponse(action, args = []) {
  return {
    requiresDesktopAgent: true,
    action,
    args,
    agentPort: Number(AGENT_PORT),
    message: `⚡ This action requires your Desktop Agent. Make sure it is running on your PC.\n\nStart it with: cd desktop-agent && node agent.mjs`,
  };
}

/**
 * Check if an action requires the desktop agent AND we're in a serverless env.
 */
export function needsAgentProxy(action) {
  return IS_SERVERLESS && DESKTOP_AGENT_ACTIONS.has(action);
}
