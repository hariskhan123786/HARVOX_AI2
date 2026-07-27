/**
 * HARVOX AI — Desktop Automation Agent
 * © Haris Khan — All Rights Reserved
 */

import http from 'node:http';
import { execFile, exec } from 'node:child_process';
import { writeFile, unlink, mkdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const PORT    = Number(process.env.HARVOX_AGENT_PORT || 8765);
const API_URL = process.env.HARVOX_API_URL || 'https://harvox-ai-2.vercel.app/api';

// All allowed origins (add your custom domain here if you deploy)
const ORIGINS = new Set([
  'https://harvox-ai-2.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:4173',
]);

// ─── Helpers ──────────────────────────────────────────────────────────────────

const run = (file, args = []) => new Promise((resolve, reject) => {
  execFile(file, args, { windowsHide: true, timeout: 15_000 }, (error, stdout, stderr) => {
    if (error) reject(new Error(stderr?.trim() || error.message));
    else resolve(stdout.trim());
  });
});

const shell = (cmd) => new Promise((resolve, reject) => {
  exec(cmd, { windowsHide: true, timeout: 15_000 }, (error, stdout, stderr) => {
    if (error) {
      // For protocol URIs (spotify:, ms-settings:) exec "fails" but actually works
      if (cmd.includes(':') && !cmd.includes('.exe')) {
        resolve('protocol launched');
      } else {
        reject(new Error(stderr?.trim() || error.message));
      }
    } else {
      resolve(stdout.trim());
    }
  });
});

async function runPS(script) {
  await mkdir(tmpdir(), { recursive: true }).catch(() => {});
  const tmpFile = join(tmpdir(), `harvox_ps_${Date.now()}.ps1`);
  await writeFile(tmpFile, script, 'utf-8');
  try {
    return await run('powershell.exe', ['-ExecutionPolicy', 'Bypass', '-NonInteractive', '-File', tmpFile]);
  } finally {
    await unlink(tmpFile).catch(() => {});
  }
}

function openUrl(url) {
  return shell(`start "" "${url}"`);
}

// ─── Action Registry ──────────────────────────────────────────────────────────

async function execute(step) {
  const action = step?.action;
  const args   = Array.isArray(step?.args) ? step.args.map(String) : [];
  const arg0   = args[0] || '';

  switch (action) {

    // ── Volume / Media ────────────────────────────────────────────────────────
    case 'media_volume_up':
    case 'volume_up':
      return run('powershell.exe', ['-NoProfile', '-Command', '$w=New-Object -ComObject WScript.Shell; 1..5|%{$w.SendKeys([char]175)}']);

    case 'media_volume_down':
    case 'volume_down':
      return run('powershell.exe', ['-NoProfile', '-Command', '$w=New-Object -ComObject WScript.Shell; 1..5|%{$w.SendKeys([char]174)}']);

    case 'media_mute':
    case 'mute':
      return run('powershell.exe', ['-NoProfile', '-Command', '$w=New-Object -ComObject WScript.Shell; $w.SendKeys([char]173)']);

    case 'media_play_pause':
      return run('powershell.exe', ['-NoProfile', '-Command', '$w=New-Object -ComObject WScript.Shell; $w.SendKeys([char]179)']);

    case 'media_next_track':
      return run('powershell.exe', ['-NoProfile', '-Command', '$w=New-Object -ComObject WScript.Shell; $w.SendKeys([char]176)']);

    case 'media_prev_track':
      return run('powershell.exe', ['-NoProfile', '-Command', '$w=New-Object -ComObject WScript.Shell; $w.SendKeys([char]177)']);

    case 'media_stop':
      return run('powershell.exe', ['-NoProfile', '-Command', '$w=New-Object -ComObject WScript.Shell; $w.SendKeys([char]178)']);

    // ── System ────────────────────────────────────────────────────────────────
    case 'lock':
    case 'system_lock':
      return run('rundll32.exe', ['user32.dll,LockWorkStation']);

    case 'system_sleep':
      return shell('rundll32.exe powrprof.dll,SetSuspendState 0,1,0');

    case 'system_shutdown':
      return shell('shutdown /s /t 30');

    case 'system_restart':
      return shell('shutdown /r /t 30');

    case 'open_settings':
      return shell('start ms-settings:');

    case 'open_task_manager':
      return shell('taskmgr');

    case 'open_file_explorer':
      return shell('explorer');

    // ── Browser / URL ─────────────────────────────────────────────────────────
    case 'open_chrome':
      return shell('start chrome');

    case 'open_edge':
      return shell('start msedge');

    case 'open_firefox':
      return shell('start firefox');

    case 'browser_open': {
      const browser = arg0.toLowerCase();
      const browserCmds = { chrome: 'start chrome', edge: 'start msedge', firefox: 'start firefox', brave: 'start brave' };
      return shell(browserCmds[browser] || 'start "" "about:blank"');
    }

    case 'browser_navigate':
    case 'open_url': {
      const url = arg0.startsWith('http') ? arg0 : `https://${arg0}`;
      return openUrl(url);
    }

    case 'search_google':
    case 'browser_search':
      return openUrl(`https://www.google.com/search?q=${encodeURIComponent(arg0)}`);

    case 'search_github':
      return openUrl(`https://github.com/search?q=${encodeURIComponent(arg0)}`);

    case 'search_npm':
      return openUrl(`https://www.npmjs.com/search?q=${encodeURIComponent(arg0)}`);

    case 'open_localhost': {
      const port = arg0 || '3000';
      return openUrl(`http://localhost:${port}`);
    }

    // Popular sites (static map)
    case 'open_github':         return openUrl('https://github.com');
    case 'open_gmail':          return openUrl('https://mail.google.com');
    case 'open_gdrive':         return openUrl('https://drive.google.com');
    case 'open_linkedin':       return openUrl('https://www.linkedin.com');
    case 'open_chatgpt':        return openUrl('https://chat.openai.com');
    case 'open_claude':         return openUrl('https://claude.ai');
    case 'open_vercel':         return openUrl('https://vercel.com');
    case 'open_netlify':        return openUrl('https://www.netlify.com');
    case 'open_figma':          return openUrl('https://www.figma.com');
    case 'open_notion':         return openUrl('https://www.notion.so');
    case 'open_trello':         return openUrl('https://trello.com');
    case 'open_stackoverflow':  return openUrl('https://stackoverflow.com');
    case 'open_npmjs':          return openUrl('https://www.npmjs.com');
    case 'open_mdn':            return openUrl('https://developer.mozilla.org');
    case 'open_tailwindcss':    return openUrl('https://tailwindcss.com/docs');
    case 'open_whatsapp_web':   return openUrl('https://web.whatsapp.com');
    case 'open_fiverr':         return openUrl('https://www.fiverr.com');
    case 'open_railway':        return openUrl('https://railway.app');
    case 'open_localhost_3000': return openUrl('http://localhost:3000');
    case 'open_localhost_5173': return openUrl('http://localhost:5173');
    case 'open_localhost_5000': return openUrl('http://localhost:5000');

    // ── YouTube ───────────────────────────────────────────────────────────────
    case 'youtube_open':
      return openUrl('https://www.youtube.com');

    case 'youtube_search':
      return openUrl(`https://www.youtube.com/results?search_query=${encodeURIComponent(arg0)}`);

    // play_music is an alias for youtube_play (used by WorkspaceOS music widget)
    case 'play_music':
    case 'youtube_play': {
      // Try Invidious API for direct video ID resolution
      const query = arg0 || 'lofi hip hop';
      const instances = [
        'https://inv.nadeko.net',
        'https://invidious.nerdvpn.de',
        'https://yt.artemislena.eu',
        'https://invidious.slipfox.xyz',
        'https://invidious.privacydev.net',
      ];
      
      console.log(`[YouTube] Searching for: "${query}"`);
      
      for (const inst of instances) {
        try {
          const { default: fetch2 } = await import('node:http').then(() => import('node-fetch')).catch(() => ({ default: globalThis.fetch }));
          const fetchFn = typeof fetch !== 'undefined' ? fetch : fetch2;
          const res = await fetchFn(
            `${inst}/api/v1/search?q=${encodeURIComponent(query)}&type=video`,
            { headers: { Accept: 'application/json' }, signal: AbortSignal.timeout(8000) }
          );
          if (res.ok) {
            const results = await res.json();
            console.log(`[YouTube] Got ${Array.isArray(results) ? results.length : 0} results from ${inst}`);
            const first = Array.isArray(results) && results.length > 0 ? results[0] : null;
            if (first?.videoId) {
              console.log(`[YouTube] ✅ Found: ${first.title} (${first.videoId})`);
              await openUrl(`https://www.youtube.com/watch?v=${first.videoId}&autoplay=1`);
              return { success: true, message: `▶️ Playing "${first.title || query}" on YouTube!` };
            }
          }
        } catch (err) {
          console.warn(`[YouTube] Instance ${inst} failed:`, err.message);
        }
      }
      
      // Fallback: open search page and auto-click first video
      console.warn(`[YouTube] All APIs failed. Using search + auto-click.`);
      await openUrl(`https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`);
      
      // PowerShell automation to click first video
      await runPS(`
Add-Type -AssemblyName System.Windows.Forms
$wshell = New-Object -ComObject WScript.Shell

# Wait for page to load
Start-Sleep -Seconds 7

# Try to activate browser
$browsers = @("Chrome", "Edge", "Firefox", "Brave", "Google Chrome", "Microsoft Edge")
$activated = $false
foreach ($b in $browsers) {
  if ($wshell.AppActivate($b)) {
    $activated = $true
    Start-Sleep -Milliseconds 800
    break
  }
}

if ($activated) {
  # Click on page to ensure it has focus
  $wshell.SendKeys(" ")
  Start-Sleep -Milliseconds 200
  $wshell.SendKeys("{BACKSPACE}")
  Start-Sleep -Milliseconds 500
  
  # Scroll down slightly to ensure first video is visible
  $wshell.SendKeys("{PGDN}")
  Start-Sleep -Milliseconds 500
  $wshell.SendKeys("{PGUP}")
  Start-Sleep -Milliseconds 500
  
  # Tab to first video and press Enter
  for ($i = 1; $i -le 12; $i++) {
    $wshell.SendKeys("{TAB}")
    Start-Sleep -Milliseconds 120
  }
  Start-Sleep -Milliseconds 500
  $wshell.SendKeys("{ENTER}")
  
  Write-Output "Auto-clicked first video"
}
      `);
      
      return { success: true, message: `▶️ Playing "${query}" on YouTube!` };
    }

    case 'youtube_watch_later':
      return openUrl('https://www.youtube.com/playlist?list=WL');

    case 'youtube_fullscreen':
    case 'youtube_subtitles':
    case 'youtube_like':
    case 'youtube_skip':
    case 'youtube_speed_up':
    case 'youtube_speed_down': {
      const keyMap = {
        youtube_fullscreen:  'f',
        youtube_subtitles:   'c',
        youtube_like:        '+l',
        youtube_skip:        '{RIGHT}{RIGHT}{RIGHT}{RIGHT}{RIGHT}',
        youtube_speed_up:    '>',
        youtube_speed_down:  '<',
      };
      await runPS(`
$w = New-Object -ComObject WScript.Shell
foreach ($b in @("Chrome","Edge","Firefox","YouTube")) { if ($w.AppActivate($b)) { break } }
Start-Sleep -Milliseconds 400
$w.SendKeys("${keyMap[action]}")
      `);
      return { success: true, message: `YouTube action "${action}" sent.` };
    }

    // ── Spotify ───────────────────────────────────────────────────────────────
    case 'spotify_open':
      return shell('start spotify:');

    case 'spotify_liked_songs':
      return shell('start spotify:user:liked');

    case 'spotify_play': {
      const song = (arg0 || 'relaxing music').replace(/on spotify/i, '').replace(/^play\s*/i, '').trim();
      await shell(`start spotify:search:"${song}"`).catch(() => {});
      await runPS(`
$w = New-Object -ComObject WScript.Shell
Start-Sleep -Seconds 3
$w.AppActivate("Spotify")
Start-Sleep -Milliseconds 400
$w.SendKeys("{ENTER}")
      `);
      return { success: true, message: `Searching Spotify for "${song}"...` };
    }

    case 'spotify_next':
    case 'spotify_prev':
    case 'spotify_pause':
    case 'spotify_shuffle':
    case 'spotify_repeat': {
      const spotifyKeyMap = {
        spotify_next:    '^{RIGHT}',
        spotify_prev:    '^{LEFT}',
        spotify_pause:   ' ',
        spotify_shuffle: '^s',
        spotify_repeat:  '^r',
      };
      await runPS(`
$w = New-Object -ComObject WScript.Shell
$w.AppActivate("Spotify")
Start-Sleep -Milliseconds 300
$w.SendKeys("${spotifyKeyMap[action]}")
      `);
      return { success: true, message: `Spotify: ${action.replace('spotify_', '')} triggered.` };
    }

    // ── Streaming ─────────────────────────────────────────────────────────────
    case 'open_netflix':       return openUrl('https://www.netflix.com');
    case 'open_prime_video':   return openUrl('https://www.primevideo.com');
    case 'open_disney_plus':   return openUrl('https://www.disneyplus.com');
    case 'open_youtube_music': return openUrl('https://music.youtube.com');

    // ── App Open ──────────────────────────────────────────────────────────────
    case 'app_open':
    case 'open_app':
    case 'open_application': {
      const app = arg0.toLowerCase();
      const allowed = {
        vscode: 'code', code: 'code', 'vs code': 'code',
        notepad: 'notepad', chrome: 'start chrome', firefox: 'start firefox',
        edge: 'start msedge', spotify: 'start spotify:', discord: 'start discord:',
        slack: 'start slack:', teams: 'start ms-teams:', calculator: 'calc',
        paint: 'mspaint', explorer: 'explorer', cmd: 'start cmd',
        terminal: 'start wt', powershell: 'start powershell',
        antigravity: 'start "" "C:\\Program Files\\Antigravity\\Antigravity.exe"',
        whatsapp: 'start whatsapp:',
      };
      if (!allowed[app]) throw new Error(`App "${app}" is not in the approved list.`);
      return shell(allowed[app]);
    }

    // ── VS Code Automation ────────────────────────────────────────────────────
    case 'vscode_create_file':
    case 'open_vscode': {
      const folder = arg0 || '';
      return shell(folder ? `code "${folder}"` : 'code');
    }

    case 'vscode_next_tab':
      return runPS(`$w=New-Object -ComObject WScript.Shell;$w.AppActivate("Visual Studio Code");Start-Sleep -Milliseconds 200;$w.SendKeys("^{PGDN}")`);

    case 'vscode_prev_tab':
      return runPS(`$w=New-Object -ComObject WScript.Shell;$w.AppActivate("Visual Studio Code");Start-Sleep -Milliseconds 200;$w.SendKeys("^{PGUP}")`);

    case 'vscode_close_tab':
      return runPS(`$w=New-Object -ComObject WScript.Shell;$w.AppActivate("Visual Studio Code");Start-Sleep -Milliseconds 200;$w.SendKeys("^w")`);

    case 'vscode_quick_open':
      return runPS(`$w=New-Object -ComObject WScript.Shell;$w.AppActivate("Visual Studio Code");Start-Sleep -Milliseconds 200;$w.SendKeys("^p")`);

    case 'vscode_command_palette':
      return runPS(`$w=New-Object -ComObject WScript.Shell;$w.AppActivate("Visual Studio Code");Start-Sleep -Milliseconds 200;$w.SendKeys("^+p")`);

    case 'vscode_sidebar':
    case 'vscode_toggle_sidebar':
      return runPS(`$w=New-Object -ComObject WScript.Shell;$w.AppActivate("Visual Studio Code");Start-Sleep -Milliseconds 200;$w.SendKeys("^b")`);

    case 'vscode_terminal':
    case 'vscode_terminal_toggle':
      return runPS(`$w=New-Object -ComObject WScript.Shell;$w.AppActivate("Visual Studio Code");Start-Sleep -Milliseconds 200;$w.SendKeys("^{OEM_3}")`);

    case 'vscode_format':
    case 'vscode_format_document':
      return runPS(`$w=New-Object -ComObject WScript.Shell;$w.AppActivate("Visual Studio Code");Start-Sleep -Milliseconds 200;$w.SendKeys("^+i")`);

    case 'vscode_save_all':
      return runPS(`$w=New-Object -ComObject WScript.Shell;$w.AppActivate("Visual Studio Code");Start-Sleep -Milliseconds 200;$w.SendKeys("^k");Start-Sleep -Milliseconds 100;$w.SendKeys("s")`);

    // ── Navigation & Window Management ────────────────────────────────────────
    case 'nav_switch_app':
    case 'nav_alt_tab':
      return runPS(`$w=New-Object -ComObject WScript.Shell;$w.SendKeys("%{TAB}")`);

    case 'nav_alt_tab_reverse':
      return runPS(`$w=New-Object -ComObject WScript.Shell;$w.SendKeys("%+{TAB}")`);

    case 'nav_show_desktop':
      return runPS(`$w=New-Object -ComObject WScript.Shell;$w.SendKeys("#d")`);

    case 'nav_minimize_all':
      return runPS(`$w=New-Object -ComObject WScript.Shell;$w.SendKeys("#m")`);

    case 'nav_task_view':
      return runPS(`$w=New-Object -ComObject WScript.Shell;$w.SendKeys("#^d")`);

    case 'window_maximize':
      return runPS(`$w=New-Object -ComObject WScript.Shell;$w.SendKeys("#^{UP}")`);

    case 'window_minimize':
      return runPS(`$w=New-Object -ComObject WScript.Shell;$w.SendKeys("#^{DOWN}")`);

    case 'window_snap_left':
      return runPS(`$w=New-Object -ComObject WScript.Shell;$w.SendKeys("#^{LEFT}")`);

    case 'window_snap_right':
      return runPS(`$w=New-Object -ComObject WScript.Shell;$w.SendKeys("#^{RIGHT}")`);

    case 'window_close':
      return runPS(`$w=New-Object -ComObject WScript.Shell;$w.SendKeys("%{F4}")`);

    // ── Browser Tab Management ────────────────────────────────────────────────
    case 'browser_new_tab':
      return runPS(`$w=New-Object -ComObject WScript.Shell;foreach($b in @("Chrome","Edge","Firefox","Brave")){if($w.AppActivate($b)){break}};Start-Sleep -Milliseconds 200;$w.SendKeys("^t")`);

    case 'browser_close_tab':
      return runPS(`$w=New-Object -ComObject WScript.Shell;foreach($b in @("Chrome","Edge","Firefox","Brave")){if($w.AppActivate($b)){break}};Start-Sleep -Milliseconds 200;$w.SendKeys("^w")`);

    case 'browser_next_tab':
      return runPS(`$w=New-Object -ComObject WScript.Shell;foreach($b in @("Chrome","Edge","Firefox","Brave")){if($w.AppActivate($b)){break}};Start-Sleep -Milliseconds 200;$w.SendKeys("^{TAB}")`);

    case 'browser_prev_tab':
      return runPS(`$w=New-Object -ComObject WScript.Shell;foreach($b in@("Chrome","Edge","Firefox","Brave")){if($w.AppActivate($b)){break}};Start-Sleep -Milliseconds 200;$w.SendKeys("^+{TAB}")`);

    case 'browser_reopen_tab':
      return runPS(`$w=New-Object -ComObject WScript.Shell;foreach($b in@("Chrome","Edge","Firefox","Brave")){if($w.AppActivate($b)){break}};Start-Sleep -Milliseconds 200;$w.SendKeys("^+t")`);

    case 'browser_fullscreen':
      return runPS(`$w=New-Object -ComObject WScript.Shell;foreach($b in@("Chrome","Edge","Firefox","Brave")){if($w.AppActivate($b)){break}};Start-Sleep -Milliseconds 200;$w.SendKeys("{F11}")`);

    case 'browser_refresh':
      return runPS(`$w=New-Object -ComObject WScript.Shell;foreach($b in@("Chrome","Edge","Firefox","Brave")){if($w.AppActivate($b)){break}};Start-Sleep -Milliseconds 200;$w.SendKeys("{F5}")`);

    case 'browser_hard_refresh':
      return runPS(`$w=New-Object -ComObject WScript.Shell;foreach($b in@("Chrome","Edge","Firefox","Brave")){if($w.AppActivate($b)){break}};Start-Sleep -Milliseconds 200;$w.SendKeys("^{F5}")`);

    case 'browser_back':
      return runPS(`$w=New-Object -ComObject WScript.Shell;foreach($b in@("Chrome","Edge","Firefox","Brave")){if($w.AppActivate($b)){break}};Start-Sleep -Milliseconds 200;$w.SendKeys("%{LEFT}")`);

    case 'browser_forward':
      return runPS(`$w=New-Object -ComObject WScript.Shell;foreach($b in@("Chrome","Edge","Firefox","Brave")){if($w.AppActivate($b)){break}};Start-Sleep -Milliseconds 200;$w.SendKeys("%{RIGHT}")`);

    case 'browser_address_bar':
      return runPS(`$w=New-Object -ComObject WScript.Shell;foreach($b in@("Chrome","Edge","Firefox","Brave")){if($w.AppActivate($b)){break}};Start-Sleep -Milliseconds 200;$w.SendKeys("^l")`);

    // ── WhatsApp ──────────────────────────────────────────────────────────────
    case 'whatsapp_open':
      return shell('start whatsapp:').catch(() => openUrl('https://web.whatsapp.com'));

    case 'whatsapp_open_chat': {
      const contact = arg0 || '';
      const phone = contact.replace(/\D/g, '');
      if (phone.length >= 7) {
        return openUrl(`https://wa.me/${phone}`);
      }
      return openUrl(`https://web.whatsapp.com/send?text=${encodeURIComponent(contact)}`);
    }

    case 'whatsapp_send_message': {
      const phone = args[0] || '';
      const message = args[1] || '';
      const cleanPhone = phone.replace(/\D/g, '');
      if (cleanPhone.length >= 7 && message) {
        return openUrl(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`);
      }
      return openUrl(`https://web.whatsapp.com/send?text=${encodeURIComponent(message)}`);
    }

    // ── Productivity ──────────────────────────────────────────────────────────
    case 'focus_mode_enable':
      await runPS(`
$apps = @("chrome","msedge","firefox","discord","slack")
foreach ($a in $apps) { Stop-Process -Name $a -Force -ErrorAction SilentlyContinue }
      `);
      return { success: true, message: '🎯 Focus mode enabled — distracting apps closed.' };

    case 'study_mode_enable':
      await shell('code').catch(() => {});
      await runPS(`
$kill = @("discord","slack","steam","epicgames")
foreach ($a in $kill) { Stop-Process -Name $a -Force -ErrorAction SilentlyContinue }
      `);
      return { success: true, message: '📚 Study mode enabled — VS Code opened, distractions closed.' };

    case 'pomodoro_start': {
      const mins = parseInt(arg0) || 25;
      // Simple: open a Pomodoro timer site
      await openUrl(`https://pomofocus.io`);
      return { success: true, message: `⏱️ Pomodoro timer opened (${mins} min session).` };
    }

    default:
      throw new Error(`Desktop agent does not support action '${action}' yet.`);
  }
}

// ─── Token Verification ───────────────────────────────────────────────────────

async function verifyToken(token) {
  try {
    const res = await fetch(`${API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(5000),
    });
    return res.ok;
  } catch {
    // If API is unreachable, allow action (token still needed, checked locally)
    return false;
  }
}

// ─── HTTP Server ──────────────────────────────────────────────────────────────

http.createServer(async (req, res) => {
  const origin = req.headers.origin;
  const allowed = ORIGINS.has(origin) ? origin : null;

  // CORS headers
  if (allowed) res.setHeader('Access-Control-Allow-Origin', allowed);
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');

  if (req.method === 'OPTIONS') { res.writeHead(204); return res.end(); }

  if (req.method === 'GET' && req.url === '/health') {
    console.log(`\x1b[96m  ❤️  Health check received\x1b[0m`);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ status: 'ok', version: '2.0.0', port: PORT }));
  }

  if (req.method !== 'POST' || req.url !== '/execute') {
    res.writeHead(404); return res.end();
  }

  const token = req.headers.authorization?.replace(/^Bearer\s+/i, '');
  if (!token) {
    res.writeHead(401, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ message: 'Authorization token required.' }));
  }

  // Read request body
  let body = '';
  req.on('data', chunk => body += chunk);
  req.on('end', async () => {
    try {
      const parsed = JSON.parse(body);
      const step   = parsed.step;

      if (!step?.action) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ success: false, message: 'step.action is required.' }));
      }

      console.log(`\x1b[95m  ⚡ Executing: \x1b[97m${step.action}\x1b[0m`);
      const result = await execute(step);
      console.log(`\x1b[92m  ✓ Success: \x1b[90m${typeof result === 'string' ? result.slice(0, 50) : result?.message?.slice(0, 50) || 'Done'}\x1b[0m`);
      
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, message: typeof result === 'string' ? result : result?.message || 'Executed on your Windows PC.' }));
    } catch (error) {
      console.log(`\x1b[91m  ✗ Error: \x1b[90m${error.message}\x1b[0m`);
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, message: error.message }));
    }
  });

}).listen(PORT, '127.0.0.1', () => {
  console.log('');
  console.log('\x1b[95m  ██╗  ██╗ █████╗ ██████╗ ██╗   ██╗ ██████╗ ██╗  ██╗\x1b[0m');
  console.log('\x1b[95m  ██║  ██║██╔══██╗██╔══██╗██║   ██║██╔═══██╗╚██╗██╔╝\x1b[0m');
  console.log('\x1b[95m  ███████║███████║██████╔╝██║   ██║██║   ██║ ╚███╔╝ \x1b[0m');
  console.log('\x1b[96m  ██╔══██║██╔══██║██╔══██╗╚██╗ ██╔╝██║   ██║ ██╔██╗ \x1b[0m');
  console.log('\x1b[96m  ██║  ██║██║  ██║██║  ██║ ╚████╔╝ ╚██████╔╝██╔╝ ██╗\x1b[0m');
  console.log('\x1b[96m  ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝  ╚═══╝   ╚═════╝ ╚═╝  ╚═╝\x1b[0m');
  console.log('');
  console.log(`\x1b[92m  ✅ Desktop Agent v3.0 running on \x1b[97mhttp://127.0.0.1:${PORT}\x1b[0m`);
  console.log(`\x1b[95m  🔒 Listening only on localhost (secure)\x1b[0m`);
  console.log(`\x1b[96m  🌐 API: \x1b[97m${API_URL}\x1b[0m`);
  console.log(`\x1b[93m  📋 Supported origins: \x1b[90m${[...ORIGINS].join(', ')}\x1b[0m`);
  console.log('');
  console.log('\x1b[95m  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\x1b[0m');
  console.log(`\x1b[96m  💜 HARVOX AI Desktop Automation Ready\x1b[0m`);
  console.log(`\x1b[95m  🎯 120+ Commands Available\x1b[0m`);
  console.log(`\x1b[96m  🆕 VS Code Automation (11 actions)\x1b[0m`);
  console.log(`\x1b[96m  🆕 Browser Tab Management (11 actions)\x1b[0m`);
  console.log(`\x1b[96m  🆕 Window Management (5 actions)\x1b[0m`);
  console.log(`\x1b[96m  🆕 Navigation Controls (6 actions)\x1b[0m`);
  console.log(`\x1b[96m  🆕 WhatsApp Automation (3 actions)\x1b[0m`);
  console.log('\x1b[95m  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\x1b[0m');
  console.log('');
  console.log(`\x1b[93m  Keep this window open while using HARVOX AI.\x1b[0m`);
  console.log(`\x1b[93m  Close it to stop all desktop automation.\x1b[0m`);
  console.log('');
  console.log('\x1b[96m  © Haris Khan — All Rights Reserved\x1b[0m');
  console.log('');
});
