/**
 * HARVOX Automation Engine — Browser Module
 * Skills: Open browsers, navigate URLs, tab management, searches
 */

import { exec } from 'child_process';
import { logActivity } from '../../memoryService.js';
import { registerModule } from '../automationRegistry.js';
import { runPS, openWin as openApp } from '../../../utils/powershell.js';

function openUrl(url) {
  return openApp(`start "" "${url}"`);
}

// ─── Browser Launch Skills ────────────────────────────────────────────────────

async function openChrome(userId) {
  await openApp('start chrome');
  await logActivity(userId, 'browser_open', 'Opened Chrome');
  return { success: true, message: 'Google Chrome launched.' };
}

async function openEdge(userId) {
  await openApp('start msedge');
  await logActivity(userId, 'browser_open', 'Opened Edge');
  return { success: true, message: 'Microsoft Edge launched.' };
}

async function openFirefox(userId) {
  await openApp('start firefox');
  await logActivity(userId, 'browser_open', 'Opened Firefox');
  return { success: true, message: 'Firefox launched.' };
}

/**
 * browser_open — opens a named browser or the Windows default browser.
 * Args: ['chrome' | 'edge' | 'firefox' | 'brave'] — optional, defaults to system default.
 */
async function openBrowserDefault(userId, args) {
  const name = (args[0] || '').toLowerCase();
  const browserCmds = {
    chrome: 'start chrome',
    edge: 'start msedge',
    firefox: 'start firefox',
    brave: 'start brave',
  };
  const cmd = browserCmds[name] || 'start "" "about:blank"';
  await openApp(cmd);
  await logActivity(userId, 'browser_open', `Opened browser: ${name || 'default'}`);
  return { success: true, message: `Browser opened${name ? ': ' + name : ' (default).'}.` };
}


// ─── Popular Site Skills ──────────────────────────────────────────────────────

const POPULAR_SITES = {
  open_github:          { url: 'https://github.com',                label: 'Open GitHub' },
  open_fiverr:          { url: 'https://www.fiverr.com',            label: 'Open Fiverr' },
  open_linkedin:        { url: 'https://www.linkedin.com',          label: 'Open LinkedIn' },
  open_stackoverflow:   { url: 'https://stackoverflow.com',         label: 'Open Stack Overflow' },
  open_chatgpt:         { url: 'https://chat.openai.com',           label: 'Open ChatGPT' },
  open_gmail:           { url: 'https://mail.google.com',           label: 'Open Gmail' },
  open_gdrive:          { url: 'https://drive.google.com',          label: 'Open Google Drive' },
  open_notion:          { url: 'https://www.notion.so',             label: 'Open Notion' },
  open_trello:          { url: 'https://trello.com',                label: 'Open Trello' },
  open_figma:           { url: 'https://www.figma.com',             label: 'Open Figma' },
  open_claude:          { url: 'https://claude.ai',                 label: 'Open Claude' },
  open_vercel:          { url: 'https://vercel.com',                label: 'Open Vercel' },
  open_netlify:         { url: 'https://www.netlify.com',           label: 'Open Netlify' },
  open_railway:         { url: 'https://railway.app',               label: 'Open Railway' },
  open_npmjs:           { url: 'https://www.npmjs.com',             label: 'Open NPM' },
  open_mdn:             { url: 'https://developer.mozilla.org',     label: 'Open MDN Docs' },
  open_tailwindcss:     { url: 'https://tailwindcss.com/docs',      label: 'Open Tailwind Docs' },
  open_whatsapp_web:    { url: 'https://web.whatsapp.com',          label: 'Open WhatsApp Web' },
  open_localhost_3000:  { url: 'http://localhost:3000',             label: 'Open localhost:3000' },
  open_localhost_5173:  { url: 'http://localhost:5173',             label: 'Open localhost:5173' },
  open_localhost_5000:  { url: 'http://localhost:5000',             label: 'Open localhost:5000' },
  open_localhost_8000:  { url: 'http://localhost:8000',             label: 'Open localhost:8000' },
};

async function openSite(userId, action) {
  const site = POPULAR_SITES[action];
  if (!site) throw new Error(`Unknown site action: ${action}`);
  await openUrl(site.url);
  await logActivity(userId, 'browser_navigate', `Opened ${site.label}`, { url: site.url });
  return { success: true, message: `${site.label} opened in browser.` };
}

// ─── Open Localhost (dynamic port) ───────────────────────────────────────────

async function openLocalhost(userId, args) {
  const port = args[0] || '3000';
  const url = `http://localhost:${port}`;
  await openUrl(url);
  await logActivity(userId, 'browser_localhost', `Opened localhost:${port}`);
  return { success: true, message: `Opened localhost:${port} in browser.` };
}

// ─── Search Skills ────────────────────────────────────────────────────────────

async function searchGoogle(userId, args) {
  const query = args[0] || '';
  const url = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
  await openUrl(url);
  await logActivity(userId, 'browser_search', `Google search: "${query}"`, { query });
  return { success: true, message: `Opened Google search for "${query}".` };
}

async function searchGitHub(userId, args) {
  const query = args[0] || '';
  const url = `https://github.com/search?q=${encodeURIComponent(query)}`;
  await openUrl(url);
  await logActivity(userId, 'browser_search', `GitHub search: "${query}"`, { query });
  return { success: true, message: `Opened GitHub search for "${query}".` };
}

async function searchNPM(userId, args) {
  const query = args[0] || '';
  const url = `https://www.npmjs.com/search?q=${encodeURIComponent(query)}`;
  await openUrl(url);
  return { success: true, message: `Opened NPM search for "${query}".` };
}

// ─── Tab Management (via keyboard shortcuts) ──────────────────────────────────

async function browserNewTab(userId) {
  await runPS(`
$wshell = New-Object -ComObject wscript.shell;
$browsers = @("Chrome","Edge","Firefox","Brave");
foreach ($b in $browsers) { if ($wshell.AppActivate($b)) { break } }
Start-Sleep -Milliseconds 300;
$wshell.SendKeys("^t");
  `);
  return { success: true, message: 'Opened a new browser tab.' };
}

async function browserCloseTab(userId) {
  await runPS(`
$wshell = New-Object -ComObject wscript.shell;
$browsers = @("Chrome","Edge","Firefox","Brave");
foreach ($b in $browsers) { if ($wshell.AppActivate($b)) { break } }
Start-Sleep -Milliseconds 300;
$wshell.SendKeys("^w");
  `);
  return { success: true, message: 'Closed the current browser tab.' };
}

async function browserReopenTab(userId) {
  await runPS(`
$wshell = New-Object -ComObject wscript.shell;
$browsers = @("Chrome","Edge","Firefox","Brave");
foreach ($b in $browsers) { if ($wshell.AppActivate($b)) { break } }
Start-Sleep -Milliseconds 300;
$wshell.SendKeys("^+t");
  `);
  return { success: true, message: 'Reopened the last closed browser tab.' };
}

async function browserNextTab(userId) {
  await runPS(`
$wshell = New-Object -ComObject wscript.shell;
$browsers = @("Chrome","Edge","Firefox","Brave");
foreach ($b in $browsers) { if ($wshell.AppActivate($b)) { break } }
Start-Sleep -Milliseconds 300;
$wshell.SendKeys("^{TAB}");
  `);
  return { success: true, message: 'Switched to next browser tab.' };
}

async function browserDownloads(userId) {
  await runPS(`
$wshell = New-Object -ComObject wscript.shell;
$browsers = @("Chrome","Edge","Firefox","Brave");
foreach ($b in $browsers) { if ($wshell.AppActivate($b)) { break } }
Start-Sleep -Milliseconds 300;
$wshell.SendKeys("^j");
  `);
  return { success: true, message: 'Opened Downloads page in browser.' };
}

async function browserBookmark(userId) {
  await runPS(`
$wshell = New-Object -ComObject wscript.shell;
$browsers = @("Chrome","Edge","Firefox","Brave");
foreach ($b in $browsers) { if ($wshell.AppActivate($b)) { break } }
Start-Sleep -Milliseconds 300;
$wshell.SendKeys("^d");
  `);
  return { success: true, message: 'Bookmarked the current page.' };
}

async function browserNavigate(userId, args) {
  const url = args[0] || '';
  if (!url) throw new Error('URL is required.');
  const fullUrl = url.startsWith('http') ? url : `https://${url}`;
  await openUrl(fullUrl);
  await logActivity(userId, 'browser_navigate', `Navigated to ${fullUrl}`, { url: fullUrl });
  return { success: true, message: `Opened ${fullUrl} in browser.` };
}

async function activateWindow(userId, args) {
  const target = args[0] || '';
  if (!target) throw new Error('Target window or tab title is required.');

  const script = [
    '$wshell = New-Object -ComObject wscript.shell',
    `$success = $wshell.AppActivate("${target.replace(/"/g, '`"')}")`,
    'if ($success) {',
    '  Write-Output "Successfully focused: ' + target + '"',
    '} else {',
    '  throw "Could not find any window or tab matching: ' + target + '"',
    '}'
  ].join('\r\n');

  const output = await runPS(script, 'activate_win');
  await logActivity(userId, 'activate_window', `Focused window/tab: "${target}"`, { target });
  return { success: true, message: `Activated and focused window/tab matching "${target}".`, output };
}

// ─── Module Registration ──────────────────────────────────────────────────────

registerModule(
  'browser',
  {
    name: 'Browser Automation',
    icon: 'Globe',
    description: 'Open browsers, navigate websites, manage tabs, and search the web.',
    color: '#00f0ff',
  },
  [
    // Browser launch
    { action: 'open_chrome',        label: 'Open Chrome',              handler: (u) => openChrome(u),              estimatedMs: 2000 },
    { action: 'open_edge',          label: 'Open Edge',                handler: (u) => openEdge(u),                estimatedMs: 2000 },
    { action: 'open_firefox',       label: 'Open Firefox',             handler: (u) => openFirefox(u),             estimatedMs: 2000 },
    // Alias: browser_open — used by planner/workflow templates
    { action: 'browser_open',       label: 'Open Browser',             handler: (u, a) => openBrowserDefault(u, a), estimatedMs: 2000 },
    // Navigate URL
    { action: 'browser_navigate',   label: 'Navigate to URL',          handler: (u, a) => browserNavigate(u, a),   estimatedMs: 2000 },
    // Focus Tab or Window
    { action: 'browser_activate_window', label: 'Focus Window/Tab',    handler: (u, a) => activateWindow(u, a),    estimatedMs: 1500 },
    { action: 'navigate_tab',       label: 'Navigate to Tab',          handler: (u, a) => activateWindow(u, a),    estimatedMs: 1500 },
    // Popular sites
    ...Object.keys(POPULAR_SITES).map((action) => ({
      action,
      label: POPULAR_SITES[action].label,
      handler: (u) => openSite(u, action),
      estimatedMs: 2000,
    })),
    // Localhost
    { action: 'open_localhost',     label: 'Open localhost',           handler: (u, a) => openLocalhost(u, a),     estimatedMs: 2000 },
    // Search
    { action: 'search_google',      label: 'Search Google',            handler: (u, a) => searchGoogle(u, a),      estimatedMs: 2000 },
    { action: 'browser_search',     label: 'Search Web (Alias)',       handler: (u, a) => searchGoogle(u, a),      estimatedMs: 2000 },
    { action: 'search_github',      label: 'Search GitHub',            handler: (u, a) => searchGitHub(u, a),      estimatedMs: 2000 },
    { action: 'search_npm',         label: 'Search NPM',               handler: (u, a) => searchNPM(u, a),         estimatedMs: 2000 },
    // Tab management
    { action: 'browser_new_tab',    label: 'New Browser Tab',          handler: (u) => browserNewTab(u),           estimatedMs: 1000 },
    { action: 'browser_close_tab',  label: 'Close Browser Tab',        handler: (u) => browserCloseTab(u),         estimatedMs: 1000 },
    { action: 'browser_reopen_tab', label: 'Reopen Closed Tab',        handler: (u) => browserReopenTab(u),        estimatedMs: 1000 },
    { action: 'browser_next_tab',   label: 'Switch to Next Tab',       handler: (u) => browserNextTab(u),          estimatedMs: 1000 },
    { action: 'browser_downloads',  label: 'Open Downloads',           handler: (u) => browserDownloads(u),        estimatedMs: 1000 },
    { action: 'browser_bookmark',   label: 'Bookmark Page',            handler: (u) => browserBookmark(u),         estimatedMs: 1000 },
  ]
);
