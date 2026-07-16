/**
 * HARVOX Automation Engine — Productivity Module
 * Skills: Pomodoro, focus mode, tasks, reminders, planners
 */

import { exec } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import { logActivity } from '../../memoryService.js';
import { registerModule } from '../automationRegistry.js';
import { supabase } from '../../../config/supabase.js';
import { runPS } from '../../../utils/powershell.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const WORKSPACE_DIR = path.resolve(__dirname, '../../../uploads/workspace');

// Active pomodoro timers (in-memory per userId)
const _pomodoroTimers = new Map();

async function showToast(title, message) {
  await runPS(`
$ErrorActionPreference = "SilentlyContinue"
Add-Type -AssemblyName System.Windows.Forms
$notify = New-Object System.Windows.Forms.NotifyIcon
$notify.Icon = [System.Drawing.SystemIcons]::Information
$notify.BalloonTipTitle = "${title.replace(/"/g, '`"')}"
$notify.BalloonTipText = "${message.replace(/"/g, '`"')}"
$notify.Visible = $True
$notify.ShowBalloonTip(8000)
Start-Sleep -Seconds 9
$notify.Dispose()
  `);
}

// ─── Pomodoro ─────────────────────────────────────────────────────────────────

async function startPomodoro(userId, args) {
  const minutes = parseInt(args[0] || '25', 10);
  const ms = minutes * 60 * 1000;

  // Clear existing timer
  if (_pomodoroTimers.has(userId)) {
    clearTimeout(_pomodoroTimers.get(userId));
    _pomodoroTimers.delete(userId);
  }

  // Start timer
  const timer = setTimeout(async () => {
    _pomodoroTimers.delete(userId);
    await showToast('HARVOX Pomodoro', `${minutes}-minute focus session complete! Take a break.`).catch(() => {});
    await logActivity(userId, 'pomodoro_complete', `Pomodoro ${minutes}min completed`, { minutes });
  }, ms);

  _pomodoroTimers.set(userId, timer);

  await showToast('HARVOX Pomodoro Started', `${minutes}-minute focus session started. Stay focused!`).catch(() => {});
  await logActivity(userId, 'pomodoro_start', `Started ${minutes}min Pomodoro`, { minutes });
  return { success: true, message: `${minutes}-minute Pomodoro started. Windows notification will fire when complete.` };
}

async function stopPomodoro(userId) {
  if (_pomodoroTimers.has(userId)) {
    clearTimeout(_pomodoroTimers.get(userId));
    _pomodoroTimers.delete(userId);
    await logActivity(userId, 'pomodoro_stop', 'Stopped Pomodoro');
    return { success: true, message: 'Pomodoro timer stopped.' };
  }
  return { success: true, message: 'No active Pomodoro timer found.' };
}

// ─── Focus Mode ───────────────────────────────────────────────────────────────

const DISTRACTING_APPS = ['Discord', 'Telegram', 'WhatsApp', 'Slack', 'Spotify'];

async function enableFocusMode(userId) {
  for (const app of DISTRACTING_APPS) {
    exec(`taskkill /IM ${app}.exe /F 2>nul`);
  }
  await logActivity(userId, 'focus_mode_on', 'Focus mode enabled — distracting apps closed');
  return { success: true, message: `Focus mode enabled. Closed: ${DISTRACTING_APPS.join(', ')}.` };
}

async function enableStudyMode(userId) {
  // Close distracting apps, open VS Code
  for (const app of DISTRACTING_APPS) {
    exec(`taskkill /IM ${app}.exe /F 2>nul`);
  }
  await new Promise((resolve) => setTimeout(resolve, 500));
  exec('code');

  await showToast('HARVOX Study Mode', 'Study mode activated! Distractions closed, VS Code ready.').catch(() => {});
  await logActivity(userId, 'study_mode_on', 'Study mode enabled');
  return { success: true, message: 'Study mode activated. Distracting apps closed, VS Code launched.' };
}

async function enableMeetingMode(userId) {
  // Mute system audio for clean meetings
  await runPS(`$wshell = New-Object -ComObject wscript.shell; $wshell.SendKeys([char]173);`);
  await showToast('HARVOX Meeting Mode', 'Meeting mode activated. Audio muted.').catch(() => {});
  await logActivity(userId, 'meeting_mode_on', 'Meeting mode enabled');
  return { success: true, message: 'Meeting mode activated. System muted.' };
}

// ─── Task Management ──────────────────────────────────────────────────────────

async function createTask(userId, args) {
  const title = args[0] || 'New Task';
  const deadlineStr = args[1] || '';
  const priority = args[2] || 'medium';

  const deadline = deadlineStr ? new Date(deadlineStr) : undefined;
  const { data: task } = await supabase
    .from('tasks')
    .insert({ user_id: userId, title, deadline: deadline || null, priority })
    .select('id')
    .single();

  await logActivity(userId, 'task_create', `Created task: "${title}"`, { taskId: task?.id });
  return { success: true, message: `Task "${title}" created with priority: ${priority}.` };
}

async function createReminder(userId, args) {
  const text = args[0] || 'Reminder';
  const whenStr = args[1] || '';
  const deadline = whenStr ? new Date(whenStr) : new Date(Date.now() + 60 * 60 * 1000);

  await supabase.from('tasks').insert({ user_id: userId, title: `⏰ ${text}`, deadline: deadline.toISOString(), priority: 'high' });

  const formattedTime = deadline.toLocaleString();
  await showToast('HARVOX Reminder Set', `Reminder: "${text}" set for ${formattedTime}`).catch(() => {});
  await logActivity(userId, 'reminder_create', `Set reminder: "${text}"`, { text });
  return { success: true, message: `Reminder "${text}" set for ${formattedTime}.` };
}

async function takeNote(userId, args) {
  const content = args[0] || '';
  if (!content) throw new Error('Note content is required.');

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 16);
  const noteFile = path.join(WORKSPACE_DIR, 'notes', `note-${timestamp}.md`);
  await fs.mkdir(path.dirname(noteFile), { recursive: true }).catch(() => {});

  const noteContent = `# HARVOX Note — ${new Date().toLocaleString()}\n\n${content}\n`;
  await fs.writeFile(noteFile, noteContent, 'utf-8');

  await logActivity(userId, 'note_taken', `Note saved: ${content.slice(0, 40)}...`);
  return { success: true, message: `Note saved to workspace/notes/note-${timestamp}.md.` };
}

// ─── Planner Generation ───────────────────────────────────────────────────────

async function generateDailyPlan(userId) {
  const now = new Date();
  const day = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  const plan = `# Daily Plan — ${day}

## Morning Routine
- [ ] Review goals and priorities
- [ ] Check emails and messages
- [ ] Plan today's coding tasks

## Deep Work Block (2-3 hours)
- [ ] Focus on most important coding task
- [ ] No social media or distractions
- [ ] Use Pomodoro: 25min work / 5min break

## Afternoon Block
- [ ] Code review and debugging
- [ ] Respond to messages
- [ ] Learning / tutorials

## Evening Review
- [ ] Review completed tasks
- [ ] Plan tomorrow
- [ ] Update progress tracker

---
*Generated by HARVOX AI Productivity Engine*
`;

  const planFile = path.join(WORKSPACE_DIR, 'plans', `daily-plan-${now.toISOString().slice(0, 10)}.md`);
  await fs.mkdir(path.dirname(planFile), { recursive: true }).catch(() => {});
  await fs.writeFile(planFile, plan, 'utf-8');

  await logActivity(userId, 'daily_plan', `Generated daily plan for ${day}`);
  return { success: true, message: `Daily plan for ${day} generated in workspace/plans/.`, output: plan };
}

async function generateWeeklyPlan(userId) {
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay());

  const plan = `# Weekly Plan — Week of ${weekStart.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}

## Weekly Goals
- [ ] Complete main project milestone
- [ ] Learn one new technology/concept
- [ ] Contribute to open source / portfolio
- [ ] Exercise 3x / self-care

## Daily Breakdown
| Day | Focus | Target |
|-----|-------|--------|
| Monday | Planning + Setup | Define goals, set up workspace |
| Tuesday | Deep Development | Core feature development |
| Wednesday | Integration | Connect components, API testing |
| Thursday | Refinement | Bug fixes, code review |
| Friday | Documentation | README, comments, deployment |
| Saturday | Learning | Tutorial, new tech exploration |
| Sunday | Review + Rest | Week review, plan next week |

## Weekly Metrics
- Pomodoros completed: ___
- Code commits: ___
- Learning hours: ___

---
*Generated by HARVOX AI Productivity Engine*
`;

  const planFile = path.join(WORKSPACE_DIR, 'plans', `weekly-plan-${weekStart.toISOString().slice(0, 10)}.md`);
  await fs.mkdir(path.dirname(planFile), { recursive: true }).catch(() => {});
  await fs.writeFile(planFile, plan, 'utf-8');

  await logActivity(userId, 'weekly_plan', 'Generated weekly plan');
  return { success: true, message: `Weekly plan generated in workspace/plans/.`, output: plan };
}

// ─── Daily Life PC Automation Commands ────────────────────────────────────────

async function takeScreenshot(userId) {
  const screenshotName = `screenshot_${Date.now()}.png`;
  const desktopDir = path.join(process.env.USERPROFILE || 'C:\\Users\\Default', 'Desktop');
  const targetPath = path.join(desktopDir, screenshotName);

  // PowerShell script to capture screen
  const script = `
Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing
$Screen = [System.Windows.Forms.SystemInformation]::VirtualScreen
$Width = $Screen.Width
$Height = $Screen.Height
$Left = $Screen.Left
$Top = $Screen.Top
$Bitmap = New-Object System.Drawing.Bitmap $Width, $Height
$Graphic = [System.Drawing.Graphics]::FromImage($Bitmap)
$Graphic.CopyFromScreen($Left, $Top, 0, 0, $Bitmap.Size)
$Bitmap.Save("${targetPath.replace(/\\/g, '\\\\')}", [System.Drawing.Imaging.ImageFormat]::Png)
$Graphic.Dispose()
$Bitmap.Dispose()
Write-Output "Screenshot saved"
  `;

  await runPS(script);
  await logActivity(userId, 'pc_screenshot', `Captured screenshot: ${screenshotName}`);
  return { success: true, message: `Screenshot captured and saved to Desktop as: ${screenshotName}` };
}

async function getSystemStats(userId) {
  const script = `
$cpu = (Get-CimInstance Win32_Processor | Measure-Object -Property LoadPercentage -Average).Average
$mem = Get-CimInstance Win32_OperatingSystem | Select-Object FreePhysicalMemory, TotalVisibleMemorySize
$disk = Get-CimInstance Win32_LogicalDisk -Filter "DeviceID='C:'" | Select-Object FreeSpace, Size
$cpuPct = [Math]::Round($cpu, 1)
$freeMem = [Math]::Round($mem.FreePhysicalMemory / 1MB, 2)
$totalMem = [Math]::Round($mem.TotalVisibleMemorySize / 1MB, 2)
$usedMem = [Math]::Round($totalMem - $freeMem, 2)
$memPct = [Math]::Round(($usedMem / $totalMem) * 100, 1)
$freeDisk = [Math]::Round($disk.FreeSpace / 1GB, 1)
$totalDisk = [Math]::Round($disk.Size / 1GB, 1)
$diskPct = [Math]::Round((($totalDisk - $freeDisk) / $totalDisk) * 100, 1)
Write-Output "CPU: $cpuPct% | Memory: $usedMem GB / $totalMem GB ($memPct%) | Disk C: $freeDisk GB free / $totalDisk GB ($diskPct%)"
  `;

  const output = await runPS(script);
  const cleanOutput = output ? output.trim() : 'Unable to query stats.';
  await logActivity(userId, 'pc_system_stats', 'Retrieved Windows system performance metrics');
  return { success: true, message: `System status retrieved successfully.`, output: cleanOutput };
}

async function lockPC(userId) {
  exec('rundll32.exe user32.dll,LockWorkStation');
  await logActivity(userId, 'pc_lock', 'Locked Windows session');
  return { success: true, message: 'Windows session locked successfully.' };
}

async function sleepPC(userId) {
  const script = `
Add-Type -Assembly System.Windows.Forms
[System.Windows.Forms.Application]::SetSuspendState('Suspend', $false, $false)
  `;
  await runPS(script);
  await logActivity(userId, 'pc_sleep', 'Put PC into sleep suspend state');
  return { success: true, message: 'Sent PC suspend sleep command.' };
}

// ─── Module Registration ──────────────────────────────────────────────────────

registerModule(
  'productivity',
  {
    name: 'Productivity Automation',
    icon: 'Target',
    description: 'Pomodoro timer, focus modes, task management, and daily planning.',
    color: '#34d399',
  },
  [
    { action: 'pomodoro_start',       label: 'Start Pomodoro Timer',     handler: (u, a) => startPomodoro(u, a),     estimatedMs: 2000  },
    { action: 'pomodoro_stop',        label: 'Stop Pomodoro Timer',      handler: (u) => stopPomodoro(u),            estimatedMs: 500   },
    { action: 'focus_mode_enable',    label: 'Enable Focus Mode',        handler: (u) => enableFocusMode(u),         estimatedMs: 3000  },
    { action: 'study_mode_enable',    label: 'Enable Study Mode',        handler: (u) => enableStudyMode(u),         estimatedMs: 5000  },
    { action: 'meeting_mode_enable',  label: 'Enable Meeting Mode',      handler: (u) => enableMeetingMode(u),       estimatedMs: 2000  },
    { action: 'prod_create_task',     label: 'Create Task',              handler: (u, a) => createTask(u, a),        estimatedMs: 1000  },
    { action: 'prod_create_reminder', label: 'Set Reminder',             handler: (u, a) => createReminder(u, a),    estimatedMs: 1000  },
    { action: 'prod_take_note',       label: 'Take a Note',              handler: (u, a) => takeNote(u, a),          estimatedMs: 1000  },
    { action: 'prod_daily_plan',      label: 'Generate Daily Plan',      handler: (u) => generateDailyPlan(u),       estimatedMs: 2000  },
    { action: 'prod_weekly_plan',     label: 'Generate Weekly Plan',     handler: (u) => generateWeeklyPlan(u),      estimatedMs: 2000  },
    // New Commands
    { action: 'take_screenshot',      label: 'Take a Screenshot',        handler: (u) => takeScreenshot(u),          estimatedMs: 3000  },
    { action: 'get_system_stats',     label: 'Get PC System Stats',      handler: (u) => getSystemStats(u),          estimatedMs: 3000  },
    { action: 'pc_lock',              label: 'Lock Windows PC',          handler: (u) => lockPC(u),                  estimatedMs: 1000, sensitive: true },
    { action: 'pc_sleep',             label: 'Sleep Windows PC',         handler: (u) => sleepPC(u),                 estimatedMs: 1500, sensitive: true },
  ]
);
