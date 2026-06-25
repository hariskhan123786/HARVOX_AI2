import { exec } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { logActivity } from './memoryService.js';
import Task from '../models/Task.js';
import LearningTrack from '../models/LearningTrack.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Root workspace folder inside server uploads directory
const WORKSPACE_DIR = path.resolve(__dirname, '../uploads/workspace');

// ─── MASSIVE APP MATRIX ────────────────────────────────────────────────────────
// Maps fuzzy name keywords → Windows launch command
const APP_MATRIX = {
  // Browsers
  chrome: 'start chrome',
  'google chrome': 'start chrome',
  firefox: 'start firefox',
  'mozilla firefox': 'start firefox',
  edge: 'start msedge',
  'microsoft edge': 'start msedge',
  brave: 'start brave',
  opera: 'start opera',

  // Microsoft Office
  word: 'start winword',
  excel: 'start excel',
  powerpoint: 'start powerpnt',
  outlook: 'start outlook',
  onenote: 'start onenote',
  teams: 'start ms-teams:',
  'microsoft teams': 'start ms-teams:',

  // Dev Tools
  vscode: 'code',
  'vs code': 'code',
  'visual studio code': 'code',
  'visual studio': 'start devenv',
  notepad: 'notepad',
  'notepad++': 'start notepad++',
  sublime: 'start subl',

  // System Apps
  calculator: 'calc',
  calc: 'calc',
  paint: 'mspaint',
  'ms paint': 'mspaint',
  snipping: 'snippingtool',
  'snipping tool': 'snippingtool',
  taskmgr: 'taskmgr',
  'task manager': 'taskmgr',
  powershell: 'start powershell',
  terminal: 'start wt',
  'windows terminal': 'start wt',
  cmd: 'start cmd',
  'command prompt': 'start cmd',
  registry: 'regedit',
  regedit: 'regedit',
  'device manager': 'devmgmt.msc',
  'control panel': 'control',
  'file explorer': 'explorer',
  explorer: 'explorer',
  'windows explorer': 'explorer',
  clock: 'start ms-clock:',
  calendar: 'start outlookcal:',
  maps: 'start bingmaps:',
  'windows maps': 'start bingmaps:',
  photos: 'start ms-photos:',
  camera: 'start microsoft.windows.camera:',
  'windows store': 'start ms-windows-store:',
  store: 'start ms-windows-store:',

  // Media & Communication
  spotify: 'start spotify:',
  discord: 'start discord:',
  slack: 'start slack:',
  zoom: 'start zoommtg:',
  skype: 'start skype:',
  telegram: 'start tg:',
  whatsapp: 'start whatsapp:',
  signal: 'start signal.exe',
  vlc: 'start vlc',
  'media player': 'start wmplayer',
  'windows media player': 'start wmplayer',
  itunes: 'start itunes',

  // Utilities / Other
  steam: 'start steam:',
  'epic games': 'start com.epicgames.launcher:',
  minecraft: 'start minecraft:',
  'adobe photoshop': 'start photoshop',
  photoshop: 'start photoshop',
  gimp: 'start gimp',
  figma: 'start figma:',
  postman: 'start postman',
  github: 'start github-windows:',
  'github desktop': 'start github-windows:',
  filezilla: 'start filezilla',
  '7zip': 'start 7zfm.exe',
  winrar: 'start winrar',
  putty: 'start putty',
};

/**
 * Resolve appName string → launch command using fuzzy matching
 */
function resolveAppCommand(appName) {
  const name = appName.toLowerCase().trim();

  // Exact match first
  if (APP_MATRIX[name]) return APP_MATRIX[name];

  // Partial/contains match
  for (const [key, cmd] of Object.entries(APP_MATRIX)) {
    if (name.includes(key) || key.includes(name)) {
      return cmd;
    }
  }

  return null;
}

/**
 * Execute a specific automation action.
 */
export async function executeAutomationStep(userId, step) {
  const { action } = step;

  // Normalize args — support both args[] array and target string
  let args = [];
  if (Array.isArray(step.args) && step.args.length > 0) {
    args = step.args;
  } else if (step.target) {
    args = [step.target];
  }

  // Ensure workspace dir exists
  await fs.mkdir(WORKSPACE_DIR, { recursive: true }).catch(() => { });

  console.log(`[Automation] action='${action}' args=${JSON.stringify(args)}`);

  switch (action) {
    case 'open_app':
    case 'launch_app':
      return await openApp(userId, args[0] || '');

    case 'open_url':
      return await openUrl(userId, args[0] || '');

    case 'mkdir':
      return await makeDirectory(userId, args[0] || '');

    case 'create_file':
      return await createFile(userId, args[0] || '', args[1] || '');

    case 'run_command':
    case 'shell_command':
      return await runShellCommand(userId, args[0] || '');

    case 'open_vscode':
      return await openVSCode(userId, args[0] || '');

    // ─── NEW PHASE 8 AUTOMATION ACTIONS ───────────────────────────────────────────
    case 'create_project':
    case 'create_react_project':
      return await createProject(userId, args[0] || 'harvox-app', args[1] || 'react', args[2] || '');

    case 'create_component':
      return await createComponent(userId, args[0] || '', args[1] || '');

    case 'smart_search':
      return await smartSearch(userId, args[0] || '');

    case 'organize_directory':
      return await organizeDirectory(userId, args[0] || '');

    case 'backup_project':
      return await backupProject(userId, args[0] || '');

    case 'draft_email':
      return await draftEmail(userId, args[0] || '', args[1] || '', args[2] || '');

    case 'export_document':
      return await exportDocument(userId, args[0] || '', args[1] || '', args[2] || 'markdown');

    case 'log_learning':
      return await logLearningAction(userId, args[0] || '', args[1] || 0, args[2] || '');

    case 'manage_tasks':
      return await manageTasksAction(userId, args[0] || 'create', args[1] || '', args[2] || '', args[3] || 'medium');

    case 'youtube_play':
      return await youtubePlay(userId, args[0] || '');

    case 'whatsapp_send':
      return await whatsappSend(userId, args[0] || '', args[1] || '');

    case 'type_text':
      return await typeText(userId, args[0] || '', args[1] || 30);

    case 'click_element':
      return await clickElement(userId, args[0] || '');

    case 'play_music':
      return await playMusic(userId, args[0] || '');

    case 'media_control':
      return await mediaControl(userId, args[0] || '');

    default:
      throw new Error(`Unsupported automation action: '${action}'.`);
  }
}

/**
 * Open Windows Applications
 */
async function openApp(userId, appName) {
  if (!appName) {
    throw new Error('No application name provided.');
  }

  const command = resolveAppCommand(appName);

  if (!command) {
    const fallbackCmd = `start "" "${appName}"`;
    console.warn(`[Automation] '${appName}' not in matrix — attempting raw launch: ${fallbackCmd}`);
    return new Promise((resolve, reject) => {
      exec(fallbackCmd, async (err) => {
        if (err) {
          return reject(
            new Error(`Application '${appName}' could not be launched directly.`)
          );
        }
        await logActivity(userId, 'open_app', `Launched (fallback): ${appName}`, { app: appName });
        resolve({ success: true, message: `Attempted to launch '${appName}'.` });
      });
    });
  }

  return new Promise((resolve, reject) => {
    exec(command, async (err) => {
      if (err) {
        const isProtocol = command.includes(':') && !command.includes('.exe');
        if (isProtocol) {
          await logActivity(userId, 'open_app', `Launched via protocol: ${appName}`, { app: appName, command });
          return resolve({ success: true, message: `${appName} launch protocol sent.` });
        }
        return reject(new Error(`Failed to launch '${appName}': ${err.message}`));
      }
      await logActivity(userId, 'open_app', `Launched application: ${appName}`, { app: appName, command });
      resolve({ success: true, message: `${appName} launched successfully.` });
    });
  });
}

/**
 * Open URLs in the default browser
 */
async function openUrl(userId, url) {
  if (!/^https?:\/\/[^\s$.?#].[^\s]*$/i.test(url)) {
    throw new Error(`Security Guard: Rejected invalid URL format '${url}'`);
  }

  const command = `start "" "${url}"`;
  return new Promise((resolve, reject) => {
    exec(command, async (err) => {
      if (err) {
        return reject(new Error(`Failed to open URL: ${err.message}`));
      }
      await logActivity(userId, 'open_url', `Opened URL: ${url}`, { url });
      resolve({ success: true, message: `Opened URL: ${url}` });
    });
  });
}

/**
 * Create a directory inside the mock workspace
 */
async function makeDirectory(userId, dirName) {
  const cleanName = dirName.replace(/^(\.\.(\/ |\\|$))+/, '');
  const targetPath = path.resolve(WORKSPACE_DIR, cleanName);

  if (!targetPath.startsWith(WORKSPACE_DIR)) {
    throw new Error('Access Denied: Path is outside the allowed workspace directory.');
  }

  await fs.mkdir(targetPath, { recursive: true });
  await logActivity(userId, 'mkdir', `Created directory: ${cleanName}`, { path: cleanName });
  return { success: true, message: `Directory created: ${cleanName}` };
}

/**
 * Create a file in the workspace
 */
async function createFile(userId, filePath, content) {
  const cleanPath = filePath.replace(/^(\.\.(\/ |\\|$))+/, '');
  const targetPath = path.resolve(WORKSPACE_DIR, cleanPath);

  if (!targetPath.startsWith(WORKSPACE_DIR)) {
    throw new Error('Access Denied: File path is outside the allowed workspace directory.');
  }

  await fs.mkdir(path.dirname(targetPath), { recursive: true }).catch(() => { });
  await fs.writeFile(targetPath, content, 'utf-8');

  await logActivity(userId, 'create_file', `Created file: ${cleanPath}`, {
    file: cleanPath,
    bytes: content.length,
  });

  return { success: true, message: `File created: ${cleanPath}` };
}

/**
 * Run shell commands on Windows
 */
async function runShellCommand(userId, command) {
  const forbidden = ['rmdir /s', 'del /f', 'format', 'mklink', 'reg delete', 'shutdown', 'attrib', 'net user'];
  if (forbidden.some(term => command.toLowerCase().includes(term))) {
    throw new Error('Security Guard: Blocked execution of potentially destructive shell command.');
  }

  return new Promise((resolve, reject) => {
    exec(command, { cwd: WORKSPACE_DIR }, async (err, stdout, stderr) => {
      await logActivity(userId, 'run_command', `Executed: ${command}`, {
        command,
        exitCode: err ? err.code : 0,
        success: !err,
      });

      if (err) {
        return reject(new Error(`Command failed: ${stderr || err.message}`));
      }

      resolve({
        success: true,
        message: 'Command executed successfully.',
        output: stdout || stderr || 'Command completed with empty output.',
      });
    });
  });
}

/**
 * Open folder in VS Code
 */
async function openVSCode(userId, folderPath) {
  let targetPath = WORKSPACE_DIR;
  if (folderPath && folderPath.trim() !== '') {
    const cleanPath = folderPath.replace(/^(\.\.(\/ |\\|$))+/, '');
    targetPath = path.resolve(WORKSPACE_DIR, cleanPath);
  }

  const command = `code "${targetPath}"`;
  return new Promise((resolve, reject) => {
    exec(command, async (err) => {
      if (err) {
        return reject(new Error(`Failed to open folder in VS Code: ${err.message}`));
      }
      await logActivity(userId, 'open_vscode', 'Opened workspace folder in VS Code', { path: targetPath });
      resolve({ success: true, message: 'VS Code opened folder successfully.' });
    });
  });
}

// ─── NEW HIGH-LEVEL WINDOWS AUTOMATIONS ──────────────────────────────────────

/**
 * Generic Project Generator
 */
async function createProject(userId, projectName, projectType = 'react', template = '') {
  const cleanName = projectName.replace(/[^a-zA-Z0-9-_]/g, '');
  const projectPath = path.resolve(WORKSPACE_DIR, cleanName);

  if (!projectPath.startsWith(WORKSPACE_DIR)) {
    throw new Error('Access Denied: Path is outside the allowed workspace directory.');
  }

  const type = projectType.toLowerCase().trim();

  // Log start
  await logActivity(userId, 'project_init', `Initializing ${projectType} project: ${cleanName}`, { projectName: cleanName, projectType });

  let successMsg = '';

  if (['react', 'vue', 'svelte', 'vanilla'].includes(type)) {
    const viteTemplate = template || type;
    // 1. Create Vite App
    await new Promise((resolve, reject) => {
      exec(`npx --yes create-vite@latest "${cleanName}" --template ${viteTemplate}`, { cwd: WORKSPACE_DIR }, (err, stdout, stderr) => {
        if (err) return reject(new Error(`Vite creation failed: ${stderr || err.message}`));
        resolve();
      });
    });

    // 2. Install dependencies
    await logActivity(userId, 'project_install', `Installing dependencies for: ${cleanName}`, { projectName: cleanName });
    await new Promise((resolve, reject) => {
      exec(`npm install`, { cwd: projectPath }, (err, stdout, stderr) => {
        if (err) return reject(new Error(`npm install failed: ${stderr || err.message}`));
        resolve();
      });
    });

    // 3. Install Tailwind CSS
    await logActivity(userId, 'project_tailwind', `Installing Tailwind CSS for: ${cleanName}`, { projectName: cleanName });
    await new Promise((resolve, reject) => {
      exec(`npm install -D tailwindcss postcss autoprefixer`, { cwd: projectPath }, (err, stdout, stderr) => {
        if (err) return reject(new Error(`Tailwind installation failed: ${stderr || err.message}`));
        resolve();
      });
    });

    // 4. Configure Tailwind Config
    const tailwindConfig = `/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx,vue,svelte}",
  ],
  theme: {
    extend: {
      colors: {
        'neon-purple': '#8a2be2',
        'neon-blue': '#00f0ff',
        'neon-pink': '#ff007f',
      }
    },
  },
  plugins: [],
}`;
    await fs.writeFile(path.join(projectPath, 'tailwind.config.js'), tailwindConfig, 'utf-8');

    // 5. Configure PostCSS
    const postcssConfig = `export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}`;
    await fs.writeFile(path.join(projectPath, 'postcss.config.js'), postcssConfig, 'utf-8');

    // 6. Write CSS file with tailwind directives
    const cssContent = `@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  margin: 0;
  background-color: #080510;
}`;
    await fs.mkdir(path.join(projectPath, 'src'), { recursive: true }).catch(() => { });
    await fs.writeFile(path.join(projectPath, 'src/index.css'), cssContent, 'utf-8');

    // 7. Write App starter code based on framework
    if (type === 'react') {
      const appJsxContent = `import React from 'react';

export default function App() {
  return (
    <div className="min-h-screen bg-[#080510] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans select-none">
      <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl" />
      <div className="relative border border-purple-500/20 bg-[#0e0a1b]/60 backdrop-blur-md rounded-3xl p-8 max-w-lg w-full text-center shadow-[0_0_50px_rgba(138,43,226,0.15)] overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-purple-400 to-transparent" />
        <div className="mx-auto w-20 h-20 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(138,43,226,0.2)]">
          <span className="text-3xl animate-pulse">⚛</span>
        </div>
        <span className="text-[10px] font-mono tracking-widest text-purple-400 uppercase block mb-1">Neural Workspace Initialized</span>
        <h1 className="text-2xl font-black tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-500 mb-3">HARVOX REACT APP</h1>
        <p className="text-xs text-gray-400 leading-relaxed mb-6">Generated autonomously by HARVOX AI. Coding environments and dependencies are linked and ready.</p>
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-black/40 border border-white/5 text-left">
            <div>
              <span className="text-[9px] text-gray-500 block uppercase font-bold">Status</span>
              <span className="text-xs text-green-400 font-bold">ACTIVE DEV SERVER</span>
            </div>
            <div className="w-2.5 h-2.5 rounded-full bg-green-400 animate-pulse shadow-[0_0_8px_#4ade80]" />
          </div>
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-black/40 border border-white/5 text-left">
            <div>
              <span className="text-[9px] text-gray-500 block uppercase font-bold">Local URL</span>
              <span className="text-xs text-cyan-400 font-mono font-bold">http://localhost:5173</span>
            </div>
            <span className="text-[9px] text-gray-600 font-mono">VITE</span>
          </div>
        </div>
      </div>
    </div>
  );
}`;
      await fs.writeFile(path.join(projectPath, 'src/App.jsx'), appJsxContent, 'utf-8');
    } else if (type === 'vue') {
      const appVueContent = `<template>
  <div class="min-h-screen bg-[#080510] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans select-none">
    <div class="absolute top-1/4 left-1/3 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
    <div class="absolute bottom-1/4 right-1/4 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl"></div>
    <div class="relative border border-purple-500/20 bg-[#0e0a1b]/60 backdrop-blur-md rounded-3xl p-8 max-w-lg w-full text-center shadow-[0_0_50px_rgba(138,43,226,0.15)] overflow-hidden">
      <div class="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-purple-400 to-transparent"></div>
      <div class="mx-auto w-20 h-20 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(138,43,226,0.2)]">
        <span class="text-3xl animate-pulse">🟢</span>
      </div>
      <span class="text-[10px] font-mono tracking-widest text-purple-400 uppercase block mb-1">Neural Workspace Initialized</span>
      <h1 class="text-2xl font-black tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-500 mb-3">HARVOX VUE APP</h1>
      <p class="text-xs text-gray-400 leading-relaxed mb-6">Generated autonomously by HARVOX AI. Coding environments and dependencies are linked and ready.</p>
      <div class="flex flex-col gap-2.5">
        <div class="flex items-center justify-between p-3.5 rounded-xl bg-black/40 border border-white/5 text-left">
          <div>
            <span class="text-[9px] text-gray-500 block uppercase font-bold">Status</span>
            <span class="text-xs text-green-400 font-bold">ACTIVE DEV SERVER</span>
          </div>
          <div class="w-2.5 h-2.5 rounded-full bg-green-400 animate-pulse shadow-[0_0_8px_#4ade80]"></div>
        </div>
        <div class="flex items-center justify-between p-3.5 rounded-xl bg-black/40 border border-white/5 text-left">
          <div>
            <span class="text-[9px] text-gray-500 block uppercase font-bold">Local URL</span>
            <span class="text-xs text-cyan-400 font-mono font-bold">http://localhost:5173</span>
          </div>
          <span class="text-[9px] text-gray-600 font-mono">VITE</span>
        </div>
      </div>
    </div>
  </div>
</template>`;
      await fs.writeFile(path.join(projectPath, 'src/App.vue'), appVueContent, 'utf-8');
    } else if (type === 'svelte') {
      const appSvelteContent = `<main class="min-h-screen bg-[#080510] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans select-none">
  <div class="absolute top-1/4 left-1/3 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
  <div class="absolute bottom-1/4 right-1/4 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl"></div>
  <div class="relative border border-purple-500/20 bg-[#0e0a1b]/60 backdrop-blur-md rounded-3xl p-8 max-w-lg w-full text-center shadow-[0_0_50px_rgba(138,43,226,0.15)] overflow-hidden">
    <div class="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-purple-400 to-transparent"></div>
    <div class="mx-auto w-20 h-20 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(138,43,226,0.2)]">
      <span class="text-3xl animate-pulse">🔥</span>
    </div>
    <span class="text-[10px] font-mono tracking-widest text-purple-400 uppercase block mb-1">Neural Workspace Initialized</span>
    <h1 class="text-2xl font-black tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-500 mb-3">HARVOX SVELTE APP</h1>
    <p class="text-xs text-gray-400 leading-relaxed mb-6">Generated autonomously by HARVOX AI. Coding environments and dependencies are linked and ready.</p>
    <div class="flex flex-col gap-2.5">
      <div class="flex items-center justify-between p-3.5 rounded-xl bg-black/40 border border-white/5 text-left">
        <div>
          <span class="text-[9px] text-gray-500 block uppercase font-bold">Status</span>
          <span class="text-xs text-green-400 font-bold">ACTIVE DEV SERVER</span>
        </div>
        <div class="w-2.5 h-2.5 rounded-full bg-green-400 animate-pulse shadow-[0_0_8px_#4ade80]"></div>
      </div>
      <div class="flex items-center justify-between p-3.5 rounded-xl bg-black/40 border border-white/5 text-left">
        <div>
          <span class="text-[9px] text-gray-500 block uppercase font-bold">Local URL</span>
          <span class="text-xs text-cyan-400 font-mono font-bold">http://localhost:5173</span>
        </div>
        <span class="text-[9px] text-gray-600 font-mono">VITE</span>
      </div>
    </div>
  </div>
</main>`;
      await fs.writeFile(path.join(projectPath, 'src/App.svelte'), appSvelteContent, 'utf-8');
    }

    // 8. Open VS Code
    await logActivity(userId, 'project_vscode', `Opening VS Code for: ${cleanName}`, { projectName: cleanName });
    await new Promise((resolve) => {
      exec(`code "${projectPath}"`, () => resolve());
    });

    // 9. Start Dev Server (non-blocking in new window on Windows)
    await logActivity(userId, 'project_devserver', `Launching Vite dev server for: ${cleanName}`, { projectName: cleanName });
    await new Promise((resolve) => {
      exec(`start cmd /k "npm run dev"`, { cwd: projectPath }, () => resolve());
    });

    successMsg = `${projectType.toUpperCase()} project '${cleanName}' created successfully. Vite + Tailwind CSS configured, VS Code opened, and dev server started at http://localhost:5173`;

  } else if (['nextjs', 'next'].includes(type)) {
    // 1. Scaffold Next.js App
    await new Promise((resolve, reject) => {
      exec(`npx --yes create-next-app@latest "${cleanName}" --js --tailwind --eslint --app --src-dir --use-npm`, { cwd: WORKSPACE_DIR }, (err, stdout, stderr) => {
        if (err) return reject(new Error(`Next.js creation failed: ${stderr || err.message}`));
        resolve();
      });
    });

    // 2. Overwrite src/app/page.js with Cyberpunk layout
    const nextJsPage = `export default function Home() {
  return (
    <main className="min-h-screen bg-[#080510] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans select-none">
      <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl" />
      <div className="relative border border-purple-500/20 bg-[#0e0a1b]/60 backdrop-blur-md rounded-3xl p-8 max-w-lg w-full text-center shadow-[0_0_50px_rgba(138,43,226,0.15)] overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-purple-400 to-transparent" />
        <div className="mx-auto w-20 h-20 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(138,43,226,0.2)]">
          <span className="text-3xl animate-pulse">▲</span>
        </div>
        <span className="text-[10px] font-mono tracking-widest text-purple-400 uppercase block mb-1">Neural Workspace Initialized</span>
        <h1 className="text-2xl font-black tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-500 mb-3">HARVOX NEXT.JS APP</h1>
        <p className="text-xs text-gray-400 leading-relaxed mb-6">Generated autonomously by HARVOX AI. Next.js app directory with Tailwind config is linked and ready.</p>
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-black/40 border border-white/5 text-left">
            <div>
              <span className="text-[9px] text-gray-500 block uppercase font-bold">Status</span>
              <span className="text-xs text-green-400 font-bold">ACTIVE DEV SERVER</span>
            </div>
            <div className="w-2.5 h-2.5 rounded-full bg-green-400 animate-pulse shadow-[0_0_8px_#4ade80]" />
          </div>
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-black/40 border border-white/5 text-left">
            <div>
              <span className="text-[9px] text-gray-500 block uppercase font-bold">Local URL</span>
              <span className="text-xs text-cyan-400 font-mono font-bold">http://localhost:3000</span>
            </div>
            <span className="text-[9px] text-gray-600 font-mono">NEXT.JS</span>
          </div>
        </div>
      </div>
    </main>
  );
}`;
    await fs.mkdir(path.join(projectPath, 'src/app'), { recursive: true }).catch(() => { });
    await fs.writeFile(path.join(projectPath, 'src/app/page.js'), nextJsPage, 'utf-8');

    // 3. Open VS Code
    await logActivity(userId, 'project_vscode', `Opening VS Code for Next.js project: ${cleanName}`, { projectName: cleanName });
    await new Promise((resolve) => {
      exec(`code "${projectPath}"`, () => resolve());
    });

    // 4. Start Dev Server
    await logActivity(userId, 'project_devserver', `Launching Next.js server for: ${cleanName}`, { projectName: cleanName });
    await new Promise((resolve) => {
      exec(`start cmd /k "npm run dev"`, { cwd: projectPath }, () => resolve());
    });

    successMsg = `Next.js project '${cleanName}' created successfully. VS Code opened, and dev server started at http://localhost:3000`;

  } else if (['express', 'node'].includes(type)) {
    // 1. Initialize
    await fs.mkdir(projectPath, { recursive: true });
    await new Promise((resolve, reject) => {
      exec(`npm init -y`, { cwd: projectPath }, (err) => {
        if (err) return reject(err);
        resolve();
      });
    });

    // 2. Configure package.json
    const packageJsonPath = path.join(projectPath, 'package.json');
    const packageData = JSON.parse(await fs.readFile(packageJsonPath, 'utf-8'));
    packageData.type = 'module';
    packageData.scripts = {
      start: 'node server.js',
      dev: 'node server.js'
    };
    await fs.writeFile(packageJsonPath, JSON.stringify(packageData, null, 2), 'utf-8');

    // 3. Install Node/Express packages
    await logActivity(userId, 'project_install', `Installing Express dependencies for: ${cleanName}`, { projectName: cleanName });
    await new Promise((resolve, reject) => {
      exec(`npm install express dotenv cors morgan mongoose jsonwebtoken bcryptjs`, { cwd: projectPath }, (err, stdout, stderr) => {
        if (err) return reject(new Error(`npm install failed: ${stderr || err.message}`));
        resolve();
      });
    });

    // 4. Write server.js
    const serverJsContent = `import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', engine: 'HARVOX AI Express Server', timestamp: new Date() });
});

app.get('/', (req, res) => {
  res.send(\`
    <html>
      <head>
        <title>HARVOX REST API</title>
        <style>
          body { font-family: monospace; background: #080510; color: #00f0ff; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; }
          .card { border: 1px solid rgba(0, 240, 255, 0.2); padding: 40px; border-radius: 20px; text-align: center; background: rgba(14, 10, 27, 0.6); box-shadow: 0 0 30px rgba(0, 240, 255, 0.1); }
          h1 { color: #ff007f; }
        </style>
      </head>
      <body>
        <div class="card">
          <h1>⚡ HARVOX NODE/EXPRESS REST API ⚡</h1>
          <p>Status: ACTIVE</p>
          <p>Access health check at <a href="/api/health" style="color: #8a2be2">/api/health</a></p>
        </div>
      </body>
    </html>
  \`);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(\`[HARVOX API] Server running on port \${PORT}\`);
});`;
    await fs.writeFile(path.join(projectPath, 'server.js'), serverJsContent, 'utf-8');

    // Create environment variables
    await fs.writeFile(path.join(projectPath, '.env'), `PORT=5000\nMONGO_URI=mongodb://localhost:27017/harvox-db\nJWT_SECRET=supersecretkey\n`, 'utf-8');

    // Write folder scaffolding
    await fs.mkdir(path.join(projectPath, 'routes'), { recursive: true });
    await fs.mkdir(path.join(projectPath, 'controllers'), { recursive: true });
    await fs.mkdir(path.join(projectPath, 'models'), { recursive: true });

    // 5. Open VS Code
    await logActivity(userId, 'project_vscode', `Opening VS Code for Node project: ${cleanName}`, { projectName: cleanName });
    await new Promise((resolve) => {
      exec(`code "${projectPath}"`, () => resolve());
    });

    // 6. Start Server in new terminal
    await logActivity(userId, 'project_devserver', `Starting Express server for: ${cleanName}`, { projectName: cleanName });
    await new Promise((resolve) => {
      exec(`start cmd /k "npm run dev"`, { cwd: projectPath }, () => resolve());
    });

    successMsg = `Node/Express REST API project '${cleanName}' created successfully. Scaffolding done, VS Code opened, and server started at http://localhost:5000`;

  } else if (['python', 'fastapi', 'flask'].includes(type)) {
    // 1. Create directory structure
    await fs.mkdir(path.join(projectPath, 'app'), { recursive: true });

    // 2. Setup virtual environment (venv)
    await logActivity(userId, 'project_install', `Creating Python Virtual Environment (venv) for: ${cleanName}`, { projectName: cleanName });
    await new Promise((resolve) => {
      exec(`python -m venv venv`, { cwd: projectPath }, () => resolve());
    });

    let scriptContent = '';
    let requirements = '';
    let startCmd = '';

    if (type === 'flask') {
      scriptContent = `from flask import Flask, jsonify
import os

app = Flask(__name__)

@app.route("/")
def home():
    return """
    <html>
      <body style="background-color: #080510; color: #00f0ff; font-family: monospace; display: flex; justify-content: center; align-items: center; height: 100vh; margin:0;">
        <div style="border: 1px solid rgba(0, 240, 255, 0.2); padding: 40px; border-radius: 20px; text-align: center;">
          <h1 style="color: #ff007f;">🐍 HARVOX FLASK API 🐍</h1>
          <p>Status: ACTIVE</p>
        </div>
      </body>
    </html>
    """

@app.route("/api/health")
def health():
    return jsonify({"status": "OK", "engine": "Flask"})

if __name__ == "__main__":
    app.run(port=5000, debug=True)`;
      requirements = "flask\npython-dotenv\n";
      startCmd = `start cmd /k "venv\\Scripts\\python app.py"`;
      await fs.writeFile(path.join(projectPath, 'app.py'), scriptContent, 'utf-8');
    } else {
      // Default to fastapi
      scriptContent = `from fastapi import FastAPI
from fastapi.responses import HTMLResponse

app = FastAPI()

@app.get("/", response_class=HTMLResponse)
def read_root():
    return """
    <html>
      <body style="background-color: #080510; color: #00f0ff; font-family: monospace; display: flex; justify-content: center; align-items: center; height: 100vh; margin:0;">
        <div style="border: 1px solid rgba(0, 240, 255, 0.2); padding: 40px; border-radius: 20px; text-align: center;">
          <h1 style="color: #8a2be2;">🐍 HARVOX FASTAPI API 🐍</h1>
          <p>Status: ACTIVE</p>
        </div>
      </body>
    </html>
    """

@app.get("/api/health")
def read_health():
    return {"status": "OK", "engine": "FastAPI"}`;
      requirements = "fastapi\nuvicorn\npython-dotenv\n";
      startCmd = `start cmd /k "venv\\Scripts\\uvicorn app.main:app --reload --port 8000"`;
      await fs.writeFile(path.join(projectPath, 'app/main.py'), scriptContent, 'utf-8');
    }

    await fs.writeFile(path.join(projectPath, 'requirements.txt'), requirements, 'utf-8');
    await fs.writeFile(path.join(projectPath, '.env'), "PORT=8000\n", 'utf-8');

    // 3. Install packages in venv
    await logActivity(userId, 'project_install', `Installing python packages from requirements.txt`, { projectName: cleanName });
    await new Promise((resolve) => {
      exec(`venv\\Scripts\\pip install -r requirements.txt`, { cwd: projectPath }, () => resolve());
    });

    // 4. Open VS Code
    await logActivity(userId, 'project_vscode', `Opening VS Code for Python project: ${cleanName}`, { projectName: cleanName });
    await new Promise((resolve) => {
      exec(`code "${projectPath}"`, () => resolve());
    });

    // 5. Start python dev server
    await logActivity(userId, 'project_devserver', `Starting Python server`, { projectName: cleanName });
    await new Promise((resolve) => {
      exec(startCmd, { cwd: projectPath }, () => resolve());
    });

    successMsg = `Python ${type.toUpperCase()} project '${cleanName}' created successfully. Venv configured, dependencies installed, and server launched.`;

  } else if (['static', 'html'].includes(type)) {
    // 1. Create directories
    await fs.mkdir(projectPath, { recursive: true });

    // 2. Create index.html with Cyberpunk theme and Tailwind CDN
    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>HARVOX Static App</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Outfit:wght@300;400;600&display=swap');
    body { font-family: 'Outfit', sans-serif; }
    .font-orbitron { font-family: 'Orbitron', sans-serif; }
  </style>
</head>
<body class="min-h-screen bg-[#080510] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
  <div class="absolute top-1/4 left-1/3 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
  <div class="absolute bottom-1/4 right-1/4 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl"></div>

  <div class="relative border border-purple-500/20 bg-[#0e0a1b]/60 backdrop-blur-md rounded-3xl p-8 max-w-lg w-full text-center shadow-[0_0_50px_rgba(138,43,226,0.15)] overflow-hidden">
    <div class="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-purple-400 to-transparent"></div>
    
    <div class="mx-auto w-20 h-20 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(138,43,226,0.2)]">
      <span class="text-3xl animate-pulse">🌐</span>
    </div>

    <span class="text-[10px] font-orbitron tracking-widest text-purple-400 uppercase block mb-1">Neural Workspace Initialized</span>
    <h1 class="text-2xl font-orbitron font-black tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-500 mb-3">HARVOX STATIC HTML</h1>
    <p class="text-xs text-gray-400 leading-relaxed mb-6">Generated autonomously by HARVOX AI. This static page is ready to view, and requires no bundlers.</p>
    
    <div class="text-left p-4 rounded-xl bg-black/40 border border-white/5 font-mono text-xs">
      <p class="text-green-400">// Connected to HARVOX workspace</p>
      <p class="text-neutral-500">Edit index.html, style.css, and app.js to build.</p>
    </div>
  </div>
</body>
</html>`;
    await fs.writeFile(path.join(projectPath, 'index.html'), htmlContent, 'utf-8');
    await fs.writeFile(path.join(projectPath, 'style.css'), `/* Cyberpunk theme styles */`, 'utf-8');
    await fs.writeFile(path.join(projectPath, 'app.js'), `console.log('HARVOX static app loaded');`, 'utf-8');

    // 3. Open VS Code
    await logActivity(userId, 'project_vscode', `Opening VS Code for Static project: ${cleanName}`, { projectName: cleanName });
    await new Promise((resolve) => {
      exec(`code "${projectPath}"`, () => resolve());
    });

    // 4. Open in default browser
    await logActivity(userId, 'open_url', `Opening local static page in browser`, { path: cleanName });
    await new Promise((resolve) => {
      exec(`start "" "${path.join(projectPath, 'index.html')}"`, () => resolve());
    });

    successMsg = `Static HTML/CSS/JS project '${cleanName}' created successfully. VS Code opened, and local file launched in default browser.`;

  } else if (['angular'].includes(type)) {
    // 1. Scaffold Angular
    await new Promise((resolve, reject) => {
      exec(`npx --yes -p @angular/cli ng new "${cleanName}" --defaults --style=css --routing`, { cwd: WORKSPACE_DIR }, (err, stdout, stderr) => {
        if (err) return reject(new Error(`Angular creation failed: ${stderr || err.message}`));
        resolve();
      });
    });

    // 2. Open VS Code
    await logActivity(userId, 'project_vscode', `Opening VS Code for Angular project: ${cleanName}`, { projectName: cleanName });
    await new Promise((resolve) => {
      exec(`code "${projectPath}"`, () => resolve());
    });

    // 3. Start dev server
    await logActivity(userId, 'project_devserver', `Starting Angular server`, { projectName: cleanName });
    await new Promise((resolve) => {
      exec(`start cmd /k "npm start"`, { cwd: projectPath }, () => resolve());
    });

    successMsg = `Angular project '${cleanName}' scaffolded successfully. VS Code opened, and server started.`;

  } else if (['electron'].includes(type)) {
    // 1. Create project
    await fs.mkdir(projectPath, { recursive: true });
    await new Promise((resolve, reject) => {
      exec(`npm init -y`, { cwd: projectPath }, (err) => {
        if (err) return reject(err);
        resolve();
      });
    });

    // 2. Configure package.json
    const packageJsonPath = path.join(projectPath, 'package.json');
    const packageData = JSON.parse(await fs.readFile(packageJsonPath, 'utf-8'));
    packageData.main = 'main.js';
    packageData.scripts = {
      start: 'electron .'
    };
    await fs.writeFile(packageJsonPath, JSON.stringify(packageData, null, 2), 'utf-8');

    // 3. Install Electron
    await logActivity(userId, 'project_install', `Installing Electron for: ${cleanName}`, { projectName: cleanName });
    await new Promise((resolve, reject) => {
      exec(`npm install electron --save-dev`, { cwd: projectPath }, (err, stdout, stderr) => {
        if (err) return reject(new Error(`Electron install failed: ${stderr || err.message}`));
        resolve();
      });
    });

    // 4. Write main.js
    const mainJsContent = `const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow () {
  const win = new BrowserWindow({
    width: 900,
    height: 700,
    webPreferences: {
      nodeIntegration: true
    }
  });

  win.loadFile('index.html');
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});`;
    await fs.writeFile(path.join(projectPath, 'main.js'), mainJsContent, 'utf-8');

    // 5. Write index.html
    const electronHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>HARVOX Electron App</title>
  <style>
    body { background-color: #080510; color: #ff007f; font-family: monospace; display: flex; flex-direction: column; justify-content: center; align-items: center; height: 100vh; margin: 0; }
    h1 { color: #00f0ff; text-shadow: 0 0 10px #00f0ff; }
  </style>
</head>
<body>
  <h1>⚛ HARVOX ELECTRON CONTAINER ⚛</h1>
  <p>Status: ACTIVE</p>
  <p>Engine: Chromium & Node.js</p>
</body>
</html>`;
    await fs.writeFile(path.join(projectPath, 'index.html'), electronHtml, 'utf-8');

    // 6. Open VS Code
    await logActivity(userId, 'project_vscode', `Opening VS Code for Electron project: ${cleanName}`, { projectName: cleanName });
    await new Promise((resolve) => {
      exec(`code "${projectPath}"`, () => resolve());
    });

    // 7. Run Electron app
    await logActivity(userId, 'project_devserver', `Starting Electron application`, { projectName: cleanName });
    await new Promise((resolve) => {
      exec(`start cmd /k "npm start"`, { cwd: projectPath }, () => resolve());
    });

    successMsg = `Electron desktop application '${cleanName}' created successfully. VS Code opened, and application launched.`;

  } else {
    // Fallback: Create directory, init npm, open VS Code
    await fs.mkdir(projectPath, { recursive: true });
    await new Promise((resolve) => {
      exec(`npm init -y`, { cwd: projectPath }, () => resolve());
    });

    await logActivity(userId, 'project_vscode', `Opening VS Code for ${projectType} project: ${cleanName}`, { projectName: cleanName });
    await new Promise((resolve) => {
      exec(`code "${projectPath}"`, () => resolve());
    });

    successMsg = `${projectType.toUpperCase()} project folder '${cleanName}' created, npm initialized, and folder opened in VS Code.`;
  }

  return {
    success: true,
    message: successMsg
  };
}

/**
 * Component Generator Action
 */
async function createComponent(userId, componentName, codeContent) {
  if (!componentName) throw new Error('Component name is required.');

  // Clean component name
  const cleanName = componentName.replace(/[^a-zA-Z0-9]/g, '');
  const relativePath = `src/components/${cleanName}.jsx`;
  const targetPath = path.resolve(WORKSPACE_DIR, relativePath);

  if (!targetPath.startsWith(WORKSPACE_DIR)) {
    throw new Error('Access Denied: Path is outside workspace.');
  }

  await fs.mkdir(path.dirname(targetPath), { recursive: true }).catch(() => { });
  await fs.writeFile(targetPath, codeContent, 'utf-8');

  await logActivity(userId, 'create_component', `Generated component: ${cleanName}.jsx`, { component: cleanName });
  return { success: true, message: `Created React component at ${relativePath}` };
}

/**
 * Smart Search Action
 */
async function smartSearch(userId, query) {
  const url = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
  const command = `start "" "${url}"`;
  return new Promise((resolve, reject) => {
    exec(command, async (err) => {
      if (err) return reject(new Error(`Failed to search: ${err.message}`));
      await logActivity(userId, 'smart_search', `Searched browser for: "${query}"`, { query });
      resolve({ success: true, message: `Opened search query for "${query}" in default browser.` });
    });
  });
}

/**
 * Smart Directory Sorting Action
 */
async function organizeDirectory(userId, dirName = '') {
  const cleanName = dirName.replace(/^(\.\.(\/ |\\|$))+/, '');
  const targetPath = path.resolve(WORKSPACE_DIR, cleanName);

  if (!targetPath.startsWith(WORKSPACE_DIR)) {
    throw new Error('Access Denied: Path is outside the allowed workspace directory.');
  }

  const files = await fs.readdir(targetPath, { withFileTypes: true });

  const folders = {
    PDFs: ['pdf'],
    Images: ['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp'],
    Code: ['js', 'jsx', 'ts', 'tsx', 'html', 'css', 'py', 'json', 'sh', 'java', 'cpp', 'c', 'cs'],
    Notes: ['txt', 'md']
  };

  let movedCount = 0;

  for (const file of files) {
    if (file.isFile()) {
      const ext = path.extname(file.name).toLowerCase().replace('.', '');
      let category = null;

      for (const [cat, exts] of Object.entries(folders)) {
        if (exts.includes(ext)) {
          category = cat;
          break;
        }
      }

      if (category) {
        const destDir = path.join(targetPath, category);
        await fs.mkdir(destDir, { recursive: true });
        await fs.rename(path.join(targetPath, file.name), path.join(destDir, file.name));
        movedCount++;
      }
    }
  }

  await logActivity(userId, 'file_organize', `Organized ${movedCount} files in directory: ${cleanName || 'Workspace Root'}`, { movedCount });
  return { success: true, message: `Organized ${movedCount} files into PDFs, Images, Code, and Notes folders.` };
}

/**
 * Backup Project Action
 */
async function backupProject(userId, projectName) {
  const cleanName = projectName.replace(/[^a-zA-Z0-9-_]/g, '');
  const sourcePath = path.resolve(WORKSPACE_DIR, cleanName);
  const backupName = `${cleanName}-backup-${Date.now()}`;
  const backupPath = path.resolve(WORKSPACE_DIR, 'backups', backupName);

  if (!sourcePath.startsWith(WORKSPACE_DIR)) {
    throw new Error('Access Denied: Path is outside the allowed workspace.');
  }

  await fs.mkdir(path.dirname(backupPath), { recursive: true });

  // Windows copy directory recursive
  const command = `xcopy "${sourcePath}" "${backupPath}" /E /I /Y`;

  return new Promise((resolve, reject) => {
    exec(command, async (err) => {
      if (err) return reject(new Error(`Failed to copy project backup: ${err.message}`));
      await logActivity(userId, 'project_backup', `Backed up project: ${cleanName}`, { projectName: cleanName, backupName });
      resolve({ success: true, message: `Project backup created successfully at backups/${backupName}` });
    });
  });
}

/**
 * Draft Email Action
 */
async function draftEmail(userId, to, subject, body) {
  const url = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  const command = `start "" "${url}"`;
  return new Promise((resolve, reject) => {
    exec(command, async (err) => {
      if (err) return reject(new Error(`Failed to draft email: ${err.message}`));
      await logActivity(userId, 'draft_email', `Drafted email to ${to}`, { to, subject });
      resolve({ success: true, message: `Opened default email application with draft to ${to}` });
    });
  });
}

/**
 * Document Export Action
 */
async function exportDocument(userId, fileName, content, format = 'markdown') {
  let cleanName = fileName.replace(/^(\.\.(\/ |\\|$))+/, '');
  let ext = '.md';

  if (format.toLowerCase() === 'html' || format.toLowerCase() === 'powerpoint' || format.toLowerCase() === 'pdf') {
    ext = '.html';
  } else if (format.toLowerCase() === 'docx') {
    ext = '.doc';
  }

  if (!cleanName.endsWith(ext)) {
    cleanName += ext;
  }

  const targetPath = path.resolve(WORKSPACE_DIR, cleanName);
  if (!targetPath.startsWith(WORKSPACE_DIR)) {
    throw new Error('Access Denied: Path is outside the allowed workspace directory.');
  }

  let finalContent = content;
  if (ext === '.html') {
    finalContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${cleanName}</title>
  <style>
    body {
      font-family: 'Segoe UI', system-ui, sans-serif;
      background: #0d0a1b;
      color: #e5e7eb;
      padding: 40px;
      line-height: 1.6;
    }
    h1, h2, h3 {
      font-family: 'Orbitron', sans-serif;
      color: #be5cf6;
      border-bottom: 1px solid rgba(190, 92, 246, 0.2);
      padding-bottom: 10px;
    }
    pre {
      background: #05030a;
      border: 1px solid rgba(138,43,226,0.3);
      padding: 15px;
      border-radius: 12px;
      overflow-x: auto;
      color: #00f0ff;
    }
    code {
      font-family: monospace;
    }
  </style>
</head>
<body>
  ${content}
</body>
</html>`;
  }

  await fs.mkdir(path.dirname(targetPath), { recursive: true }).catch(() => { });
  await fs.writeFile(targetPath, finalContent, 'utf-8');

  await logActivity(userId, 'document_export', `Exported document: ${cleanName}`, { file: cleanName, format });
  return { success: true, message: `Document exported successfully as ${cleanName} in format ${format.toUpperCase()}` };
}

/**
 * Log BSCS Study Hours Action
 */
async function logLearningAction(userId, subject, hours, notes) {
  let track = await LearningTrack.findOne({ userId, subject });
  if (track) {
    track.hours += Number(hours);
    if (notes) track.notes = notes;
    track.lastStudied = new Date();
    await track.save();
  } else {
    await LearningTrack.create({
      userId,
      subject,
      hours: Number(hours),
      notes,
      lastStudied: new Date()
    });
  }

  await logActivity(userId, 'log_learning', `Studied ${subject} for ${hours} hours`, { subject, hours });
  return { success: true, message: `Logged ${hours} hours study time to ${subject} tracker.` };
}

/**
 * Task Automation Action
 */
async function manageTasksAction(userId, actionType, title, deadlineStr, priority) {
  if (actionType === 'create') {
    const deadline = deadlineStr ? new Date(deadlineStr) : undefined;
    const task = await Task.create({
      userId,
      title,
      deadline,
      priority: priority || 'medium'
    });
    await logActivity(userId, 'task_create', `Created task: "${title}"`, { taskId: task._id });
    return { success: true, message: `Task "${title}" created successfully.` };
  } else if (actionType === 'complete') {
    const task = await Task.findOneAndUpdate(
      { userId, title: { $regex: new RegExp(title, 'i') } },
      { status: 'completed' },
      { new: true }
    );
    if (!task) {
      throw new Error(`Task with title matching "${title}" not found.`);
    }
    await logActivity(userId, 'task_complete', `Completed task: "${task.title}"`, { taskId: task._id });
    return { success: true, message: `Task "${task.title}" marked as completed.` };
  }
  throw new Error(`Unknown task action: ${actionType}`);
}

/**
 * Run a temporary PowerShell script for GUI/keyboard automation
 */
async function runPowerShellScript(scriptContent) {
  const tempFile = path.join(WORKSPACE_DIR, `temp_run_${Date.now()}.ps1`);
  await fs.writeFile(tempFile, scriptContent, 'utf-8');

  return new Promise((resolve) => {
    exec(`powershell -ExecutionPolicy Bypass -File "${tempFile}"`, async () => {
      await fs.unlink(tempFile).catch(() => { });
      resolve();
    });
  });
}

/**
 * YouTube play helper
 */
async function youtubePlay(userId, songName) {
  if (!songName) throw new Error('Song name is required.');

  const query = encodeURIComponent(songName);
  const searchUrl = `https://www.youtube.com/results?search_query=${query}`;

  // 1. Open the search results page
  await new Promise((resolve, reject) => {
    exec(`start "" "${searchUrl}"`, (err) => {
      if (err) return reject(new Error(`Failed to launch browser: ${err.message}`));
      resolve();
    });
  });

  // 2. PowerShell keyboard automation to navigate to the first result and hit Enter
  const scriptContent = `
$wshell = New-Object -ComObject wscript.shell;
Start-Sleep -Seconds 5;

# Try to activate default browser windows
$browsers = @("Chrome", "Edge", "Firefox", "Brave", "Opera", "YouTube")
$found = $false
foreach ($b in $browsers) {
    if ($wshell.AppActivate($b)) {
        $found = $true
        break
    }
}

Start-Sleep -Milliseconds 500;

# Tab navigation (typically 7 tabs to get to the first video result from the search box)
for ($i = 0; $i -lt 7; $i++) {
    $wshell.SendKeys("{TAB}");
    Start-Sleep -Milliseconds 150;
}

# Press Enter to open/play the video
$wshell.SendKeys("{ENTER}");
`;

  await runPowerShellScript(scriptContent);
  await logActivity(userId, 'youtube_play', `Played song on YouTube: "${songName}"`, { songName });
  return { success: true, message: `Opened YouTube and auto-navigated to play "${songName}".` };
}

/**
 * WhatsApp send helper
 */
async function whatsappSend(userId, phoneOrContact, message) {
  if (!message) throw new Error('Message content is required.');

  let url = '';
  const cleanPhone = phoneOrContact.replace(/\D/g, '');

  if (cleanPhone && cleanPhone.length >= 7) {
    url = `whatsapp://send?phone=${cleanPhone}&text=${encodeURIComponent(message)}`;
  } else {
    url = `whatsapp://send?text=${encodeURIComponent(message)}`;
  }

  // 1. Launch WhatsApp
  await new Promise((resolve) => {
    exec(`start "" "${url}"`, async (err) => {
      if (err) {
        const webUrl = cleanPhone
          ? `https://web.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(message)}`
          : `https://web.whatsapp.com/send?text=${encodeURIComponent(message)}`;
        exec(`start "" "${webUrl}"`, () => resolve());
      } else {
        resolve();
      }
    });
  });

  // 2. PowerShell keyboard automation to send the pre-filled message
  const scriptContent = `
$wshell = New-Object -ComObject wscript.shell;
Start-Sleep -Seconds 6;

# Focus WhatsApp Desktop or WhatsApp Web browser tab
$wshell.AppActivate("WhatsApp");
Start-Sleep -Milliseconds 500;

# Send Enter to transmit message
$wshell.SendKeys("{ENTER}");
`;

  await runPowerShellScript(scriptContent);
  await logActivity(userId, 'whatsapp_send', `Auto-sent WhatsApp message to: "${phoneOrContact}"`, { phoneOrContact, message });
  return { success: true, message: `Opened WhatsApp and auto-sent message to "${phoneOrContact || 'selected contact'}".` };
}

/**
 * Char-by-char keyboard text typing automation
 * @param {string} userId
 * @param {string} text   - Text to type
 * @param {string|number} [delayMs=30] - Milliseconds delay between each character (from Ghost Typer speed slider)
 */
async function typeText(userId, text, delayMs = 30) {
  if (!text) throw new Error('No text provided to type.');

  const delay = Math.max(5, Math.min(500, parseInt(delayMs, 10) || 30));

  const scriptContent = `
$wshell = New-Object -ComObject wscript.shell;
Start-Sleep -Seconds 2;
$text = @"
${text.replace(/"/g, '`"').replace(/\$/g, '`$')}
"@
foreach ($c in $text.ToCharArray()) {
    $str = $c.ToString()
    if ("+^%~{}()[]".Contains($str)) {
        $str = "{$str}"
    }
    $wshell.SendKeys($str)
    Start-Sleep -Milliseconds ${delay}
}
`;

  await runPowerShellScript(scriptContent);
  await logActivity(userId, 'type_text', `Auto-typed text: "${text.slice(0, 30)}..."`);
  return { success: true, message: `Completed typing sequence: "${text.slice(0, 30)}..."` };
}

/**
 * Screen element search & click automation using UI Automation & mouse simulation
 */
async function clickElement(userId, target) {
  if (!target) throw new Error('No target provided to click.');

  const scriptContent = `
Add-Type -AssemblyName UIAutomationClient
Add-Type -AssemblyName UIAutomationTypes
Add-Type -AssemblyName System.Windows.Forms

$Signature = @'
[DllImport("user32.dll")]
public static extern bool SetCursorPos(int X, int Y);
[DllImport("user32.dll")]
public static extern void mouse_event(int dwFlags, int dx, int dy, int cButtons, int dwExtraInfo);
'@
$Mouse = Add-Type -MemberDefinition $Signature -Name "MouseClicker" -Namespace "Win32" -PassThru

$targetStr = "${target.replace(/"/g, '`"')}"
$clickPoint = $null

if ($targetStr -match '^(\\d+)\\s*,\\s*(\\d+)$') {
    $clickPoint = New-Object System.Drawing.Point([int]$Matches[1], [int]$Matches[2])
} else {
    $root = [System.Windows.Automation.AutomationElement]::RootElement
    $condition = New-Object System.Windows.Automation.PropertyCondition([System.Windows.Automation.AutomationElement]::NameProperty, $targetStr)
    $element = $root.FindFirst([System.Windows.Automation.TreeScope]::Subtree, $condition)
    if ($element -ne $null) {
        try {
            $clickPoint = $element.GetClickablePoint()
        } catch {
            $rect = $element.Current.BoundingRectangle
            $clickPoint = New-Object System.Drawing.Point(($rect.Left + $rect.Right)/2, ($rect.Top + $rect.Bottom)/2)
        }
    }
}

if ($clickPoint -ne $null) {
    [Win32.MouseClicker]::SetCursorPos($clickPoint.X, $clickPoint.Y)
    Start-Sleep -Milliseconds 200
    [Win32.MouseClicker]::mouse_event(0x0002, 0, 0, 0, 0)
    [Win32.MouseClicker]::mouse_event(0x0004, 0, 0, 0, 0)
    Write-Output "Successfully clicked target at $($clickPoint.X), $($clickPoint.Y)"
} else {
    Write-Output "Target not found."
}
`;

  await runPowerShellScript(scriptContent);
  await logActivity(userId, 'click_element', `Clicked screen element: "${target}"`);
  return { success: true, message: `Completed click sequence for: "${target}"` };
}

/**
 * Music play automation (Spotify / YouTube)
 */
async function playMusic(userId, target) {
  if (!target) throw new Error('Specify a song or artist to play.');
  
  const lower = target.toLowerCase();
  if (lower.includes('spotify') || lower.includes('on spotify')) {
    const song = target.replace(/play/i, '').replace(/on spotify/i, '').trim();
    const command = `start spotify:search:"${song}"`;
    return new Promise((resolve, reject) => {
      exec(command, async (err) => {
        if (err) return reject(new Error(`Failed to launch Spotify: ${err.message}`));
        const scriptContent = `
$wshell = New-Object -ComObject wscript.shell;
Start-Sleep -Seconds 4;
$wshell.AppActivate("Spotify");
Start-Sleep -Milliseconds 500;
$wshell.SendKeys("{ENTER}");
`;
        await runPowerShellScript(scriptContent);
        await logActivity(userId, 'music_play', `Played song on Spotify: "${song}"`, { song, service: 'spotify' });
        resolve({ success: true, message: `Opened Spotify and searched for "${song}".` });
      });
    });
  } else {
    const song = target.replace(/play/i, '').replace(/on youtube/i, '').trim();
    return await youtubePlay(userId, song);
  }
}

/**
 * Native Windows media control key event simulation (volume up, volume down, mute)
 */
async function mediaControl(userId, command) {
  const cmd = command.toLowerCase().trim();
  let keyChar = '';
  let label = '';
  
  if (cmd === 'volup' || cmd === 'volumeup') {
    keyChar = '175';
    label = 'Volume Up';
  } else if (cmd === 'voldown' || cmd === 'volumedown') {
    keyChar = '174';
    label = 'Volume Down';
  } else if (cmd === 'mute') {
    keyChar = '173';
    label = 'Mute';
  } else {
    throw new Error(`Unsupported media command: '${command}'`);
  }

  const scriptContent = `
$wshell = New-Object -ComObject wscript.shell;
$wshell.SendKeys([char]${keyChar});
`;

  await runPowerShellScript(scriptContent);
  await logActivity(userId, 'media_control', `Executed media command: ${label}`);
  return { success: true, message: `System media event sent: ${label}` };
}
