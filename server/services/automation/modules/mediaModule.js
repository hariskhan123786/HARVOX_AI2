/**
 * HARVOX Automation Engine — Media Module
 * Skills: Spotify, YouTube, System Media Control
 */

import { exec } from 'child_process';
import { logActivity } from '../../memoryService.js';
import { registerModule } from '../automationRegistry.js';
import { runPS, execCmd as execP } from '../../../utils/powershell.js';

// ─── Spotify Skills ───────────────────────────────────────────────────────────

async function spotifyPlay(userId, args) {
  const query = args[0] || '';
  const song = query.replace(/on spotify/i, '').replace(/play/i, '').trim();
  await execP(`start spotify:search:"${song}"`).catch(() => {});
  await runPS(`
$wshell = New-Object -ComObject wscript.shell;
Start-Sleep -Seconds 4;
$wshell.AppActivate("Spotify");
Start-Sleep -Milliseconds 400;
$wshell.SendKeys("{ENTER}");
  `);
  await logActivity(userId, 'spotify_play', `Played on Spotify: "${song}"`, { song });
  return { success: true, message: `Opened Spotify and searching for "${song}".` };
}

async function spotifyNext(userId) {
  await runPS(`
$wshell = New-Object -ComObject wscript.shell;
$wshell.AppActivate("Spotify");
Start-Sleep -Milliseconds 300;
$wshell.SendKeys("^{RIGHT}");
  `);
  await logActivity(userId, 'spotify_next', 'Skipped to next Spotify track');
  return { success: true, message: 'Skipped to next track on Spotify.' };
}

async function spotifyPrev(userId) {
  await runPS(`
$wshell = New-Object -ComObject wscript.shell;
$wshell.AppActivate("Spotify");
Start-Sleep -Milliseconds 300;
$wshell.SendKeys("^{LEFT}");
  `);
  await logActivity(userId, 'spotify_prev', 'Went to previous Spotify track');
  return { success: true, message: 'Went to previous track on Spotify.' };
}

async function spotifyPause(userId) {
  await runPS(`
$wshell = New-Object -ComObject wscript.shell;
$wshell.AppActivate("Spotify");
Start-Sleep -Milliseconds 300;
$wshell.SendKeys(" ");
  `);
  await logActivity(userId, 'spotify_pause', 'Paused Spotify');
  return { success: true, message: 'Spotify paused.' };
}

async function spotifyShuffle(userId) {
  await runPS(`
$wshell = New-Object -ComObject wscript.shell;
$wshell.AppActivate("Spotify");
Start-Sleep -Milliseconds 300;
$wshell.SendKeys("^s");
  `);
  await logActivity(userId, 'spotify_shuffle', 'Toggled Spotify shuffle');
  return { success: true, message: 'Toggled shuffle on Spotify.' };
}

async function spotifyRepeat(userId) {
  await runPS(`
$wshell = New-Object -ComObject wscript.shell;
$wshell.AppActivate("Spotify");
Start-Sleep -Milliseconds 300;
$wshell.SendKeys("^r");
  `);
  await logActivity(userId, 'spotify_repeat', 'Toggled Spotify repeat');
  return { success: true, message: 'Toggled repeat on Spotify.' };
}

async function spotifyOpen(userId) {
  await execP(`start spotify:`).catch(() => {});
  await logActivity(userId, 'spotify_open', 'Opened Spotify');
  return { success: true, message: 'Spotify launched.' };
}

async function spotifyLikedSongs(userId) {
  await execP(`start spotify:user:liked`).catch(() => {});
  await logActivity(userId, 'spotify_liked', 'Opened Spotify Liked Songs');
  return { success: true, message: 'Opened Liked Songs on Spotify.' };
}

// ─── YouTube Skills ───────────────────────────────────────────────────────────

async function youtubePlay(userId, args) {
  const query = (args[0] || 'lofi hip hop').replace(/on youtube/i, '').replace(/^play\s*/i, '').trim();

  // ── Strategy 1: Invidious public API → Direct video play ───────
  const INVIDIOUS_INSTANCES = [
    'https://inv.nadeko.net',
    'https://invidious.nerdvpn.de',
    'https://yt.artemislena.eu',
    'https://invidious.slipfox.xyz',
    'https://invidious.privacydev.net',
  ];

  console.log(`[YouTube] Searching for: "${query}"`);

  for (const instance of INVIDIOUS_INSTANCES) {
    try {
      console.log(`[YouTube] Trying instance: ${instance}`);
      const apiUrl = `${instance}/api/v1/search?q=${encodeURIComponent(query)}&type=video`;
      const res = await fetch(apiUrl, {
        headers: { 'Accept': 'application/json' },
        signal: AbortSignal.timeout(8000),
      });
      
      if (!res.ok) {
        console.warn(`[YouTube] Instance ${instance} returned status ${res.status}`);
        continue;
      }
      
      const results = await res.json();
      console.log(`[YouTube] Got ${Array.isArray(results) ? results.length : 0} results from ${instance}`);
      
      const first = Array.isArray(results) && results.length > 0 ? results[0] : null;
      
      if (first?.videoId) {
        const playUrl = `https://www.youtube.com/watch?v=${first.videoId}&autoplay=1`;
        console.log(`[YouTube] ✅ Found video: ${first.title} (${first.videoId})`);
        await execP(`start "" "${playUrl}"`);
        await logActivity(userId, 'youtube_play', `▶️ Playing: "${first.title || query}"`, { query, videoId: first.videoId });
        return { success: true, message: `▶️ Now playing "${first.title || query}" on YouTube!` };
      }
    } catch (err) {
      console.warn(`[YouTube] Instance ${instance} failed:`, err.message);
    }
  }

  // ── Strategy 2: Fallback - Open search page manually ──────
  console.warn(`[YouTube] All Invidious instances failed. Opening search page.`);
  const fallbackUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
  await execP(`start "" "${fallbackUrl}"`);
  await logActivity(userId, 'youtube_play', `Opened YouTube search for "${query}"`, { query });
  return { success: true, message: `🔍 Opened YouTube search for "${query}". Please click the first video to play.` };
}


async function youtubeSearch(userId, args) {
  const query = args[0] || '';
  const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
  await execP(`start "" "${searchUrl}"`);
  await logActivity(userId, 'youtube_search', `Searched YouTube: "${query}"`, { query });
  return { success: true, message: `Opened YouTube search for "${query}".` };
}

async function youtubeOpen(userId) {
  await execP(`start "" "https://www.youtube.com"`);
  await logActivity(userId, 'youtube_open', 'Opened YouTube');
  return { success: true, message: 'YouTube opened.' };
}

async function youtubeFullscreen(userId) {
  await runPS(`
$wshell = New-Object -ComObject wscript.shell;
$browsers = @("Chrome","Edge","Firefox","YouTube");
foreach ($b in $browsers) { if ($wshell.AppActivate($b)) { break } }
Start-Sleep -Milliseconds 400;
$wshell.SendKeys("f");
  `);
  await logActivity(userId, 'youtube_fullscreen', 'Toggled YouTube fullscreen');
  return { success: true, message: 'Toggled fullscreen on YouTube.' };
}

async function youtubeSpeedUp(userId) {
  await runPS(`
$wshell = New-Object -ComObject wscript.shell;
$browsers = @("Chrome","Edge","Firefox","YouTube");
foreach ($b in $browsers) { if ($wshell.AppActivate($b)) { break } }
Start-Sleep -Milliseconds 400;
$wshell.SendKeys(">");
  `);
  return { success: true, message: 'Increased YouTube playback speed.' };
}

async function youtubeSpeedDown(userId) {
  await runPS(`
$wshell = New-Object -ComObject wscript.shell;
$browsers = @("Chrome","Edge","Firefox","YouTube");
foreach ($b in $browsers) { if ($wshell.AppActivate($b)) { break } }
Start-Sleep -Milliseconds 400;
$wshell.SendKeys("<");
  `);
  return { success: true, message: 'Decreased YouTube playback speed.' };
}

async function youtubeSubtitles(userId) {
  await runPS(`
$wshell = New-Object -ComObject wscript.shell;
$browsers = @("Chrome","Edge","Firefox","YouTube");
foreach ($b in $browsers) { if ($wshell.AppActivate($b)) { break } }
Start-Sleep -Milliseconds 400;
$wshell.SendKeys("c");
  `);
  return { success: true, message: 'Toggled subtitles on YouTube.' };
}

async function youtubeLike(userId) {
  await runPS(`
$wshell = New-Object -ComObject wscript.shell;
$browsers = @("Chrome","Edge","Firefox","YouTube");
foreach ($b in $browsers) { if ($wshell.AppActivate($b)) { break } }
Start-Sleep -Milliseconds 400;
$wshell.SendKeys("+l");
  `);
  await logActivity(userId, 'youtube_like', 'Liked YouTube video');
  return { success: true, message: 'Liked current YouTube video.' };
}

async function youtubeWatchLater(userId) {
  await execP(`start "" "https://www.youtube.com/playlist?list=WL"`);
  return { success: true, message: 'Opened YouTube Watch Later playlist.' };
}

async function youtubeSkip(userId) {
  await runPS(`
$wshell = New-Object -ComObject wscript.shell;
$browsers = @("Chrome","Edge","Firefox","YouTube");
foreach ($b in $browsers) { if ($wshell.AppActivate($b)) { break } }
Start-Sleep -Milliseconds 400;
$wshell.SendKeys("{RIGHT}{RIGHT}{RIGHT}{RIGHT}{RIGHT}");
  `);
  return { success: true, message: 'Skipped forward 25 seconds on YouTube.' };
}

// ─── Streaming Service Skills ─────────────────────────────────────────────────

async function openNetflix(userId) {
  await execP(`start "" "https://www.netflix.com"`);
  await logActivity(userId, 'open_netflix', 'Opened Netflix');
  return { success: true, message: 'Netflix opened in browser.' };
}

async function openPrimeVideo(userId) {
  await execP(`start "" "https://www.primevideo.com"`);
  await logActivity(userId, 'open_prime', 'Opened Prime Video');
  return { success: true, message: 'Prime Video opened in browser.' };
}

async function openDisneyPlus(userId) {
  await execP(`start "" "https://www.disneyplus.com"`);
  await logActivity(userId, 'open_disney', 'Opened Disney+');
  return { success: true, message: 'Disney+ opened in browser.' };
}

async function openYouTubeMusic(userId) {
  await execP(`start "" "https://music.youtube.com"`);
  await logActivity(userId, 'open_ytmusic', 'Opened YouTube Music');
  return { success: true, message: 'YouTube Music opened in browser.' };
}

// ─── System Media Control ─────────────────────────────────────────────────────

async function mediaVolumeUp(userId) {
  await runPS(`$wshell = New-Object -ComObject wscript.shell; $wshell.SendKeys([char]175);`);
  await logActivity(userId, 'media_vol_up', 'Volume Up');
  return { success: true, message: 'Volume increased.' };
}

async function mediaVolumeDown(userId) {
  await runPS(`$wshell = New-Object -ComObject wscript.shell; $wshell.SendKeys([char]174);`);
  await logActivity(userId, 'media_vol_down', 'Volume Down');
  return { success: true, message: 'Volume decreased.' };
}

async function mediaMute(userId) {
  await runPS(`$wshell = New-Object -ComObject wscript.shell; $wshell.SendKeys([char]173);`);
  await logActivity(userId, 'media_mute', 'Toggled Mute');
  return { success: true, message: 'System audio muted/unmuted.' };
}

async function mediaPlayPause(userId) {
  await runPS(`$wshell = New-Object -ComObject wscript.shell; $wshell.SendKeys([char]179);`);
  await logActivity(userId, 'media_playpause', 'Play/Pause toggled');
  return { success: true, message: 'Media play/pause toggled.' };
}

async function mediaNext(userId) {
  await runPS(`$wshell = New-Object -ComObject wscript.shell; $wshell.SendKeys([char]176);`);
  await logActivity(userId, 'media_next', 'Next track');
  return { success: true, message: 'Skipped to next media track.' };
}

async function mediaPrev(userId) {
  await runPS(`$wshell = New-Object -ComObject wscript.shell; $wshell.SendKeys([char]177);`);
  await logActivity(userId, 'media_prev', 'Previous track');
  return { success: true, message: 'Went to previous media track.' };
}

async function mediaStop(userId) {
  await runPS(`$wshell = New-Object -ComObject wscript.shell; $wshell.SendKeys([char]178);`);
  await logActivity(userId, 'media_stop', 'Media stopped');
  return { success: true, message: 'Media stopped.' };
}

// ─── Module Registration ──────────────────────────────────────────────────────

registerModule(
  'media',
  {
    name: 'Media Automation',
    icon: 'Music',
    description: 'Control Spotify, YouTube, streaming services, and system media.',
    color: '#be5cf6',
  },
  [
    // Spotify
    { action: 'spotify_play',        label: 'Play on Spotify',         handler: (u, a) => spotifyPlay(u, a),     estimatedMs: 6000 },
    { action: 'spotify_next',        label: 'Next Track (Spotify)',     handler: (u) => spotifyNext(u),           estimatedMs: 1500 },
    { action: 'spotify_prev',        label: 'Previous Track (Spotify)', handler: (u) => spotifyPrev(u),           estimatedMs: 1500 },
    { action: 'spotify_pause',       label: 'Pause Spotify',           handler: (u) => spotifyPause(u),          estimatedMs: 1500 },
    { action: 'spotify_shuffle',     label: 'Shuffle Spotify',         handler: (u) => spotifyShuffle(u),        estimatedMs: 1500 },
    { action: 'spotify_repeat',      label: 'Repeat Spotify',          handler: (u) => spotifyRepeat(u),         estimatedMs: 1500 },
    { action: 'spotify_open',        label: 'Open Spotify',            handler: (u) => spotifyOpen(u),           estimatedMs: 2000 },
    { action: 'spotify_liked_songs', label: 'Open Liked Songs',        handler: (u) => spotifyLikedSongs(u),     estimatedMs: 2000 },
    // YouTube
    { action: 'youtube_play',        label: 'Play on YouTube',         handler: (u, a) => youtubePlay(u, a),     estimatedMs: 10000 },
    { action: 'youtube_search',      label: 'Search YouTube',          handler: (u, a) => youtubeSearch(u, a),   estimatedMs: 2000 },
    { action: 'youtube_open',        label: 'Open YouTube',            handler: (u) => youtubeOpen(u),           estimatedMs: 2000 },
    { action: 'youtube_fullscreen',  label: 'Toggle Fullscreen',       handler: (u) => youtubeFullscreen(u),     estimatedMs: 1000 },
    { action: 'youtube_speed_up',    label: 'Increase Playback Speed', handler: (u) => youtubeSpeedUp(u),        estimatedMs: 1000 },
    { action: 'youtube_speed_down',  label: 'Decrease Playback Speed', handler: (u) => youtubeSpeedDown(u),      estimatedMs: 1000 },
    { action: 'youtube_subtitles',   label: 'Toggle Subtitles',        handler: (u) => youtubeSubtitles(u),      estimatedMs: 1000 },
    { action: 'youtube_like',        label: 'Like Video',              handler: (u) => youtubeLike(u),           estimatedMs: 1000 },
    { action: 'youtube_watch_later', label: 'Open Watch Later',        handler: (u) => youtubeWatchLater(u),     estimatedMs: 2000 },
    { action: 'youtube_skip',        label: 'Skip Forward 25s',        handler: (u) => youtubeSkip(u),           estimatedMs: 1000 },
    // Streaming
    { action: 'open_netflix',        label: 'Open Netflix',            handler: (u) => openNetflix(u),           estimatedMs: 2000 },
    { action: 'open_prime_video',    label: 'Open Prime Video',        handler: (u) => openPrimeVideo(u),        estimatedMs: 2000 },
    { action: 'open_disney_plus',    label: 'Open Disney+',            handler: (u) => openDisneyPlus(u),        estimatedMs: 2000 },
    { action: 'open_youtube_music',  label: 'Open YouTube Music',      handler: (u) => openYouTubeMusic(u),      estimatedMs: 2000 },
    // System Media
    { action: 'media_volume_up',     label: 'Volume Up',               handler: (u) => mediaVolumeUp(u),         estimatedMs: 500  },
    { action: 'media_volume_down',   label: 'Volume Down',             handler: (u) => mediaVolumeDown(u),       estimatedMs: 500  },
    { action: 'media_mute',          label: 'Mute/Unmute',             handler: (u) => mediaMute(u),             estimatedMs: 500  },
    { action: 'media_play_pause',    label: 'Play/Pause Media',        handler: (u) => mediaPlayPause(u),        estimatedMs: 500  },
    { action: 'media_next_track',    label: 'Next Track (System)',      handler: (u) => mediaNext(u),             estimatedMs: 500  },
    { action: 'media_prev_track',    label: 'Previous Track (System)', handler: (u) => mediaPrev(u),             estimatedMs: 500  },
    { action: 'media_stop',          label: 'Stop Media',              handler: (u) => mediaStop(u),             estimatedMs: 500  },
  ]
);
