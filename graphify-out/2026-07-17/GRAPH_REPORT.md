# Graph Report - harvox_ai  (2026-07-16)

## Corpus Check
- 161 files · ~246,815 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 934 nodes · 1887 edges · 63 communities (54 shown, 9 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 56 edges (avg confidence: 0.59)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `5dc6eccb`
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
- [[_COMMUNITY_Login.jsx|Login.jsx]]
- [[_COMMUNITY_Client Entry Point|Client Entry Point]]
- [[_COMMUNITY_projectController.js|projectController.js]]
- [[_COMMUNITY_geminiModels.js|geminiModels.js]]
- [[_COMMUNITY_Gamification Award Badges|Gamification Award Badges]]
- [[_COMMUNITY_Creator Portrait (HK)|Creator Portrait (HK)]]
- [[_COMMUNITY_3D Creation Studio Workspace|3D Creation Studio Workspace]]
- [[_COMMUNITY_Chat.jsx|Chat.jsx]]
- [[_COMMUNITY_voiceController.js|voiceController.js]]
- [[_COMMUNITY_ChatMessage.jsx|ChatMessage.jsx]]
- [[_COMMUNITY_CommandPalette.jsx|CommandPalette.jsx]]
- [[_COMMUNITY_vercel.json|vercel.json]]
- [[_COMMUNITY_subscription.js|subscription.js]]
- [[_COMMUNITY_geminiService.js|geminiService.js]]
- [[_COMMUNITY_cerebrasProvider.js|cerebrasProvider.js]]
- [[_COMMUNITY_CentralEventBus|CentralEventBus]]

## God Nodes (most connected - your core abstractions)
1. `logActivity()` - 162 edges
2. `runPS()` - 56 edges
3. `useAuthStore` - 35 edges
4. `getAIOptions()` - 23 edges
5. `NeonButton()` - 21 edges
6. `GlassCard()` - 19 edges
7. `execCmd()` - 19 edges
8. `cn()` - 17 edges
9. `protect()` - 13 edges
10. `registerModule()` - 12 edges

## Surprising Connections (you probably didn't know these)
- `Settings()` --calls--> `showToast()`  [INFERRED]
  client/src/pages/app/Settings.jsx → server/services/automation/modules/productivityModule.js
- `Login()` --calls--> `login()`  [INFERRED]
  client/src/pages/auth/Login.jsx → server/controllers/authController.js
- `Register()` --calls--> `register()`  [INFERRED]
  client/src/pages/auth/Register.jsx → server/controllers/authController.js
- `BrainMemorySettings()` --calls--> `showToast()`  [INFERRED]
  client/src/components/settings/BrainMemorySettings.jsx → server/services/automation/modules/productivityModule.js
- `XTerm()` --calls--> `io`  [INFERRED]
  client/src/components/terminal/XTerm.jsx → server/server.js

## Import Cycles
- 3-file cycle: `server/services/automation/modules/fileModule.js -> server/services/rollbackService.js -> server/services/automationService.js -> server/services/automation/modules/fileModule.js`

## Hyperedges (group relationships)
- **Harvox AI Technology Stack** — docker_compose_harvox_app, mongodb, groq_api, gemini_api [EXTRACTED 1.00]
- **Continuous Integration Pipeline** — github_workflows_ci_yml, docker_compose_yml, client_index_html [INFERRED 0.85]

## Communities (63 total, 9 thin omitted)

### Community 0 - "aiController.js"
Cohesion: 0.30
Nodes (12): autoTagMemory(), createMemory(), deleteMemory(), detectConflicts(), exportMemories(), getMemories(), mapMemory(), summarizeIdentity() (+4 more)

### Community 1 - "Landing.jsx"
Cohesion: 0.06
Nodes (25): BackgroundEffects(), CyberGrid(), GradientBlobs(), HologramWaves(), Starfield3D(), Card, CardContent, CardDescription (+17 more)

### Community 2 - "dependencies"
Cohesion: 0.04
Nodes (48): dependencies, axios, clsx, date-fns, file-saver, framer-motion, html2canvas, jspdf (+40 more)

### Community 3 - "mediaModule.js"
Cohesion: 0.32
Nodes (7): deployRailway(), deployVercel(), __dirname, getEnvVars(), isCmdAvailable(), setEnvVar(), WORKSPACE_DIR

### Community 4 - "automationService.js"
Cohesion: 0.09
Nodes (26): APP_MATRIX, backupProject(), clickElement(), createComponent(), createFile(), createProject(), __dirname, draftEmail() (+18 more)

### Community 5 - "NeonButton.jsx"
Cohesion: 0.15
Nodes (9): GlassCard(), NeonButton(), PremiumLockOverlay(), ICON_MAP, PRESETS, COMPLEXITY, STACKS, aiAPI (+1 more)

### Community 6 - "Settings.jsx"
Cohesion: 0.10
Nodes (22): CATEGORIES, ModelSelector(), PROVIDER_BADGES, SPEED_COLORS, AI_PROVIDER_META, AI_PROVIDERS, ALL_MODELS, CEREBRAS_MODELS (+14 more)

### Community 7 - "WorkspaceOS.jsx"
Cohesion: 0.11
Nodes (13): @xterm/xterm, actions, TerminalPanel(), XTerm(), Holographic3DCard(), FileExplorer(), getFileColor(), getFileIcon() (+5 more)

### Community 8 - "aiProviderManager.js"
Cohesion: 0.09
Nodes (8): calculateCost(), chat(), estimateTokens(), FAILOVER_CHAIN, MODEL_PRICING, providers, routePrompt(), saveLog()

### Community 9 - "App.jsx"
Cohesion: 0.07
Nodes (27): About, AdminDashboard, AdminPayments, AdminSettings, AdminUsers, App(), AutomationCenter, Billing (+19 more)

### Community 10 - "dependencies"
Cohesion: 0.08
Nodes (23): dependencies, axios, cors, dotenv, express, express-rate-limit, @google/generative-ai, groq-sdk (+15 more)

### Community 11 - "productivityModule.js"
Cohesion: 0.12
Nodes (20): BrainMemorySettings(), createReminder(), createTask(), __dirname, DISTRACTING_APPS, enableFocusMode(), enableMeetingMode(), enableStudyMode() (+12 more)

### Community 12 - "automationController.js"
Cohesion: 0.05
Nodes (73): createTask(), deleteTask(), detectAndPlan(), executeBuiltinWorkflow(), executeCustomWorkflow(), executePlan(), executeStep(), getActiveRuns() (+65 more)

### Community 13 - "VoiceAssistant.jsx"
Cohesion: 0.09
Nodes (9): VoiceOrb(), AGENT_BADGES, AI_MODELS, BSCS_SUBJECTS, detectModelSwitch(), ELEVENLABS_IDS, ELEVENLABS_VOICES, VoiceAssistant() (+1 more)

### Community 14 - "package.json"
Cohesion: 0.07
Nodes (26): harvox-app Service, Docker Compose Configuration, Gemini AI API, Groq AI API, MongoDB, dependencies, @google/generative-ai, mongodb (+18 more)

### Community 15 - "useAuthStore"
Cohesion: 0.16
Nodes (6): ProtectedRoute(), RightPanel(), ROUTE_META, TopBar(), Login(), useAuthStore

### Community 17 - "browserModule.js"
Cohesion: 0.16
Nodes (21): activateWindow(), browserBookmark(), browserCloseTab(), browserDownloads(), browserNavigate(), browserNewTab(), browserNextTab(), browserReopenTab() (+13 more)

### Community 18 - "logActivity"
Cohesion: 0.14
Nodes (20): __dirname, generateApiRoute(), generateReadme(), gitAdd(), gitCommit(), gitInit(), gitPush(), gitStatus() (+12 more)

### Community 19 - "automationRegistry.js"
Cohesion: 0.24
Nodes (9): DashboardLayout(), NAV_GROUPS, NavItem(), Sidebar(), HologramCard(), Spotlight(), Chat(), useSidebarStore (+1 more)

### Community 20 - "auth.js"
Cohesion: 0.17
Nodes (9): Billing(), Profile(), api, authAPI, memoryAPI, paymentsAPI, profileAPI, settingsAPI (+1 more)

### Community 21 - "server.js"
Cohesion: 0.06
Nodes (37): connectDB(), getDBHealth(), forgotPassword(), getMe(), login(), register(), sendUser(), updateProfile() (+29 more)

### Community 22 - "Chat.jsx"
Cohesion: 0.15
Nodes (3): ChatErrorBoundary, MODES, ModeSelector()

### Community 23 - "cn"
Cohesion: 0.43
Nodes (7): composeEmail(), openGmail(), openGmailCompose(), openGmailInbox(), openOutlook(), openUrl(), searchGmail()

### Community 24 - "api.js"
Cohesion: 0.13
Nodes (33): openDisneyPlus(), openNetflix(), openPrimeVideo(), openYouTubeMusic(), spotifyLikedSongs(), spotifyOpen(), youtubeOpen(), youtubePlay() (+25 more)

### Community 25 - "fileModule.js"
Cohesion: 0.26
Nodes (14): compressFolder(), createFile(), createFolder(), deleteFile(), __dirname, extractZip(), findFile(), moveFile() (+6 more)

### Community 26 - "db.js"
Cohesion: 0.20
Nodes (8): registerModule(), openUnreadChats(), openWhatsApp(), openWhatsAppChat(), searchWhatsAppContact(), sendWhatsAppMessage(), __dirname, TEMP_DIR

### Community 27 - "Dashboard.jsx"
Cohesion: 0.18
Nodes (5): PromptBar(), Dashboard(), QUICK_COMMANDS, SUBJECT_META, chatAPI

### Community 28 - "fsController.js"
Cohesion: 0.27
Nodes (10): buildTree(), createFileOrFolder(), __dirname, ensureWorkspace(), __filename, getFileContent(), getFileTree(), getSafePath() (+2 more)

### Community 29 - "ChatMessage.jsx"
Cohesion: 0.17
Nodes (21): mediaMute(), mediaNext(), mediaPlayPause(), mediaPrev(), mediaStop(), mediaVolumeDown(), mediaVolumeUp(), spotifyNext() (+13 more)

### Community 30 - "Chat.jsx"
Cohesion: 0.25
Nodes (3): C, Chat(), useMediaQuery()

### Community 31 - "deploy"
Cohesion: 0.20
Nodes (9): build, builder, dockerfilePath, deploy, healthcheckPath, healthcheckTimeout, restartPolicyMaxRetries, restartPolicyType (+1 more)

### Community 33 - "RightPanel.jsx"
Cohesion: 0.29
Nodes (13): PERSONALITIES, PROMPTS, chatAI(), getAIMetrics(), getAIOptions(), debugCode(), explainCode(), generateCode() (+5 more)

### Community 34 - "UserAnalytics.js"
Cohesion: 0.60
Nodes (5): createProject(), getProjectDetails(), getProjects(), mapProject(), updateProjectLayout()

### Community 36 - "settingsRoutes.js"
Cohesion: 0.40
Nodes (4): react, automationActions, CommandPalette(), navigationActions

### Community 37 - "Login.jsx"
Cohesion: 0.22
Nodes (7): checkSubscriptionQuota(), QUOTAS, requirePro(), storage, upload, uploadAudio, checkUsageLimit()

### Community 38 - "Client Entry Point"
Cohesion: 0.40
Nodes (5): Client Entry Point, AI Chat 3D Illustration, Holographic Brain AI Visualization, Main React Entry, CI Workflow

### Community 39 - "projectController.js"
Cohesion: 0.29
Nodes (6): __dirname, generateFlashcards(), generateMCQs(), generateNotes(), logStudy(), WORKSPACE_DIR

### Community 48 - "Chat.jsx"
Cohesion: 0.33
Nodes (5): buildCommand, framework, installCommand, outputDirectory, rewrites

### Community 49 - "voiceController.js"
Cohesion: 0.60
Nodes (4): speakText(), transcribeSpeech(), synthesizeSpeech(), transcribeAudio()

### Community 50 - "ChatMessage.jsx"
Cohesion: 0.33
Nodes (3): AGENT_BADGES, TaskPlanWidget(), automationAPI

### Community 51 - "CommandPalette.jsx"
Cohesion: 0.60
Nodes (5): run(), testCerebras(), testGemini(), testGroq(), testOpenRouter()

### Community 52 - "vercel.json"
Cohesion: 0.33
Nodes (5): buildCommand, framework, installCommand, outputDirectory, rewrites

### Community 56 - "CentralEventBus"
Cohesion: 0.28
Nodes (4): ensureDefaultMemories(), getContextPrompt(), CentralEventBus, eventBus

## Knowledge Gaps
- **215 isolated node(s):** `name`, `private`, `version`, `type`, `dev` (+210 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **9 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `showToast()` connect `productivityModule.js` to `ChatMessage.jsx`, `Settings.jsx`?**
  _High betweenness centrality (0.253) - this node is a cross-community bridge._
- **Why does `logActivity()` connect `api.js` to `aiController.js`, `RightPanel.jsx`, `mediaModule.js`, `automationService.js`, `projectController.js`, `productivityModule.js`, `automationController.js`, `browserModule.js`, `logActivity`, `cn`, `CentralEventBus`, `fileModule.js`, `db.js`, `ChatMessage.jsx`?**
  _High betweenness centrality (0.213) - this node is a cross-community bridge._
- **Why does `useAuthStore` connect `useAuthStore` to `authController.js`, `dependencies`, `NeonButton.jsx`, `Settings.jsx`, `App.jsx`, `VoiceAssistant.jsx`, `automationRegistry.js`, `auth.js`, `Chat.jsx`, `Dashboard.jsx`?**
  _High betweenness centrality (0.193) - this node is a cross-community bridge._
- **What connects `name`, `private`, `version` to the rest of the system?**
  _215 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Landing.jsx` be split into smaller, more focused modules?**
  _Cohesion score 0.05758582502768549 - nodes in this community are weakly interconnected._
- **Should `dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.04081632653061224 - nodes in this community are weakly interconnected._
- **Should `automationService.js` be split into smaller, more focused modules?**
  _Cohesion score 0.09401709401709402 - nodes in this community are weakly interconnected._