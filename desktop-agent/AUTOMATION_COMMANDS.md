# HARVOX AI Desktop Agent v3.0 - Automation Commands

## 🚀 Overview
Desktop Agent v3.0 now supports **120+ automation commands** including the latest enhancements:
- **VS Code Automation** (11 actions)
- **Browser Tab Management** (11 actions)
- **Window Management** (5 actions)
- **Navigation Controls** (6 actions)
- **WhatsApp Automation** (3 actions)
- **YouTube Auto-Play** (enhanced)
- Plus all existing media, system, and productivity commands

---

## 🆕 NEW: VS Code Automation

| Action | Description | Voice Command Example |
|--------|-------------|----------------------|
| `vscode_create_file` | Open VS Code (with optional folder) | "Open VS Code" |
| `open_vscode` | Open VS Code | "Launch VS Code" |
| `vscode_next_tab` | Switch to next tab (Ctrl+PgDn) | "Next tab in VS Code" |
| `vscode_prev_tab` | Switch to previous tab (Ctrl+PgUp) | "Previous tab in VS Code" |
| `vscode_close_tab` | Close current tab (Ctrl+W) | "Close tab in VS Code" |
| `vscode_quick_open` | Open Quick Open (Ctrl+P) | "VS Code quick open" |
| `vscode_command_palette` | Open Command Palette (Ctrl+Shift+P) | "VS Code command palette" |
| `vscode_sidebar` | Toggle sidebar (Ctrl+B) | "Toggle VS Code sidebar" |
| `vscode_terminal` | Toggle terminal (Ctrl+`) | "Toggle VS Code terminal" |
| `vscode_format` | Format document (Ctrl+Shift+I) | "Format document in VS Code" |
| `vscode_save_all` | Save all files (Ctrl+K S) | "Save all files in VS Code" |

---

## 🆕 NEW: Browser Tab Management

| Action | Description | Shortcut | Voice Command Example |
|--------|-------------|----------|----------------------|
| `browser_new_tab` | Open new tab | Ctrl+T | "Open new tab" |
| `browser_close_tab` | Close current tab | Ctrl+W | "Close tab" |
| `browser_next_tab` | Switch to next tab | Ctrl+Tab | "Next tab" |
| `browser_prev_tab` | Switch to previous tab | Ctrl+Shift+Tab | "Previous tab" |
| `browser_reopen_tab` | Reopen closed tab | Ctrl+Shift+T | "Reopen tab" |
| `browser_fullscreen` | Toggle fullscreen | F11 | "Browser fullscreen" |
| `browser_refresh` | Refresh page | F5 | "Refresh page" |
| `browser_hard_refresh` | Hard refresh | Ctrl+F5 | "Hard refresh" |
| `browser_back` | Go back | Alt+Left | "Go back" |
| `browser_forward` | Go forward | Alt+Right | "Go forward" |
| `browser_address_bar` | Focus address bar | Ctrl+L | "Focus address bar" |

**Works with:** Chrome, Edge, Firefox, Brave

---

## 🆕 NEW: Window Management

| Action | Description | Shortcut | Voice Command Example |
|--------|-------------|----------|----------------------|
| `window_maximize` | Maximize window | Win+Ctrl+Up | "Maximize window" |
| `window_minimize` | Minimize window | Win+Ctrl+Down | "Minimize window" |
| `window_snap_left` | Snap window to left half | Win+Ctrl+Left | "Snap window left" |
| `window_snap_right` | Snap window to right half | Win+Ctrl+Right | "Snap window right" |
| `window_close` | Close window | Alt+F4 | "Close window" |

---

## 🆕 NEW: Navigation Controls

| Action | Description | Shortcut | Voice Command Example |
|--------|-------------|----------|----------------------|
| `nav_switch_app` | Switch apps | Alt+Tab | "Switch apps" |
| `nav_alt_tab` | Alt+Tab | Alt+Tab | "Alt tab" |
| `nav_alt_tab_reverse` | Reverse Alt+Tab | Alt+Shift+Tab | "Alt tab back" |
| `nav_show_desktop` | Show desktop | Win+D | "Show desktop" |
| `nav_minimize_all` | Minimize all | Win+M | "Minimize all windows" |
| `nav_task_view` | Open Task View | Win+Ctrl+D | "Open task view" |

---

## 🆕 NEW: WhatsApp Automation

| Action | Description | Args | Voice Command Example |
|--------|-------------|------|----------------------|
| `whatsapp_open` | Open WhatsApp | None | "Open WhatsApp" |
| `whatsapp_open_chat` | Open chat with contact | `[phone/contact]` | "Open WhatsApp chat with John" |
| `whatsapp_send_message` | Send WhatsApp message | `[phone, message]` | "Send WhatsApp message to +923001234567 saying hello" |

---

## 📺 YouTube Commands

| Action | Description | Args | Voice Command Example |
|--------|-------------|------|----------------------|
| `youtube_open` | Open YouTube | None | "Open YouTube" |
| `youtube_search` | Search YouTube | `[query]` | "Search YouTube for cats" |
| `youtube_play` | Play YouTube video | `[song name]` | "Play lofi hip hop on YouTube" |
| `play_music` | Play music (alias) | `[song name]` | "Play shape of you" |
| `youtube_watch_later` | Open Watch Later | None | "Open watch later" |
| `youtube_fullscreen` | Toggle fullscreen | None | "YouTube fullscreen" |
| `youtube_subtitles` | Toggle subtitles | None | "YouTube subtitles" |
| `youtube_like` | Like video | None | "Like this video" |
| `youtube_skip` | Skip ahead 10s | None | "Skip ahead" |
| `youtube_speed_up` | Increase speed | None | "Speed up video" |
| `youtube_speed_down` | Decrease speed | None | "Slow down video" |

**Enhanced:** YouTube play now uses Invidious API with 5 fallback instances for reliable auto-play!

---

## 🎵 Spotify Commands

| Action | Description | Args | Voice Command Example |
|--------|-------------|------|----------------------|
| `spotify_open` | Open Spotify | None | "Open Spotify" |
| `spotify_liked_songs` | Open Liked Songs | None | "Open liked songs" |
| `spotify_play` | Search and play song | `[song name]` | "Play relaxing music on Spotify" |
| `spotify_next` | Next track | None | "Next song" |
| `spotify_prev` | Previous track | None | "Previous song" |
| `spotify_pause` | Play/Pause | None | "Pause Spotify" |
| `spotify_shuffle` | Toggle shuffle | None | "Shuffle on" |
| `spotify_repeat` | Toggle repeat | None | "Repeat on" |

---

## 🔊 Media Controls

| Action | Description | Voice Command Example |
|--------|-------------|----------------------|
| `volume_up` | Increase volume | "Volume up" |
| `volume_down` | Decrease volume | "Volume down" |
| `mute` | Toggle mute | "Mute" |
| `media_play_pause` | Play/Pause | "Play" / "Pause" |
| `media_next_track` | Next track | "Next track" |
| `media_prev_track` | Previous track | "Previous track" |
| `media_stop` | Stop playback | "Stop" |

---

## 💻 System Commands

| Action | Description | Voice Command Example |
|--------|-------------|----------------------|
| `lock` / `system_lock` | Lock Windows | "Lock my computer" |
| `system_sleep` | Sleep mode | "Put computer to sleep" |
| `system_shutdown` | Shutdown (30s delay) | "Shutdown computer" |
| `system_restart` | Restart (30s delay) | "Restart computer" |
| `open_settings` | Open Windows Settings | "Open settings" |
| `open_task_manager` | Open Task Manager | "Open task manager" |
| `open_file_explorer` | Open File Explorer | "Open file explorer" |

---

## 🌐 Browser & Web

| Action | Description | Args | Voice Command Example |
|--------|-------------|------|----------------------|
| `open_chrome` | Open Chrome | None | "Open Chrome" |
| `open_edge` | Open Edge | None | "Open Edge" |
| `open_firefox` | Open Firefox | None | "Open Firefox" |
| `browser_open` | Open specific browser | `[browser]` | "Open Brave" |
| `open_url` | Open URL | `[url]` | "Open github.com" |
| `search_google` | Google search | `[query]` | "Search Google for Python tutorials" |
| `search_github` | GitHub search | `[query]` | "Search GitHub for react hooks" |
| `search_npm` | NPM search | `[query]` | "Search NPM for axios" |
| `open_localhost` | Open localhost | `[port]` | "Open localhost 3000" |

**Quick Site Opens:**
- `open_github`, `open_gmail`, `open_gdrive`, `open_linkedin`
- `open_chatgpt`, `open_claude`, `open_vercel`, `open_netlify`
- `open_figma`, `open_notion`, `open_trello`, `open_stackoverflow`
- `open_npmjs`, `open_mdn`, `open_tailwindcss`, `open_whatsapp_web`
- `open_fiverr`, `open_railway`
- `open_localhost_3000`, `open_localhost_5173`, `open_localhost_5000`

---

## 📱 Streaming Services

| Action | Description | Voice Command Example |
|--------|-------------|----------------------|
| `open_netflix` | Open Netflix | "Open Netflix" |
| `open_prime_video` | Open Prime Video | "Open Prime Video" |
| `open_disney_plus` | Open Disney Plus | "Open Disney Plus" |
| `open_youtube_music` | Open YouTube Music | "Open YouTube Music" |

---

## 🚀 Apps

| Action | Description | Args | Supported Apps |
|--------|-------------|------|----------------|
| `open_app` / `app_open` | Open application | `[app name]` | vscode, notepad, chrome, firefox, edge, spotify, discord, slack, teams, calculator, paint, explorer, cmd, terminal, powershell, **antigravity**, whatsapp |

**Voice Examples:**
- "Open VS Code"
- "Open Antigravity"
- "Open calculator"
- "Open Discord"

---

## 🎯 Productivity

| Action | Description | Voice Command Example |
|--------|-------------|----------------------|
| `focus_mode_enable` | Close distracting apps | "Enable focus mode" |
| `study_mode_enable` | Open VS Code, close distractions | "Enable study mode" |
| `pomodoro_start` | Open Pomodoro timer | "Start pomodoro" |

---

## 📝 Usage in Code

```javascript
// Example: VS Code automation
await fetch('http://127.0.0.1:8765/execute', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    step: {
      action: 'vscode_next_tab',
      args: []
    }
  })
});

// Example: Browser tab management
await fetch('http://127.0.0.1:8765/execute', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    step: {
      action: 'browser_new_tab',
      args: []
    }
  })
});

// Example: Window snapping
await fetch('http://127.0.0.1:8765/execute', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    step: {
      action: 'window_snap_left',
      args: []
    }
  })
});
```

---

## 🔐 Security

- Agent runs **only on localhost** (127.0.0.1)
- Requires **Bearer token authentication**
- Only **whitelisted apps** can be launched
- **CORS protection** with allowed origins

---

## 🎤 Voice Command Tips

1. **Be specific with app names:** "Open VS Code" (not just "open code")
2. **Use action keywords:** "Next tab", "Close window", "Snap left"
3. **Combine commands:** "Open Chrome and navigate to GitHub"
4. **For YouTube:** "Play [song name] on YouTube"
5. **For WhatsApp:** Include phone number with country code

---

## 🐛 Troubleshooting

**Action not working?**
- Check if the app is installed
- Ensure Desktop Agent is running
- Check console for error messages
- Verify app is in the allowed list

**VS Code shortcuts not working?**
- Make sure VS Code is in focus
- Try clicking on VS Code window first

**Browser actions not responding?**
- Ensure browser is open
- Supported: Chrome, Edge, Firefox, Brave

---

## 📊 Statistics

- **Total Commands:** 120+
- **New in v3.0:** 36 commands
- **Categories:** 11
- **Supported Apps:** 20+
- **Supported Browsers:** 4

---

## 🚀 What's New in v3.0

### VS Code Integration
Complete keyboard automation for VS Code including tab navigation, terminal toggle, formatting, and command palette access.

### Browser Mastery
Full browser tab management with support for 11 different tab operations across Chrome, Edge, Firefox, and Brave.

### Window Control
Snap windows, maximize, minimize, and close with simple voice commands. Perfect for multi-monitor setups.

### Enhanced Navigation
Alt-Tab automation, Task View, Show Desktop, and more system-wide navigation shortcuts.

### WhatsApp Direct Send
Send WhatsApp messages directly from voice commands with phone number and message content.

### YouTube Auto-Play Enhancement
Improved reliability with 5 Invidious API instances and better error handling for YouTube playback.

---

© Haris Khan — HARVOX AI Desktop Agent v3.0 — All Rights Reserved
