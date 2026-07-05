/**
 * HARVOX Automation Engine — Smart Workflow Planner Module
 * Generates AI-powered multi-step automation plans from natural language.
 * Also handles application automation (open apps).
 */

import { exec } from 'child_process';
import { logActivity } from '../../memoryService.js';
import { registerModule } from '../automationRegistry.js';
import { getAllModules, getAllActions } from '../automationRegistry.js';

// ─── Application Launch Matrix ────────────────────────────────────────────────

const APP_MATRIX = {
  chrome: 'start chrome', 'google chrome': 'start chrome',
  firefox: 'start firefox', 'mozilla firefox': 'start firefox',
  edge: 'start msedge', 'microsoft edge': 'start msedge',
  brave: 'start brave', opera: 'start opera',
  word: 'start winword', excel: 'start excel',
  powerpoint: 'start powerpnt', outlook: 'start outlook',
  onenote: 'start onenote', teams: 'start ms-teams:',
  'microsoft teams': 'start ms-teams:',
  vscode: 'code', 'vs code': 'code', 'visual studio code': 'code',
  'visual studio': 'start devenv',
  notepad: 'notepad', 'notepad++': 'start notepad++',
  calculator: 'calc', calc: 'calc',
  paint: 'mspaint', 'ms paint': 'mspaint',
  snipping: 'snippingtool', 'snipping tool': 'snippingtool',
  taskmgr: 'taskmgr', 'task manager': 'taskmgr',
  powershell: 'start powershell',
  terminal: 'start wt', 'windows terminal': 'start wt',
  cmd: 'start cmd', 'command prompt': 'start cmd',
  'control panel': 'control', 'file explorer': 'explorer', explorer: 'explorer',
  spotify: 'start spotify:', discord: 'start discord:',
  slack: 'start slack:', zoom: 'start zoommtg:',
  skype: 'start skype:', telegram: 'start tg:',
  whatsapp: 'start whatsapp:', vlc: 'start vlc',
  'media player': 'start wmplayer',
  steam: 'start steam:', figma: 'start figma:',
  postman: 'start postman', github: 'start github-windows:',
  'github desktop': 'start github-windows:',
  'android studio': 'start "Android Studio" "C:\\Program Files\\Android\\Android Studio\\bin\\studio64.exe"',
  cursor: 'cursor',
};

function resolveApp(name) {
  const n = name.toLowerCase().trim();
  if (APP_MATRIX[n]) return APP_MATRIX[n];
  for (const [key, cmd] of Object.entries(APP_MATRIX)) {
    if (n.includes(key) || key.includes(n)) return cmd;
  }
  return null;
}

// ─── Application Automation Skills ───────────────────────────────────────────

async function openApplication(userId, args) {
  const appName = args[0] || '';
  if (!appName) throw new Error('Application name is required.');

  const command = resolveApp(appName);
  if (!command) {
    // Fallback: try direct launch
    exec(`start "" "${appName}"`);
    await logActivity(userId, 'app_open', `Attempted to launch: ${appName}`, { appName });
    return { success: true, message: `Attempted to launch "${appName}". Check if it opened.` };
  }

  return new Promise((resolve, reject) => {
    exec(command, async (err) => {
      if (err) {
        const isProtocol = command.includes(':') && !command.includes('.exe');
        if (isProtocol) {
          await logActivity(userId, 'app_open', `Launched via protocol: ${appName}`, { appName });
          return resolve({ success: true, message: `${appName} launch protocol sent.` });
        }
        return reject(new Error(`Failed to launch "${appName}": ${err.message}`));
      }
      await logActivity(userId, 'app_open', `Launched: ${appName}`, { appName });
      resolve({ success: true, message: `"${appName}" launched successfully.` });
    });
  });
}

async function closeApplication(userId, args) {
  const appName = args[0] || '';
  if (!appName) throw new Error('Application name is required.');

  // Map app names to process names
  const processMap = {
    'vs code': 'Code.exe', 'vscode': 'Code.exe', 'visual studio code': 'Code.exe',
    'chrome': 'chrome.exe', 'google chrome': 'chrome.exe',
    'firefox': 'firefox.exe', 'edge': 'msedge.exe',
    'spotify': 'Spotify.exe', 'discord': 'Discord.exe',
    'teams': 'Teams.exe', 'zoom': 'Zoom.exe',
    'notepad': 'notepad.exe', 'calculator': 'Calculator.exe',
  };

  const processName = processMap[appName.toLowerCase()] || `${appName}.exe`;

  return new Promise((resolve) => {
    exec(`taskkill /IM "${processName}" /F`, async (err) => {
      if (err) {
        return resolve({ success: false, message: `Could not close "${appName}". It may already be closed or the process name is different.` });
      }
      await logActivity(userId, 'app_close', `Closed: ${appName}`, { appName });
      resolve({ success: true, message: `"${appName}" closed successfully.` });
    });
  });
}

// ─── Smart Context Skills ─────────────────────────────────────────────────────

async function getSystemInfo(userId) {
  const info = {
    time: new Date().toLocaleString(),
    platform: process.platform,
    hostname: require('os')?.hostname?.() || 'unknown',
    cwd: process.cwd(),
  };
  return { success: true, message: 'System context retrieved.', output: JSON.stringify(info, null, 2) };
}

async function listModules(userId) {
  const modules = getAllModules();
  const summary = modules.map(m => `${m.name}: ${m.skills.length} skills`).join('\n');
  return {
    success: true,
    message: `HARVOX Automation Engine — ${modules.length} modules loaded with ${getAllActions().length} total skills:`,
    output: summary,
  };
}

// ─── Module Registration ──────────────────────────────────────────────────────

registerModule(
  'application',
  {
    name: 'Application Automation',
    icon: 'AppWindow',
    description: 'Launch and close any Windows application, manage running processes.',
    color: '#f87171',
  },
  [
    { action: 'app_open',  label: 'Open Application',  handler: (u, a) => openApplication(u, a), estimatedMs: 3000 },
    { action: 'app_close', label: 'Close Application', handler: (u, a) => closeApplication(u, a), estimatedMs: 2000, sensitive: true },
  ]
);

registerModule(
  'smart_workflow',
  {
    name: 'Smart Workflow Engine',
    icon: 'Workflow',
    description: 'AI-powered multi-step workflow planning and system context awareness.',
    color: '#8b5cf6',
  },
  [
    { action: 'system_info',    label: 'Get System Info',      handler: (u) => getSystemInfo(u),  estimatedMs: 500 },
    { action: 'list_modules',   label: 'List All Modules',     handler: (u) => listModules(u),    estimatedMs: 500 },
  ]
);
