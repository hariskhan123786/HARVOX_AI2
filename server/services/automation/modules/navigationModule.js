/**
 * HARVOX Automation Engine — Navigation Module
 * Skills: App switching, tab management, window control, workspace navigation
 */

import { exec } from 'child_process';
import { logActivity } from '../../memoryService.js';
import { registerModule } from '../automationRegistry.js';
import { runPS } from '../../../utils/powershell.js';

// ─── App Switching Skills ─────────────────────────────────────────────────────

async function switchToApp(userId, args) {
  const appName = args[0] || '';
  if (!appName) throw new Error('App name is required.');
  
  const script = `
$wshell = New-Object -ComObject wscript.shell
$activated = $wshell.AppActivate("${appName}")
if (-not $activated) {
  Write-Output "App '${appName}' not found or not running."
  exit 1
}
  `;
  
  await runPS(script);
  await logActivity(userId, 'nav_switch_app', `Switched to app: ${appName}`, { appName });
  return { success: true, message: `Switched to "${appName}".` };
}

async function altTab(userId) {
  await runPS(`
$wshell = New-Object -ComObject wscript.shell
$wshell.SendKeys("%{TAB}")
  `);
  await logActivity(userId, 'nav_alt_tab', 'Switched apps (Alt+Tab)');
  return { success: true, message: 'Switched to next app (Alt+Tab).' };
}

async function altTabReverse(userId) {
  await runPS(`
$wshell = New-Object -ComObject wscript.shell
$wshell.SendKeys("%+{TAB}")
  `);
  return { success: true, message: 'Switched to previous app (Alt+Shift+Tab).' };
}

async function showDesktop(userId) {
  await runPS(`
$wshell = New-Object -ComObject wscript.shell
$wshell.SendKeys("^{ESC}d")
  `);
  await logActivity(userId, 'nav_desktop', 'Showed desktop');
  return { success: true, message: 'Desktop shown (Win+D).' };
}

async function minimizeAll(userId) {
  await runPS(`
$wshell = New-Object -ComObject wscript.shell
$wshell.SendKeys("#{m}")
  `);
  await logActivity(userId, 'nav_minimize_all', 'Minimized all windows');
  return { success: true, message: 'All windows minimized (Win+M).' };
}

async function taskView(userId) {
  await runPS(`
$wshell = New-Object -ComObject wscript.shell
$wshell.SendKeys("#{TAB}")
  `);
  await logActivity(userId, 'nav_task_view', 'Opened Task View');
  return { success: true, message: 'Task View opened (Win+Tab).' };
}

// ─── Browser Tab Management ───────────────────────────────────────────────────

async function browserNewTab(userId) {
  await runPS(`
$wshell = New-Object -ComObject wscript.shell
$browsers = @("Chrome", "Edge", "Firefox", "Brave")
foreach ($b in $browsers) {
  if ($wshell.AppActivate($b)) { break }
}
Start-Sleep -Milliseconds 200
$wshell.SendKeys("^t")
  `);
  await logActivity(userId, 'nav_new_tab', 'Opened new browser tab');
  return { success: true, message: 'New tab opened (Ctrl+T).' };
}

async function browserCloseTab(userId) {
  await runPS(`
$wshell = New-Object -ComObject wscript.shell
$browsers = @("Chrome", "Edge", "Firefox", "Brave")
foreach ($b in $browsers) {
  if ($wshell.AppActivate($b)) { break }
}
Start-Sleep -Milliseconds 200
$wshell.SendKeys("^w")
  `);
  await logActivity(userId, 'nav_close_tab', 'Closed browser tab');
  return { success: true, message: 'Tab closed (Ctrl+W).' };
}

async function browserNextTab(userId) {
  await runPS(`
$wshell = New-Object -ComObject wscript.shell
$browsers = @("Chrome", "Edge", "Firefox", "Brave")
foreach ($b in $browsers) {
  if ($wshell.AppActivate($b)) { break }
}
Start-Sleep -Milliseconds 200
$wshell.SendKeys("^{TAB}")
  `);
  return { success: true, message: 'Switched to next tab (Ctrl+Tab).' };
}

async function browserPrevTab(userId) {
  await runPS(`
$wshell = New-Object -ComObject wscript.shell
$browsers = @("Chrome", "Edge", "Firefox", "Brave")
foreach ($b in $browsers) {
  if ($wshell.AppActivate($b)) { break }
}
Start-Sleep -Milliseconds 200
$wshell.SendKeys("^+{TAB}")
  `);
  return { success: true, message: 'Switched to previous tab (Ctrl+Shift+Tab).' };
}

async function browserReopenTab(userId) {
  await runPS(`
$wshell = New-Object -ComObject wscript.shell
$browsers = @("Chrome", "Edge", "Firefox", "Brave")
foreach ($b in $browsers) {
  if ($wshell.AppActivate($b)) { break }
}
Start-Sleep -Milliseconds 200
$wshell.SendKeys("^+t")
  `);
  await logActivity(userId, 'nav_reopen_tab', 'Reopened closed tab');
  return { success: true, message: 'Last closed tab reopened (Ctrl+Shift+T).' };
}

async function browserFullscreen(userId) {
  await runPS(`
$wshell = New-Object -ComObject wscript.shell
$browsers = @("Chrome", "Edge", "Firefox", "Brave")
foreach ($b in $browsers) {
  if ($wshell.AppActivate($b)) { break }
}
Start-Sleep -Milliseconds 200
$wshell.SendKeys("{F11}")
  `);
  return { success: true, message: 'Toggled fullscreen (F11).' };
}

async function browserRefresh(userId) {
  await runPS(`
$wshell = New-Object -ComObject wscript.shell
$browsers = @("Chrome", "Edge", "Firefox", "Brave")
foreach ($b in $browsers) {
  if ($wshell.AppActivate($b)) { break }
}
Start-Sleep -Milliseconds 200
$wshell.SendKeys("{F5}")
  `);
  return { success: true, message: 'Page refreshed (F5).' };
}

async function browserHardRefresh(userId) {
  await runPS(`
$wshell = New-Object -ComObject wscript.shell
$browsers = @("Chrome", "Edge", "Firefox", "Brave")
foreach ($b in $browsers) {
  if ($wshell.AppActivate($b)) { break }
}
Start-Sleep -Milliseconds 200
$wshell.SendKeys("^{F5}")
  `);
  return { success: true, message: 'Hard refresh (Ctrl+F5).' };
}

async function browserBack(userId) {
  await runPS(`
$wshell = New-Object -ComObject wscript.shell
$browsers = @("Chrome", "Edge", "Firefox", "Brave")
foreach ($b in $browsers) {
  if ($wshell.AppActivate($b)) { break }
}
Start-Sleep -Milliseconds 200
$wshell.SendKeys("%{LEFT}")
  `);
  return { success: true, message: 'Navigated back (Alt+Left).' };
}

async function browserForward(userId) {
  await runPS(`
$wshell = New-Object -ComObject wscript.shell
$browsers = @("Chrome", "Edge", "Firefox", "Brave")
foreach ($b in $browsers) {
  if ($wshell.AppActivate($b)) { break }
}
Start-Sleep -Milliseconds 200
$wshell.SendKeys("%{RIGHT}")
  `);
  return { success: true, message: 'Navigated forward (Alt+Right).' };
}

async function browserFocusAddressBar(userId) {
  await runPS(`
$wshell = New-Object -ComObject wscript.shell
$browsers = @("Chrome", "Edge", "Firefox", "Brave")
foreach ($b in $browsers) {
  if ($wshell.AppActivate($b)) { break }
}
Start-Sleep -Milliseconds 200
$wshell.SendKeys("^l")
  `);
  return { success: true, message: 'Address bar focused (Ctrl+L).' };
}

// ─── Window Management ────────────────────────────────────────────────────────

async function maximizeWindow(userId) {
  await runPS(`
$wshell = New-Object -ComObject wscript.shell
$wshell.SendKeys("#{UP}")
  `);
  return { success: true, message: 'Window maximized (Win+Up).' };
}

async function minimizeWindow(userId) {
  await runPS(`
$wshell = New-Object -ComObject wscript.shell
$wshell.SendKeys("#{DOWN}")
  `);
  return { success: true, message: 'Window minimized (Win+Down).' };
}

async function snapWindowLeft(userId) {
  await runPS(`
$wshell = New-Object -ComObject wscript.shell
$wshell.SendKeys("#{LEFT}")
  `);
  await logActivity(userId, 'nav_snap_left', 'Snapped window left');
  return { success: true, message: 'Window snapped to left half (Win+Left).' };
}

async function snapWindowRight(userId) {
  await runPS(`
$wshell = New-Object -ComObject wscript.shell
$wshell.SendKeys("#{RIGHT}")
  `);
  await logActivity(userId, 'nav_snap_right', 'Snapped window right');
  return { success: true, message: 'Window snapped to right half (Win+Right).' };
}

async function closeWindow(userId) {
  await runPS(`
$wshell = New-Object -ComObject wscript.shell
$wshell.SendKeys("%{F4}")
  `);
  return { success: true, message: 'Window closed (Alt+F4).' };
}

// ─── Quick Launch Applications ────────────────────────────────────────────────

async function openApp(userId, args) {
  const appName = args[0] || '';
  if (!appName) throw new Error('App name is required.');
  
  // Common app mappings
  const appMappings = {
    'chrome': 'chrome',
    'edge': 'msedge',
    'firefox': 'firefox',
    'brave': 'brave',
    'vscode': 'code',
    'code': 'code',
    'terminal': 'wt',
    'cmd': 'cmd',
    'powershell': 'powershell',
    'notepad': 'notepad',
    'paint': 'mspaint',
    'calculator': 'calc',
    'explorer': 'explorer',
    'spotify': 'spotify',
    'discord': 'discord',
    'slack': 'slack',
    'teams': 'teams',
    'zoom': 'zoom',
    'obs': 'obs64',
    'vlc': 'vlc',
    'notion': 'notion',
    'obsidian': 'obsidian',
    'figma': 'figma',
    'postman': 'postman',
    'insomnia': 'insomnia',
    'docker': 'docker',
    'git': 'git-bash',
    'github': 'github',
    'antigravity': 'antigravity', // Custom app
  };
  
  const command = appMappings[appName.toLowerCase()] || appName;
  
  try {
    await new Promise((resolve, reject) => {
      exec(`start ${command}`, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    
    await logActivity(userId, 'nav_open_app', `Launched app: ${appName}`, { appName });
    return { success: true, message: `"${appName}" launched.` };
  } catch (error) {
    throw new Error(`Failed to launch "${appName}". Make sure it's installed.`);
  }
}

// ─── Module Registration ──────────────────────────────────────────────────────

registerModule(
  'navigation',
  {
    name: 'Navigation & Window Management',
    icon: 'Grid3x3',
    description: 'Switch apps, manage tabs, control windows, and navigate workspaces.',
    color: '#fbbf24',
  },
  [
    // App Switching
    { action: 'nav_switch_app',          label: 'Switch to App',             handler: (u, a) => switchToApp(u, a),        estimatedMs: 500 },
    { action: 'nav_alt_tab',             label: 'Switch App (Alt+Tab)',      handler: (u) => altTab(u),                   estimatedMs: 500 },
    { action: 'nav_alt_tab_reverse',     label: 'Switch Back (Alt+Shift+Tab)', handler: (u) => altTabReverse(u),         estimatedMs: 500 },
    { action: 'nav_show_desktop',        label: 'Show Desktop',              handler: (u) => showDesktop(u),              estimatedMs: 500 },
    { action: 'nav_minimize_all',        label: 'Minimize All',              handler: (u) => minimizeAll(u),              estimatedMs: 500 },
    { action: 'nav_task_view',           label: 'Task View',                 handler: (u) => taskView(u),                 estimatedMs: 500 },
    // Browser Tabs
    { action: 'browser_new_tab',         label: 'New Tab',                   handler: (u) => browserNewTab(u),            estimatedMs: 500 },
    { action: 'browser_close_tab',       label: 'Close Tab',                 handler: (u) => browserCloseTab(u),          estimatedMs: 500 },
    { action: 'browser_next_tab',        label: 'Next Tab',                  handler: (u) => browserNextTab(u),           estimatedMs: 500 },
    { action: 'browser_prev_tab',        label: 'Previous Tab',              handler: (u) => browserPrevTab(u),           estimatedMs: 500 },
    { action: 'browser_reopen_tab',      label: 'Reopen Closed Tab',         handler: (u) => browserReopenTab(u),         estimatedMs: 500 },
    { action: 'browser_fullscreen',      label: 'Toggle Fullscreen',         handler: (u) => browserFullscreen(u),        estimatedMs: 500 },
    { action: 'browser_refresh',         label: 'Refresh Page',              handler: (u) => browserRefresh(u),           estimatedMs: 500 },
    { action: 'browser_hard_refresh',    label: 'Hard Refresh',              handler: (u) => browserHardRefresh(u),       estimatedMs: 500 },
    { action: 'browser_back',            label: 'Go Back',                   handler: (u) => browserBack(u),              estimatedMs: 500 },
    { action: 'browser_forward',         label: 'Go Forward',                handler: (u) => browserForward(u),           estimatedMs: 500 },
    { action: 'browser_address_bar',     label: 'Focus Address Bar',         handler: (u) => browserFocusAddressBar(u),   estimatedMs: 500 },
    // Window Management
    { action: 'window_maximize',         label: 'Maximize Window',           handler: (u) => maximizeWindow(u),           estimatedMs: 500 },
    { action: 'window_minimize',         label: 'Minimize Window',           handler: (u) => minimizeWindow(u),           estimatedMs: 500 },
    { action: 'window_snap_left',        label: 'Snap Left',                 handler: (u) => snapWindowLeft(u),           estimatedMs: 500 },
    { action: 'window_snap_right',       label: 'Snap Right',                handler: (u) => snapWindowRight(u),          estimatedMs: 500 },
    { action: 'window_close',            label: 'Close Window',              handler: (u) => closeWindow(u),              estimatedMs: 500 },
    // Quick Launch
    { action: 'open_application',        label: 'Open Application',          handler: (u, a) => openApp(u, a),            estimatedMs: 2000 },
  ]
);
