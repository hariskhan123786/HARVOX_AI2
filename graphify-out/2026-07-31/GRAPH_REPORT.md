# Graph Report - harvox_ai  (2026-07-31)

## Corpus Check
- 213 files · ~278,860 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1357 nodes · 2621 edges · 92 communities (75 shown, 17 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 68 edges (avg confidence: 0.59)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `81f760d6`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_aiController.js|aiController.js]]
- [[_COMMUNITY_Landing.jsx|Landing.jsx]]
- [[_COMMUNITY_dependencies|dependencies]]
- [[_COMMUNITY_mediaModule.js|mediaModule.js]]
- [[_COMMUNITY_automationService.js|automationService.js]]
- [[_COMMUNITY_NeonButton.jsx|NeonButton.jsx]]
- [[_COMMUNITY_Settings.jsx|Settings.jsx]]
- [[_COMMUNITY_WorkspaceOS.jsx|WorkspaceOS.jsx]]
- [[_COMMUNITY_aiProviderManager.js|aiProviderManager.js]]
- [[_COMMUNITY_App.jsx|App.jsx]]
- [[_COMMUNITY_dependencies|dependencies]]
- [[_COMMUNITY_productivityModule.js|productivityModule.js]]
- [[_COMMUNITY_automationController.js|automationController.js]]
- [[_COMMUNITY_VoiceAssistant.jsx|VoiceAssistant.jsx]]
- [[_COMMUNITY_package.json|package.json]]
- [[_COMMUNITY_useAuthStore|useAuthStore]]
- [[_COMMUNITY_AdminDashboard.jsx|AdminDashboard.jsx]]
- [[_COMMUNITY_browserModule.js|browserModule.js]]
- [[_COMMUNITY_logActivity|logActivity]]
- [[_COMMUNITY_automationRegistry.js|automationRegistry.js]]
- [[_COMMUNITY_auth.js|auth.js]]
- [[_COMMUNITY_server.js|server.js]]
- [[_COMMUNITY_Chat.jsx|Chat.jsx]]
- [[_COMMUNITY_cn|cn]]
- [[_COMMUNITY_api.js|api.js]]
- [[_COMMUNITY_fileModule.js|fileModule.js]]
- [[_COMMUNITY_db.js|db.js]]
- [[_COMMUNITY_Dashboard.jsx|Dashboard.jsx]]
- [[_COMMUNITY_fsController.js|fsController.js]]
- [[_COMMUNITY_ChatMessage.jsx|ChatMessage.jsx]]
- [[_COMMUNITY_Chat.jsx|Chat.jsx]]
- [[_COMMUNITY_deploy|deploy]]
- [[_COMMUNITY_authController.js|authController.js]]
- [[_COMMUNITY_RightPanel.jsx|RightPanel.jsx]]
- [[_COMMUNITY_UserAnalytics.js|UserAnalytics.js]]
- [[_COMMUNITY_settingsRoutes.js|settingsRoutes.js]]
- [[_COMMUNITY_memoryService.js|memoryService.js]]
- [[_COMMUNITY_Client Entry Point|Client Entry Point]]
- [[_COMMUNITY_ChatMessage.jsx|ChatMessage.jsx]]
- [[_COMMUNITY_geminiModels.js|geminiModels.js]]
- [[_COMMUNITY_Gamification Award Badges|Gamification Award Badges]]
- [[_COMMUNITY_Creator Portrait (HK)|Creator Portrait (HK)]]
- [[_COMMUNITY_3D Creation Studio Workspace|3D Creation Studio Workspace]]
- [[_COMMUNITY_Chat.jsx|Chat.jsx]]
- [[_COMMUNITY_studyModule.js|studyModule.js]]
- [[_COMMUNITY_Register.jsx|Register.jsx]]
- [[_COMMUNITY_CommandPalette.jsx|CommandPalette.jsx]]
- [[_COMMUNITY_vercel.json|vercel.json]]
- [[_COMMUNITY_subscription.js|subscription.js]]
- [[_COMMUNITY_index.js|index.js]]
- [[_COMMUNITY_intentEngine.js|intentEngine.js]]
- [[_COMMUNITY_cn|cn]]
- [[_COMMUNITY_PerformanceProvider.jsx|PerformanceProvider.jsx]]
- [[_COMMUNITY_card.jsx|card.jsx]]
- [[_COMMUNITY_useThemeStore.js|useThemeStore.js]]
- [[_COMMUNITY_Profile.jsx|Profile.jsx]]
- [[_COMMUNITY_BrowserSpeechProvider|BrowserSpeechProvider]]
- [[_COMMUNITY_agent.mjs|agent.mjs]]
- [[_COMMUNITY_voiceController.js|voiceController.js]]
- [[_COMMUNITY_ModeSelector.jsx|ModeSelector.jsx]]
- [[_COMMUNITY_CVoiceProvider|CVoiceProvider]]
- [[_COMMUNITY_EdgeTTSProvider|EdgeTTSProvider]]
- [[_COMMUNITY_VoiceProvider|VoiceProvider]]
- [[_COMMUNITY_LanguageDetector.js|LanguageDetector.js]]
- [[_COMMUNITY_paymentRoutes.js|paymentRoutes.js]]
- [[_COMMUNITY_PtyManager|PtyManager]]
- [[_COMMUNITY_AudioCache|AudioCache]]
- [[_COMMUNITY_safe_path|safe_path]]
- [[_COMMUNITY_detector.py|detector.py]]
- [[_COMMUNITY_usePerformanceMode|usePerformanceMode]]
- [[_COMMUNITY_postChatSummarizer.js|postChatSummarizer.js]]
- [[_COMMUNITY_AudioCacheEntry|AudioCacheEntry]]

## God Nodes (most connected - your core abstractions)
1. `logActivity()` - 177 edges
2. `runPS()` - 80 edges
3. `useAuthStore` - 37 edges
4. `VoiceConfigStore` - 26 edges
5. `getAIOptions()` - 25 edges
6. `NeonButton()` - 21 edges
7. `VoiceProviderManager` - 21 edges
8. `GlassCard()` - 20 edges
9. `execCmd()` - 19 edges
10. `VoiceProvider` - 18 edges

## Surprising Connections (you probably didn't know these)
- `BrainMemorySettings()` --calls--> `showToast()`  [INFERRED]
  client/src/components/settings/BrainMemorySettings.jsx → server/services/automation/modules/productivityModule.js
- `Settings()` --calls--> `showToast()`  [INFERRED]
  client/src/pages/app/Settings.jsx → server/services/automation/modules/productivityModule.js
- `Login()` --calls--> `login()`  [INFERRED]
  client/src/pages/auth/Login.jsx → server/controllers/authController.js
- `Register()` --calls--> `register()`  [INFERRED]
  client/src/pages/auth/Register.jsx → server/controllers/authController.js
- `handler()` --calls--> `app`  [INFERRED]
  api/[...path].js → server/server.js

## Import Cycles
- 3-file cycle: `server/controllers/ai/chatController.js -> server/services/postChatSummarizer.js -> server/controllers/aiController.js -> server/controllers/ai/chatController.js`
- 4-file cycle: `server/controllers/ai/chatController.js -> server/services/postChatSummarizer.js -> server/controllers/aiController.js -> server/controllers/ai/projectController.js -> server/controllers/ai/chatController.js`
- 4-file cycle: `server/controllers/ai/chatController.js -> server/services/postChatSummarizer.js -> server/controllers/aiController.js -> server/controllers/ai/fileAnalysisController.js -> server/controllers/ai/chatController.js`
- 4-file cycle: `server/controllers/ai/chatController.js -> server/services/postChatSummarizer.js -> server/controllers/aiController.js -> server/controllers/ai/codeController.js -> server/controllers/ai/chatController.js`
- 5-file cycle: `server/controllers/ai/chatController.js -> server/services/postChatSummarizer.js -> server/controllers/aiController.js -> server/controllers/ai/voiceController.js -> server/services/voiceService.js -> server/controllers/ai/chatController.js`

## Hyperedges (group relationships)
- **Harvox AI Technology Stack** — docker_compose_harvox_app, mongodb, groq_api, gemini_api [EXTRACTED 1.00]
- **Continuous Integration Pipeline** — github_workflows_ci_yml, docker_compose_yml, client_index_html [INFERRED 0.85]

## Communities (92 total, 17 thin omitted)

### Community 0 - "aiController.js"
Cohesion: 0.15
Nodes (9): DashboardLayout(), RightPanel(), NAV_GROUPS, NavItem(), Sidebar(), HologramCard(), Spotlight(), useSidebarStore (+1 more)

### Community 1 - "Landing.jsx"
Cohesion: 0.07
Nodes (21): Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle, FOMOBadge(), HologramOrb() (+13 more)

### Community 2 - "dependencies"
Cohesion: 0.04
Nodes (46): dependencies, axios, clsx, date-fns, file-saver, framer-motion, html2canvas, jspdf (+38 more)

### Community 3 - "mediaModule.js"
Cohesion: 0.10
Nodes (22): hasAction(), _modules, registerModule(), _registry, deployRailway(), deployVercel(), __dirname, getEnvVars() (+14 more)

### Community 4 - "automationService.js"
Cohesion: 0.09
Nodes (28): APP_MATRIX, backupProject(), callPythonEngine(), clickElement(), createComponent(), createFile(), createProject(), __dirname (+20 more)

### Community 5 - "NeonButton.jsx"
Cohesion: 0.15
Nodes (9): GlassCard(), NeonButton(), PremiumLockOverlay(), languages, PRESETS, COMPLEXITY, STACKS, aiAPI (+1 more)

### Community 6 - "Settings.jsx"
Cohesion: 0.10
Nodes (23): CATEGORIES, ModelSelector(), PROVIDER_BADGES, SPEED_COLORS, AI_PROVIDER_META, AI_PROVIDERS, ALL_MODELS, CEREBRAS_MODELS (+15 more)

### Community 7 - "WorkspaceOS.jsx"
Cohesion: 0.11
Nodes (13): @xterm/xterm, actions, TerminalPanel(), XTerm(), Holographic3DCard(), FileExplorer(), getFileColor(), getFileIcon() (+5 more)

### Community 8 - "aiProviderManager.js"
Cohesion: 0.09
Nodes (8): calculateCost(), chat(), estimateTokens(), FAILOVER_CHAIN, MODEL_PRICING, providers, routePrompt(), saveLog()

### Community 9 - "App.jsx"
Cohesion: 0.07
Nodes (26): About, AdminDashboard, AdminPayments, AdminSettings, AdminUsers, AutomationCenter, Billing, BrainCore (+18 more)

### Community 10 - "dependencies"
Cohesion: 0.08
Nodes (23): dependencies, axios, cors, dotenv, express, express-rate-limit, @google/generative-ai, groq-sdk (+15 more)

### Community 11 - "productivityModule.js"
Cohesion: 0.13
Nodes (19): createReminder(), createTask(), __dirname, DISTRACTING_APPS, enableFocusMode(), enableMeetingMode(), enableStudyMode(), generateDailyPlan() (+11 more)

### Community 12 - "automationController.js"
Cohesion: 0.05
Nodes (72): createTask(), deleteTask(), detectAndPlan(), executeBuiltinWorkflow(), executeCustomWorkflow(), executePlan(), executeStep(), getActiveRuns() (+64 more)

### Community 13 - "VoiceAssistant.jsx"
Cohesion: 0.14
Nodes (8): VoiceOrb(), AGENT_BADGES, AI_MODELS, BSCS_SUBJECTS, detectModelSwitch(), ELEVENLABS_IDS, ELEVENLABS_VOICES, VoiceAssistant()

### Community 14 - "package.json"
Cohesion: 0.06
Nodes (35): harvox-app Service, Docker Compose Configuration, Gemini AI API, Groq AI API, MongoDB, dependencies, axios, cors (+27 more)

### Community 15 - "useAuthStore"
Cohesion: 0.11
Nodes (13): jszip, AdminRoute(), ProtectedRoute(), AdminLayout(), ROUTE_META, TopBar(), AutomationCenter(), callDesktopAgent() (+5 more)

### Community 17 - "browserModule.js"
Cohesion: 0.10
Nodes (28): activateWindow(), browserBookmark(), browserCloseTab(), browserDownloads(), browserNavigate(), browserNewTab(), browserNextTab(), browserReopenTab() (+20 more)

### Community 18 - "logActivity"
Cohesion: 0.10
Nodes (31): __dirname, generateApiRoute(), generateReadme(), gitAdd(), gitCommit(), gitInit(), gitPush(), gitStatus() (+23 more)

### Community 19 - "automationRegistry.js"
Cohesion: 0.08
Nodes (29): _check_playwright(), get_browser_context(), open_url_in_default_browser(), play_navigate_to(), play_new_tab(), play_switch_tab(), Check if Playwright browsers are installed without crashing., Returns a Playwright browser context. Raises a descriptive error if Playwright (+21 more)

### Community 20 - "auth.js"
Cohesion: 0.14
Nodes (17): emptyRecycleBin(), getClipboard(), getNetworkStatus(), getSystemInfo(), lockComputer(), logoutUser(), muteVolume(), restartComputer() (+9 more)

### Community 21 - "server.js"
Cohesion: 0.06
Nodes (40): handler(), connectDB(), getDBHealth(), ensurePublicRecords(), forgotPassword(), getMe(), login(), register() (+32 more)

### Community 22 - "Chat.jsx"
Cohesion: 0.15
Nodes (3): ChatErrorBoundary, MODES, ModeSelector()

### Community 23 - "cn"
Cohesion: 0.08
Nodes (24): BaseModel, FastAPI, close_playwright_browser(), execute_step(), Displays a native Windows MessageBox warning and prompts the user to confirm., Executes a single step and handles confirmation, logging, and performance metric, request_user_confirmation(), log_command() (+16 more)

### Community 24 - "api.js"
Cohesion: 0.11
Nodes (36): mediaMute(), mediaNext(), mediaPlayPause(), mediaPrev(), mediaStop(), mediaVolumeDown(), mediaVolumeUp(), openDisneyPlus() (+28 more)

### Community 25 - "fileModule.js"
Cohesion: 0.26
Nodes (14): compressFolder(), createFile(), createFolder(), deleteFile(), __dirname, extractZip(), findFile(), moveFile() (+6 more)

### Community 26 - "db.js"
Cohesion: 0.29
Nodes (5): App(), ACCENT_PALETTES, FONT_FAMILIES, FONT_SIZES, useThemeStore

### Community 27 - "Dashboard.jsx"
Cohesion: 0.20
Nodes (4): PromptBar(), Dashboard(), QUICK_COMMANDS, SUBJECT_META

### Community 28 - "fsController.js"
Cohesion: 0.27
Nodes (10): buildTree(), createFileOrFolder(), __dirname, ensureWorkspace(), __filename, getFileContent(), getFileTree(), getSafePath() (+2 more)

### Community 29 - "ChatMessage.jsx"
Cohesion: 0.26
Nodes (14): chatAI(), getAIMetrics(), getAIOptions(), debugCode(), explainCode(), generateCode(), analyzeFile(), generateProject() (+6 more)

### Community 30 - "Chat.jsx"
Cohesion: 0.15
Nodes (5): TaskPlanWidget(), C, Chat(), useMediaQuery(), chatAPI

### Community 31 - "deploy"
Cohesion: 0.20
Nodes (9): build, builder, dockerfilePath, deploy, healthcheckPath, healthcheckTimeout, restartPolicyMaxRetries, restartPolicyType (+1 more)

### Community 32 - "authController.js"
Cohesion: 0.12
Nodes (29): autoTagMemory(), clearMemories(), createMemory(), deleteMemory(), detectConflicts(), exportMemories(), getBrainAnalytics(), getIndexerStatusController() (+21 more)

### Community 33 - "RightPanel.jsx"
Cohesion: 0.18
Nodes (5): PERSONALITIES, PROMPTS, operatorMemories, ACTION_MAP, FIELD_MAP

### Community 34 - "UserAnalytics.js"
Cohesion: 0.60
Nodes (5): createProject(), getProjectDetails(), getProjects(), mapProject(), updateProjectLayout()

### Community 37 - "memoryService.js"
Cohesion: 0.33
Nodes (4): CyberGrid(), GradientBlobs(), HologramWaves(), Starfield3D()

### Community 38 - "Client Entry Point"
Cohesion: 0.40
Nodes (5): Client Entry Point, AI Chat 3D Illustration, Holographic Brain AI Visualization, Main React Entry, CI Workflow

### Community 39 - "ChatMessage.jsx"
Cohesion: 0.11
Nodes (11): AGENT_BADGES, BrainMemorySettings(), Billing(), Profile(), api, authAPI, automationAPI, memoryAPI (+3 more)

### Community 48 - "Chat.jsx"
Cohesion: 0.33
Nodes (5): buildCommand, framework, installCommand, outputDirectory, rewrites

### Community 49 - "studyModule.js"
Cohesion: 0.29
Nodes (6): __dirname, generateFlashcards(), generateMCQs(), generateNotes(), logStudy(), WORKSPACE_DIR

### Community 50 - "Register.jsx"
Cohesion: 0.16
Nodes (23): altTab(), altTabReverse(), browserBack(), browserCloseTab(), browserFocusAddressBar(), browserForward(), browserFullscreen(), browserHardRefresh() (+15 more)

### Community 51 - "CommandPalette.jsx"
Cohesion: 0.60
Nodes (5): run(), testCerebras(), testGemini(), testGroq(), testOpenRouter()

### Community 52 - "vercel.json"
Cohesion: 0.29
Nodes (6): buildCommand, installCommand, outputDirectory, rewrites, $schema, version

### Community 53 - "subscription.js"
Cohesion: 0.40
Nodes (4): react, automationActions, CommandPalette(), navigationActions

### Community 54 - "index.js"
Cohesion: 0.26
Nodes (11): CVOICE_VOICES, EDGE_VOICES, ELEVENLABS_VOICES, DEFAULT_CONFIG, getVoiceConfigStore(), ProviderErrorType, ProviderStatus, ProviderType (+3 more)

### Community 56 - "cn"
Cohesion: 0.14
Nodes (14): click_mouse(), double_click(), drag_mouse(), get_mouse_position(), move_mouse(), Clicks at (x, y) or at the current cursor position if coordinates are None., Double-clicks at (x, y) or at the current cursor position., Right-clicks at (x, y) or at the current cursor position. (+6 more)

### Community 63 - "PerformanceProvider.jsx"
Cohesion: 0.52
Nodes (6): getInitialProfile(), getManualProfile(), getStoredGraphicsMode(), GRAPHICS_MODES, PerformanceContext, PerformanceProvider()

### Community 64 - "card.jsx"
Cohesion: 0.16
Nodes (12): Captures screen and uses Windows 10/11 built-in OCR via PowerShell., Crop specific region of screen and perform native Windows OCR on it., read_selected_area(), read_text_from_screen(), capture_region(), capture_screenshot(), get_pixel_color(), get_screen_size() (+4 more)

### Community 68 - "agent.mjs"
Cohesion: 0.39
Nodes (7): execute(), openUrl(), ORIGINS, PORT, run(), runPS(), shell()

### Community 69 - "voiceController.js"
Cohesion: 0.42
Nodes (7): speakText(), transcribeSpeech(), CVOICE_VOICE_CATALOG, ELEVENLABS_VOICE_CATALOG, synthesizeSpeech(), synthesizeSpeechCVoice(), transcribeAudio()

### Community 74 - "LanguageDetector.js"
Cohesion: 0.29
Nodes (7): detectLanguage(), detectLanguageAndSelectVoice(), isEnglish(), isHindi(), isUrdu(), LANGUAGE_CODES, LANGUAGE_PATTERNS

### Community 75 - "paymentRoutes.js"
Cohesion: 0.24
Nodes (5): storage, upload, uploadAudio, router, uploadToSupabase()

### Community 78 - "safe_path"
Cohesion: 0.48
Nodes (6): create_file(), delete_file(), make_directory(), Ensures the path remains within the WORKSPACE_DIR boundary., read_file(), safe_path()

### Community 79 - "detector.py"
Cohesion: 0.29
Nodes (6): detect_regions(), find_image_on_screen(), Detects high-contrast rectangular regions on the screen using edge detection., Saves a debug screenshot with detected regions highlighted in red boxes., Searches for a template image on the current screen using OpenCV template matchi, save_debug_screenshot_with_boxes()

### Community 80 - "usePerformanceMode"
Cohesion: 0.40
Nodes (5): AdaptiveCustomCursor(), BackgroundEffects(), MODE_LABELS, PerformanceMonitor(), usePerformanceMode()

### Community 81 - "postChatSummarizer.js"
Cohesion: 0.40
Nodes (3): chat(), getClient(), summarizeConversationAndExtractMemories()

## Knowledge Gaps
- **238 isolated node(s):** `name`, `private`, `version`, `type`, `dev` (+233 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **17 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `showToast()` connect `productivityModule.js` to `Register.jsx`, `Settings.jsx`, `ChatMessage.jsx`?**
  _High betweenness centrality (0.252) - this node is a cross-community bridge._
- **Why does `Settings()` connect `Settings.jsx` to `ChatMessage.jsx`, `productivityModule.js`, `useAuthStore`, `usePerformanceMode`, `db.js`?**
  _High betweenness centrality (0.229) - this node is a cross-community bridge._
- **Why does `useAuthStore` connect `useAuthStore` to `aiController.js`, `NeonButton.jsx`, `Settings.jsx`, `ChatMessage.jsx`, `App.jsx`, `VoiceAssistant.jsx`, `Chat.jsx`, `db.js`, `Dashboard.jsx`?**
  _High betweenness centrality (0.146) - this node is a cross-community bridge._
- **What connects `name`, `private`, `version` to the rest of the system?**
  _264 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Landing.jsx` be split into smaller, more focused modules?**
  _Cohesion score 0.06722689075630252 - nodes in this community are weakly interconnected._
- **Should `dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.0425531914893617 - nodes in this community are weakly interconnected._
- **Should `mediaModule.js` be split into smaller, more focused modules?**
  _Cohesion score 0.0960591133004926 - nodes in this community are weakly interconnected._