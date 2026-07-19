import http from 'node:http';
import { execFile } from 'node:child_process';

const PORT = Number(process.env.HARVOX_AGENT_PORT || 8765);
const API_URL = process.env.HARVOX_API_URL || 'https://harvox-ai-2.vercel.app/api';
const ORIGINS = new Set(['https://harvox-ai-2.vercel.app', 'http://localhost:5173']);

const run = (file, args = []) => new Promise((resolve, reject) => {
  execFile(file, args, { windowsHide: true, timeout: 15_000 }, (error, stdout, stderr) => {
    if (error) reject(new Error(stderr?.trim() || error.message));
    else resolve(stdout.trim());
  });
});

async function verifyToken(token) {
  const response = await fetch(`${API_URL}/auth/me`, { headers: { Authorization: `Bearer ${token}` } });
  return response.ok;
}

async function execute(step) {
  const action = step?.action;
  const args = Array.isArray(step?.args) ? step.args.map(String) : [];
  switch (action) {
    case 'volume_up': return run('powershell.exe', ['-NoProfile', '-Command', '$w=New-Object -ComObject WScript.Shell; 1..5|%{$w.SendKeys([char]175)}']);
    case 'volume_down': return run('powershell.exe', ['-NoProfile', '-Command', '$w=New-Object -ComObject WScript.Shell; 1..5|%{$w.SendKeys([char]174)}']);
    case 'mute': return run('powershell.exe', ['-NoProfile', '-Command', '$w=New-Object -ComObject WScript.Shell; $w.SendKeys([char]173)']);
    case 'media_play_pause': return run('powershell.exe', ['-NoProfile', '-Command', '$w=New-Object -ComObject WScript.Shell; $w.SendKeys([char]179)']);
    case 'lock': return run('rundll32.exe', ['user32.dll,LockWorkStation']);
    case 'open_settings': return run('cmd.exe', ['/c', 'start', '', 'ms-settings:']);
    case 'spotify_open': return run('cmd.exe', ['/c', 'start', '', 'spotify:']);
    case 'youtube_open': return run('cmd.exe', ['/c', 'start', '', 'https://www.youtube.com']);
    case 'app_open': {
      const app = args[0]?.toLowerCase();
      const allowed = { vscode: 'code', code: 'code', notepad: 'notepad.exe', chrome: 'chrome.exe', spotify: 'spotify.exe' };
      if (!allowed[app]) throw new Error('That application is not approved for the desktop agent.');
      return run('cmd.exe', ['/c', 'start', '', allowed[app]]);
    }
    default: throw new Error(`Desktop agent does not support '${action}' yet.`);
  }
}

http.createServer(async (req, res) => {
  const origin = req.headers.origin;
  if (origin && !ORIGINS.has(origin)) { res.writeHead(403); return res.end('Origin not allowed'); }
  res.setHeader('Access-Control-Allow-Origin', origin || 'https://harvox-ai-2.vercel.app');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') { res.writeHead(204); return res.end(); }
  if (req.method === 'GET' && req.url === '/health') { res.writeHead(200, {'Content-Type':'application/json'}); return res.end(JSON.stringify({ status: 'ok' })); }
  if (req.method !== 'POST' || req.url !== '/execute') { res.writeHead(404); return res.end(); }
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, '');
  if (!token || !(await verifyToken(token))) { res.writeHead(401); return res.end(JSON.stringify({ message: 'Harvox login required' })); }
  let body = ''; req.on('data', chunk => body += chunk); req.on('end', async () => {
    try { await execute(JSON.parse(body).step); res.writeHead(200, {'Content-Type':'application/json'}); res.end(JSON.stringify({ success: true, message: 'Executed on this Windows PC.' })); }
    catch (error) { res.writeHead(400, {'Content-Type':'application/json'}); res.end(JSON.stringify({ success: false, message: error.message })); }
  });
}).listen(PORT, '127.0.0.1', () => console.log(`Harvox Desktop Agent listening on http://127.0.0.1:${PORT}`));
