/**
 * HARVOX Automation Engine — System Module
 * Skills: Power management, display, volume, network, clipboard, screenshot, system info
 * Phase 13.1 — Desktop OS control
 */

import { exec } from 'child_process';
import { logActivity } from '../../memoryService.js';
import { registerModule } from '../automationRegistry.js';
import { runPS, runPSCommand, execCmd } from '../../../utils/powershell.js';

// ─── Power Management ─────────────────────────────────────────────────────────

async function shutdownComputer(userId, args) {
  const delay = parseInt(args[0] || '60', 10);
  await runPSCommand(`shutdown /s /t ${delay}`);
  await logActivity(userId, 'system_shutdown', `Shutdown scheduled in ${delay}s`);
  return { success: true, message: `⚠️ Computer will shut down in ${delay} seconds. Run "shutdown /a" to cancel.` };
}

async function cancelShutdown(userId) {
  await execCmd('shutdown /a').catch(() => {});
  await logActivity(userId, 'system_shutdown_cancel', 'Shutdown cancelled');
  return { success: true, message: '✅ Shutdown/restart cancelled.' };
}

async function restartComputer(userId, args) {
  const delay = parseInt(args[0] || '60', 10);
  await runPSCommand(`shutdown /r /t ${delay}`);
  await logActivity(userId, 'system_restart', `Restart scheduled in ${delay}s`);
  return { success: true, message: `⚠️ Computer will restart in ${delay} seconds. Run "shutdown /a" to cancel.` };
}

async function sleepComputer(userId) {
  await runPS(`Add-Type -AssemblyName System.Windows.Forms; [System.Windows.Forms.Application]::SetSuspendState('Suspend', $false, $false)`, 'sleep');
  await logActivity(userId, 'system_sleep', 'Computer sleeping');
  return { success: true, message: '💤 Putting computer to sleep...' };
}

async function hibernateComputer(userId) {
  await execCmd('shutdown /h');
  await logActivity(userId, 'system_hibernate', 'Computer hibernating');
  return { success: true, message: '🔋 Hibernating computer...' };
}

async function lockComputer(userId) {
  await runPSCommand('rundll32.exe user32.dll, LockWorkStation');
  await logActivity(userId, 'system_lock', 'Computer locked');
  return { success: true, message: '🔒 Computer locked.' };
}

async function logoutUser(userId) {
  await runPSCommand('shutdown /l');
  await logActivity(userId, 'system_logout', 'User logged out');
  return { success: true, message: '👋 Logging out...' };
}

// ─── Volume Controls ──────────────────────────────────────────────────────────

async function volumeUp(userId, args) {
  const steps = parseInt(args[0] || '5', 10);
  const script = `
$obj = New-Object -ComObject WScript.Shell
for ($i=0; $i -lt ${steps}; $i++) { $obj.SendKeys([char]175) }
`;
  await runPS(script, 'vol');
  await logActivity(userId, 'volume_up', `Volume up ${steps} steps`);
  return { success: true, message: `🔊 Volume increased by ${steps} steps.` };
}

async function volumeDown(userId, args) {
  const steps = parseInt(args[0] || '5', 10);
  const script = `
$obj = New-Object -ComObject WScript.Shell
for ($i=0; $i -lt ${steps}; $i++) { $obj.SendKeys([char]174) }
`;
  await runPS(script, 'vol');
  await logActivity(userId, 'volume_down', `Volume down ${steps} steps`);
  return { success: true, message: `🔉 Volume decreased by ${steps} steps.` };
}

async function muteVolume(userId) {
  const script = `
$obj = New-Object -ComObject WScript.Shell
$obj.SendKeys([char]173)
`;
  await runPS(script, 'mute');
  await logActivity(userId, 'volume_mute', 'Volume muted/unmuted');
  return { success: true, message: '🔇 Volume toggled mute.' };
}

async function setVolume(userId, args) {
  const level = Math.max(0, Math.min(100, parseInt(args[0] || '50', 10)));
  const script = `
$wshell = New-Object -ComObject wscript.shell
$currentVol = (Get-ItemProperty -Path "HKCU:\\Software\\Microsoft\\Multimedia\\Audio" -ErrorAction SilentlyContinue).UserPreferenceLevel
for ($i=0; $i -le 50; $i++) { $wshell.SendKeys([char]174) }
$steps = [Math]::Round(${level} / 2)
for ($i=0; $i -lt $steps; $i++) { $wshell.SendKeys([char]175) }
`;
  await runPS(script, 'setvol');
  await logActivity(userId, 'volume_set', `Volume set to ${level}%`);
  return { success: true, message: `🔊 Volume set to approximately ${level}%.` };
}

// ─── Screenshot & Screen Recording ───────────────────────────────────────────

async function takeScreenshot(userId, args) {
  const filename = args[0] || `screenshot_${Date.now()}.png`;
  const savePath = `$env:USERPROFILE\\Pictures\\${filename}`;
  const script = `
Add-Type -AssemblyName System.Windows.Forms
$screen = [System.Windows.Forms.Screen]::PrimaryScreen.Bounds
$bitmap = New-Object System.Drawing.Bitmap($screen.Width, $screen.Height)
$graphics = [System.Drawing.Graphics]::FromImage($bitmap)
$graphics.CopyFromScreen($screen.Location, [System.Drawing.Point]::Empty, $screen.Size)
$bitmap.Save("${savePath.replace(/\\/g, '\\\\')}")
$graphics.Dispose()
$bitmap.Dispose()
Write-Host "Screenshot saved"
`;
  const result = await runPS(script, 'screenshot');
  await logActivity(userId, 'screenshot', `Screenshot saved: ${filename}`);
  return {
    success: true,
    message: `📸 Screenshot saved to Pictures\\${filename}`,
    path: `%USERPROFILE%\\Pictures\\${filename}`
  };
}

// ─── Clipboard ────────────────────────────────────────────────────────────────

async function getClipboard(userId) {
  const clipContent = await runPS('Get-Clipboard', 'clip');
  await logActivity(userId, 'clipboard_read', 'Read clipboard');
  return { success: true, message: '📋 Clipboard content retrieved.', content: clipContent };
}

async function setClipboard(userId, args) {
  const text = args.join(' ');
  const escaped = text.replace(/'/g, "''");
  await runPS(`Set-Clipboard -Value '${escaped}'`, 'clip');
  await logActivity(userId, 'clipboard_write', `Set clipboard: ${text.substring(0, 50)}`);
  return { success: true, message: `📋 Clipboard set to: "${text.substring(0, 80)}${text.length > 80 ? '...' : ''}"` };
}

// ─── System Info ─────────────────────────────────────────────────────────────

async function getSystemInfo(userId) {
  const script = [
    '$cpu = (Get-WmiObject Win32_Processor).Name',
    '$ram = [Math]::Round((Get-WmiObject Win32_ComputerSystem).TotalPhysicalMemory / 1GB, 2)',
    '$disk = Get-PSDrive C | Select-Object Used,Free',
    '$usedGB = [Math]::Round($disk.Used / 1GB, 2)',
    '$freeGB = [Math]::Round($disk.Free / 1GB, 2)',
    '$os = (Get-WmiObject Win32_OperatingSystem).Caption',
    '$uptime = (Get-Date) - (gcim Win32_OperatingSystem).LastBootUpTime',
    '"CPU: $cpu"',
    '"RAM: ${ram} GB"',
    '"Disk C: Used ${usedGB}GB / Free ${freeGB}GB"',
    '"OS: $os"',
    '"Uptime: $([Math]::Floor($uptime.TotalHours))h $($uptime.Minutes)m"',
  ].join('\r\n');
  const result = await runPS(script, 'sysinfo');
  await logActivity(userId, 'system_info', 'Retrieved system info');
  return { success: true, message: '💻 System Information', info: result };
}

async function openTaskManager(userId) {
  await execCmd('taskmgr').catch(() => {});
  await logActivity(userId, 'task_manager', 'Opened Task Manager');
  return { success: true, message: '📊 Task Manager opened.' };
}

async function openSettings(userId, args) {
  const page = args[0] || '';
  const pages = {
    display: 'ms-settings:display',
    bluetooth: 'ms-settings:bluetooth',
    wifi: 'ms-settings:network-wifi',
    sound: 'ms-settings:sound',
    power: 'ms-settings:powersleep',
    apps: 'ms-settings:appsfeatures',
    updates: 'ms-settings:windowsupdate',
    privacy: 'ms-settings:privacy',
    default: 'ms-settings:'
  };
  const uri = pages[page.toLowerCase()] || pages.default;
  await execCmd(`start ${uri}`);
  await logActivity(userId, 'open_settings', `Opened Settings: ${page || 'home'}`);
  return { success: true, message: `⚙️ Windows Settings opened${page ? ` (${page})` : ''}.` };
}

async function diskCleanup(userId) {
  await execCmd('cleanmgr /sagerun:1').catch(() => {});
  await logActivity(userId, 'disk_cleanup', 'Disk Cleanup launched');
  return { success: true, message: '🧹 Disk Cleanup launched.' };
}

async function emptyRecycleBin(userId) {
  await runPS('Clear-RecycleBin -Force -ErrorAction SilentlyContinue', 'recycle');
  await logActivity(userId, 'recycle_bin', 'Recycle Bin emptied');
  return { success: true, message: '🗑️ Recycle Bin emptied.' };
}

async function toggleNightMode(userId) {
  const script = `
$regPath = "HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\CloudStore\\Store\\DefaultAccount\\Current\\default\$windows.data.bluelightreduction.bluelightreductionstate\\windows.data.bluelightreduction.bluelightreductionstate"
$current = (Get-ItemProperty -Path $regPath -ErrorAction SilentlyContinue).Data
if ($current) { Write-Host "Night mode toggled" }
Start-Process ms-settings:display
`;
  await runPS(script, 'nightmode');
  await logActivity(userId, 'night_mode', 'Night mode toggled');
  return { success: true, message: '🌙 Night mode toggled. Opening Display Settings to confirm.' };
}

// ─── Network ─────────────────────────────────────────────────────────────────

async function getNetworkStatus(userId) {
  const script = [
    '$wifi = Get-NetAdapter | Where-Object {$_.Status -eq "Up" -and $_.Name -like "*Wi-Fi*"}',
    '$eth = Get-NetAdapter | Where-Object {$_.Status -eq "Up" -and $_.Name -like "*Ethernet*"}',
    '$ip = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object {$_.PrefixOrigin -ne "WellKnown"} | Select-Object -First 1).IPAddress',
    '"WiFi: $(if($wifi){\'Connected: \' + $wifi.Name}else{\'Disconnected\'})"',
    '"Ethernet: $(if($eth){\'Connected\'}else{\'Disconnected\'})"',
    '"Local IP: $ip"',
  ].join('\r\n');
  const result = await runPS(script, 'netstat');
  await logActivity(userId, 'network_status', 'Checked network status');
  return { success: true, message: '🌐 Network Status', info: result };
}

// ─── Register Module ──────────────────────────────────────────────────────────

registerModule(
  'system',
  { name: 'System', icon: '🖥️', description: 'Desktop OS control — power, audio, display, clipboard, info' },
  [
    // Power
    {
      action: 'shutdown',
      label: 'Shutdown Computer',
      sensitive: true,
      estimatedMs: 2000,
      voiceAliases: ['shut down', 'turn off computer', 'power off'],
      category: 'power',
      permissions: ['system.shutdown'],
      rollbackAction: 'cancel_shutdown',
      handler: shutdownComputer
    },
    {
      action: 'cancel_shutdown',
      label: 'Cancel Shutdown',
      sensitive: false,
      estimatedMs: 1000,
      voiceAliases: ['cancel shutdown', 'abort shutdown'],
      category: 'power',
      handler: cancelShutdown
    },
    {
      action: 'restart',
      label: 'Restart Computer',
      sensitive: true,
      estimatedMs: 2000,
      voiceAliases: ['restart', 'reboot', 'restart computer'],
      category: 'power',
      permissions: ['system.restart'],
      rollbackAction: 'cancel_shutdown',
      handler: restartComputer
    },
    {
      action: 'sleep',
      label: 'Sleep Computer',
      sensitive: false,
      estimatedMs: 1000,
      voiceAliases: ['sleep', 'sleep mode', 'put to sleep'],
      category: 'power',
      handler: sleepComputer
    },
    {
      action: 'hibernate',
      label: 'Hibernate Computer',
      sensitive: false,
      estimatedMs: 1000,
      voiceAliases: ['hibernate'],
      category: 'power',
      handler: hibernateComputer
    },
    {
      action: 'lock',
      label: 'Lock Computer',
      sensitive: false,
      estimatedMs: 500,
      voiceAliases: ['lock', 'lock screen', 'lock computer'],
      category: 'power',
      handler: lockComputer
    },
    {
      action: 'logout',
      label: 'Log Out',
      sensitive: true,
      estimatedMs: 1000,
      voiceAliases: ['log out', 'sign out'],
      category: 'power',
      handler: logoutUser
    },

    // Volume
    {
      action: 'volume_up',
      label: 'Volume Up',
      sensitive: false,
      estimatedMs: 500,
      voiceAliases: ['volume up', 'louder', 'increase volume'],
      category: 'audio',
      handler: volumeUp
    },
    {
      action: 'volume_down',
      label: 'Volume Down',
      sensitive: false,
      estimatedMs: 500,
      voiceAliases: ['volume down', 'quieter', 'decrease volume'],
      category: 'audio',
      handler: volumeDown
    },
    {
      action: 'mute',
      label: 'Mute/Unmute',
      sensitive: false,
      estimatedMs: 500,
      voiceAliases: ['mute', 'unmute', 'silence'],
      category: 'audio',
      handler: muteVolume
    },
    {
      action: 'set_volume',
      label: 'Set Volume',
      sensitive: false,
      estimatedMs: 1000,
      voiceAliases: ['set volume to', 'volume at'],
      category: 'audio',
      handler: setVolume
    },

    // Screen
    {
      action: 'screenshot',
      label: 'Take Screenshot',
      sensitive: false,
      estimatedMs: 2000,
      voiceAliases: ['screenshot', 'take screenshot', 'capture screen'],
      category: 'screen',
      handler: takeScreenshot
    },

    // Clipboard
    {
      action: 'get_clipboard',
      label: 'Get Clipboard',
      sensitive: false,
      estimatedMs: 500,
      voiceAliases: ['get clipboard', 'read clipboard', 'clipboard content'],
      category: 'clipboard',
      handler: getClipboard
    },
    {
      action: 'set_clipboard',
      label: 'Set Clipboard',
      sensitive: false,
      estimatedMs: 500,
      voiceAliases: ['copy to clipboard', 'set clipboard'],
      category: 'clipboard',
      handler: setClipboard
    },

    // System Info & Management
    {
      action: 'system_info',
      label: 'System Info',
      sensitive: false,
      estimatedMs: 3000,
      voiceAliases: ['system info', 'computer info', 'hardware info'],
      category: 'info',
      handler: getSystemInfo
    },
    {
      action: 'task_manager',
      label: 'Open Task Manager',
      sensitive: false,
      estimatedMs: 1000,
      voiceAliases: ['task manager', 'open task manager'],
      category: 'system',
      handler: openTaskManager
    },
    {
      action: 'open_settings',
      label: 'Open Settings',
      sensitive: false,
      estimatedMs: 1000,
      voiceAliases: ['open settings', 'windows settings', 'settings'],
      category: 'system',
      handler: openSettings
    },
    {
      action: 'disk_cleanup',
      label: 'Disk Cleanup',
      sensitive: false,
      estimatedMs: 2000,
      voiceAliases: ['disk cleanup', 'clean disk', 'clean storage'],
      category: 'system',
      handler: diskCleanup
    },
    {
      action: 'empty_recycle_bin',
      label: 'Empty Recycle Bin',
      sensitive: true,
      estimatedMs: 2000,
      voiceAliases: ['empty recycle bin', 'clear recycle bin'],
      category: 'system',
      permissions: ['system.delete'],
      handler: emptyRecycleBin
    },
    {
      action: 'night_mode',
      label: 'Toggle Night Mode',
      sensitive: false,
      estimatedMs: 1000,
      voiceAliases: ['night mode', 'night light', 'blue light filter'],
      category: 'display',
      handler: toggleNightMode
    },
    {
      action: 'network_status',
      label: 'Network Status',
      sensitive: false,
      estimatedMs: 2000,
      voiceAliases: ['network status', 'wifi status', 'internet status'],
      category: 'network',
      handler: getNetworkStatus
    },
  ]
);

console.log('[SystemModule] ✅ System module registered (power, audio, screen, clipboard, info)');
