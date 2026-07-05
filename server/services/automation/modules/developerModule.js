/**
 * HARVOX Automation Engine — Developer Module
 * Skills: Git, npm, project scaffolding, code generation, localhost
 * Destructive operations (git push, rm) are sensitive: true
 */

import { exec } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { logActivity } from '../../memoryService.js';
import { registerModule } from '../automationRegistry.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const WORKSPACE_DIR = path.resolve(__dirname, '../../../uploads/workspace');

function runCmd(cmd, cwd = WORKSPACE_DIR) {
  return new Promise((resolve, reject) => {
    exec(cmd, { cwd }, (err, stdout, stderr) => {
      if (err) reject(new Error(stderr || err.message));
      else resolve(stdout.trim());
    });
  });
}

function openUrl(url) {
  return new Promise((resolve) => exec(`start "" "${url}"`, () => resolve()));
}

// ─── Git Skills ───────────────────────────────────────────────────────────────

async function gitStatus(userId, args) {
  const projectName = args[0] || '';
  const cwd = projectName ? path.resolve(WORKSPACE_DIR, projectName) : WORKSPACE_DIR;
  const output = await runCmd('git status', cwd);
  await logActivity(userId, 'git_status', `Git status for ${projectName || 'workspace'}`, { projectName });
  return { success: true, message: 'Git status retrieved.', output };
}

async function gitAdd(userId, args) {
  const projectName = args[0] || '';
  const cwd = projectName ? path.resolve(WORKSPACE_DIR, projectName) : WORKSPACE_DIR;
  const output = await runCmd('git add .', cwd);
  await logActivity(userId, 'git_add', `Git add all in ${projectName || 'workspace'}`);
  return { success: true, message: 'All changes staged (git add .).', output };
}

async function gitCommit(userId, args) {
  const message = args[0] || 'feat: HARVOX AI automated commit';
  const projectName = args[1] || '';
  const cwd = projectName ? path.resolve(WORKSPACE_DIR, projectName) : WORKSPACE_DIR;
  const output = await runCmd(`git commit -m "${message.replace(/"/g, '\\"')}"`, cwd);
  await logActivity(userId, 'git_commit', `Git commit: "${message}"`, { message, projectName });
  return { success: true, message: `Committed with message: "${message}".`, output };
}

/**
 * Git push — SENSITIVE ACTION — requires explicit confirmation
 */
async function gitPush(userId, args) {
  const projectName = args[0] || '';
  const branch = args[1] || 'main';
  const cwd = projectName ? path.resolve(WORKSPACE_DIR, projectName) : WORKSPACE_DIR;
  const output = await runCmd(`git push origin ${branch}`, cwd);
  await logActivity(userId, 'git_push', `Git push origin ${branch}`, { branch, projectName });
  return { success: true, message: `Pushed to origin/${branch} successfully.`, output };
}

async function gitInit(userId, args) {
  const projectName = args[0] || '';
  const cwd = projectName ? path.resolve(WORKSPACE_DIR, projectName) : WORKSPACE_DIR;
  const output = await runCmd('git init', cwd);
  await logActivity(userId, 'git_init', `Git init in ${projectName || 'workspace'}`);
  return { success: true, message: 'Git repository initialized.', output };
}

async function openGitHubRepo(userId, args) {
  const repo = args[0] || '';
  const url = repo ? `https://github.com/${repo}` : 'https://github.com';
  await openUrl(url);
  await logActivity(userId, 'dev_github_repo', `Opened GitHub repo: ${repo}`);
  return { success: true, message: `Opened GitHub: ${repo || 'homepage'}.` };
}

// ─── NPM Skills ───────────────────────────────────────────────────────────────

async function npmInstall(userId, args) {
  const projectName = args[0] || '';
  const cwd = projectName ? path.resolve(WORKSPACE_DIR, projectName) : WORKSPACE_DIR;
  const output = await runCmd('npm install', cwd);
  await logActivity(userId, 'npm_install', `npm install in ${projectName || 'workspace'}`);
  return { success: true, message: 'npm install completed.', output: output.slice(0, 500) };
}

async function npmInstallPackage(userId, args) {
  const packageName = args[0] || '';
  const projectName = args[1] || '';
  const devFlag = args[2] === 'dev' ? '--save-dev' : '';
  if (!packageName) throw new Error('Package name is required.');
  const cwd = projectName ? path.resolve(WORKSPACE_DIR, projectName) : WORKSPACE_DIR;
  const output = await runCmd(`npm install ${packageName} ${devFlag}`.trim(), cwd);
  await logActivity(userId, 'npm_install_pkg', `Installed package: ${packageName}`, { packageName });
  return { success: true, message: `Package "${packageName}" installed successfully.`, output: output.slice(0, 500) };
}

async function npmRunDev(userId, args) {
  const projectName = args[0] || '';
  const cwd = projectName ? path.resolve(WORKSPACE_DIR, projectName) : WORKSPACE_DIR;
  // Launch in a new terminal window (non-blocking)
  exec(`start cmd /k "npm run dev"`, { cwd });
  await logActivity(userId, 'npm_run_dev', `npm run dev for ${projectName || 'workspace'}`);
  return { success: true, message: `Dev server started for "${projectName || 'project'}". Check the new terminal window.` };
}

async function npmBuild(userId, args) {
  const projectName = args[0] || '';
  const cwd = projectName ? path.resolve(WORKSPACE_DIR, projectName) : WORKSPACE_DIR;
  const output = await runCmd('npm run build', cwd);
  await logActivity(userId, 'npm_build', `npm run build for ${projectName || 'workspace'}`);
  return { success: true, message: 'Production build completed.', output: output.slice(0, 500) };
}

// ─── VS Code & Editor Skills ──────────────────────────────────────────────────

async function openVSCode(userId, args) {
  const projectName = args[0] || '';
  const targetPath = projectName ? path.resolve(WORKSPACE_DIR, projectName) : WORKSPACE_DIR;
  exec(`code "${targetPath}"`);
  await logActivity(userId, 'dev_vscode', `Opened VS Code: ${projectName || 'workspace'}`);
  return { success: true, message: `VS Code opened for "${projectName || 'workspace'}".` };
}

async function openCursor(userId, args) {
  const projectName = args[0] || '';
  const targetPath = projectName ? path.resolve(WORKSPACE_DIR, projectName) : WORKSPACE_DIR;
  exec(`cursor "${targetPath}"`);
  await logActivity(userId, 'dev_cursor', `Opened Cursor: ${projectName || 'workspace'}`);
  return { success: true, message: `Cursor editor opened for "${projectName || 'workspace'}".` };
}

async function openTerminal(userId) {
  exec('start wt');
  await logActivity(userId, 'dev_terminal', 'Opened Windows Terminal');
  return { success: true, message: 'Windows Terminal opened.' };
}

async function openLocalhost(userId, args) {
  const port = args[0] || '3000';
  await openUrl(`http://localhost:${port}`);
  await logActivity(userId, 'dev_localhost', `Opened localhost:${port}`);
  return { success: true, message: `localhost:${port} opened in browser.` };
}

// ─── Code Generation Skills ───────────────────────────────────────────────────

async function generateReadme(userId, args) {
  const projectName = args[0] || 'my-project';
  const description = args[1] || 'A project generated by HARVOX AI';

  const readme = `# ${projectName}

> ${description}

## Tech Stack

- **Frontend:** React + Vite + Tailwind CSS
- **Backend:** Node.js + Express
- **Database:** MongoDB
- **AI:** HARVOX AI Automation Engine

## Getting Started

\`\`\`bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
\`\`\`

## Features

- AI-powered automation
- Voice command support
- Real-time task execution

## License

MIT License — Built with HARVOX AI
`;

  const filePath = path.resolve(WORKSPACE_DIR, projectName, 'README.md');
  await fs.mkdir(path.dirname(filePath), { recursive: true }).catch(() => {});
  await fs.writeFile(filePath, readme, 'utf-8');

  await logActivity(userId, 'dev_readme', `Generated README for ${projectName}`);
  return { success: true, message: `README.md generated for "${projectName}".` };
}

async function generateApiRoute(userId, args) {
  const routeName = args[0] || 'example';
  const cleanName = routeName.replace(/[^a-zA-Z0-9]/g, '');

  const routeContent = `import express from 'express';
const router = express.Router();

// GET /api/${cleanName.toLowerCase()}
router.get('/', async (req, res) => {
  try {
    res.json({ success: true, data: [], message: '${cleanName} data retrieved.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/${cleanName.toLowerCase()}
router.post('/', async (req, res) => {
  try {
    const data = req.body;
    res.status(201).json({ success: true, data, message: '${cleanName} created.' });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

export default router;
`;

  const filePath = path.resolve(WORKSPACE_DIR, 'routes', `${cleanName.toLowerCase()}Routes.js`);
  await fs.mkdir(path.dirname(filePath), { recursive: true }).catch(() => {});
  await fs.writeFile(filePath, routeContent, 'utf-8');

  await logActivity(userId, 'dev_api_route', `Generated API route: ${cleanName}`);
  return { success: true, message: `Express API route for "${cleanName}" generated at routes/${cleanName.toLowerCase()}Routes.js.` };
}

// ─── Module Registration ──────────────────────────────────────────────────────

registerModule(
  'developer',
  {
    name: 'Developer Automation',
    icon: 'Code2',
    description: 'Git workflows, npm commands, code generation, and development tools.',
    color: '#00f0ff',
  },
  [
    // Git
    { action: 'git_status',          label: 'Git Status',               handler: (u, a) => gitStatus(u, a),          estimatedMs: 2000 },
    { action: 'git_add',             label: 'Git Add All',              handler: (u, a) => gitAdd(u, a),             estimatedMs: 2000 },
    { action: 'git_commit',          label: 'Git Commit',               handler: (u, a) => gitCommit(u, a),          estimatedMs: 3000 },
    { action: 'git_push',            label: 'Git Push',                 handler: (u, a) => gitPush(u, a),            estimatedMs: 8000, sensitive: true },
    { action: 'git_init',            label: 'Git Init',                 handler: (u, a) => gitInit(u, a),            estimatedMs: 2000 },
    { action: 'open_github_repo',    label: 'Open GitHub Repository',   handler: (u, a) => openGitHubRepo(u, a),     estimatedMs: 2000 },
    // NPM
    { action: 'npm_install',         label: 'NPM Install',              handler: (u, a) => npmInstall(u, a),         estimatedMs: 30000 },
    { action: 'npm_install_package', label: 'Install NPM Package',      handler: (u, a) => npmInstallPackage(u, a),  estimatedMs: 15000 },
    { action: 'npm_run_dev',         label: 'NPM Run Dev',              handler: (u, a) => npmRunDev(u, a),          estimatedMs: 3000 },
    { action: 'npm_build',           label: 'NPM Build',                handler: (u, a) => npmBuild(u, a),           estimatedMs: 30000 },
    // Editors
    { action: 'dev_open_vscode',     label: 'Open VS Code',             handler: (u, a) => openVSCode(u, a),         estimatedMs: 2000 },
    { action: 'dev_open_cursor',     label: 'Open Cursor',              handler: (u, a) => openCursor(u, a),         estimatedMs: 2000 },
    { action: 'dev_open_terminal',   label: 'Open Terminal',            handler: (u) => openTerminal(u),             estimatedMs: 2000 },
    { action: 'dev_open_localhost',  label: 'Open Localhost',           handler: (u, a) => openLocalhost(u, a),      estimatedMs: 2000 },
    // Code generation
    { action: 'dev_generate_readme', label: 'Generate README.md',       handler: (u, a) => generateReadme(u, a),     estimatedMs: 2000 },
    { action: 'dev_generate_api',    label: 'Generate API Route',       handler: (u, a) => generateApiRoute(u, a),   estimatedMs: 2000 },
  ]
);
