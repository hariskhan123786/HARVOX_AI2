# HARVOX Desktop Agent v2.0

The Desktop Agent is a **locally-running bridge** between HARVOX AI (web app) and your Windows PC.

Because HARVOX runs on Vercel (a serverless cloud), it cannot directly run PowerShell, open Chrome, or control Spotify on your machine. The Desktop Agent solves this by:

1. Running silently on `127.0.0.1:8765` (localhost only — never exposed to the internet)
2. Receiving encrypted action requests from your browser
3. Executing them on your Windows machine via PowerShell / `exec`

---

## 🚀 How to Start

**Double-click `start-agent.cmd`** — or run in a terminal:

```bat
node agent.mjs
```

Keep the terminal window open while using HARVOX. Close it to stop automation.

---

## ✅ Supported Actions (60+)

### 🎵 Media
- `spotify_play`, `spotify_next`, `spotify_prev`, `spotify_pause`, `spotify_shuffle`, `spotify_repeat`, `spotify_open`
- `youtube_play` ← **uses Invidious API to find and directly open the correct video**
- `youtube_search`, `youtube_open`, `youtube_fullscreen`, `youtube_subtitles`, `youtube_like`, `youtube_skip`
- `media_volume_up`, `media_volume_down`, `media_mute`, `media_play_pause`, `media_next_track`, `media_prev_track`
- `open_netflix`, `open_prime_video`, `open_disney_plus`, `open_youtube_music`

### 🌐 Browser
- `open_chrome`, `open_edge`, `open_firefox`, `browser_navigate`
- `search_google`, `search_github`, `search_npm`
- `open_github`, `open_gmail`, `open_gdrive`, `open_linkedin`, `open_chatgpt`, `open_claude`, `open_vercel`, `open_figma`, `open_notion`, `open_trello`, `open_stackoverflow`, `open_npmjs`, `open_mdn`, `open_whatsapp_web`
- `open_localhost` (with custom port)

### 🖥️ System
- `system_lock`, `system_sleep`, `system_shutdown`, `system_restart`
- `open_settings`, `open_task_manager`, `open_file_explorer`
- `media_mute`, `volume_up`, `volume_down`

### 📱 Apps
- `app_open` with args: `vscode`, `notepad`, `chrome`, `firefox`, `edge`, `spotify`, `discord`, `slack`, `teams`, `calculator`, `paint`, `explorer`, `terminal`, `cmd`, `powershell`

### 🎯 Productivity
- `focus_mode_enable` — closes distracting apps (Chrome, Discord, Slack)
- `study_mode_enable` — opens VS Code, closes social apps
- `pomodoro_start` — opens PomodoroFocus timer in browser

---

## 🔒 Security

- Listens **only on `127.0.0.1`** — never reachable from the internet
- Only accepts requests from known HARVOX origins (`harvox-ai-2.vercel.app`, `localhost:5173`)
- Token verified against HARVOX API before any action runs

---

## ⚙️ Configuration

Set these environment variables before running if needed:

| Variable | Default | Description |
|----------|---------|-------------|
| `HARVOX_AGENT_PORT` | `8765` | Port to listen on |
| `HARVOX_API_URL` | `https://harvox-ai-2.vercel.app/api` | API for token verification |
