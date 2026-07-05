# Graph Report - harvox_ai  (2026-07-05)

## Corpus Check
- 167 files · ~243,499 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 939 nodes · 1911 edges · 51 communities (44 shown, 7 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 49 edges (avg confidence: 0.6)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `111ad466`
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
- [[_COMMUNITY_ChatMessage.jsx|ChatMessage.jsx]]
- [[_COMMUNITY_CommandPalette.jsx|CommandPalette.jsx]]

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
- `BrainMemorySettings()` --calls--> `showToast()`  [INFERRED]
  client/src/components/settings/BrainMemorySettings.jsx → server/services/automation/modules/productivityModule.js
- `Settings()` --calls--> `showToast()`  [INFERRED]
  client/src/pages/app/Settings.jsx → server/services/automation/modules/productivityModule.js
- `Login()` --calls--> `login()`  [INFERRED]
  client/src/pages/auth/Login.jsx → server/controllers/authController.js
- `Register()` --calls--> `register()`  [INFERRED]
  client/src/pages/auth/Register.jsx → server/controllers/authController.js
- `chatAI()` --references--> `Chat`  [EXTRACTED]
  server/controllers/ai/chatController.js → client/src/App.jsx

## Import Cycles
- 3-file cycle: `server/services/automation/modules/fileModule.js -> server/services/rollbackService.js -> server/services/automationService.js -> server/services/automation/modules/fileModule.js`

## Hyperedges (group relationships)
- **Harvox AI Technology Stack** — docker_compose_harvox_app, mongodb, groq_api, gemini_api [EXTRACTED 1.00]
- **Continuous Integration Pipeline** — github_workflows_ci_yml, docker_compose_yml, client_index_html [INFERRED 0.85]

## Communities (51 total, 7 thin omitted)

### Community 0 - "aiController.js"
Cohesion: 0.12
Nodes (18): autoTagMemory(), createMemory(), deleteMemory(), detectConflicts(), exportMemories(), getMemories(), summarizeIdentity(), togglePinMemory() (+10 more)

### Community 1 - "Landing.jsx"
Cohesion: 0.05
Nodes (29): AuroraBorealis(), BackgroundEffects(), CyberGrid(), FloatingParticles(), GradientBlobs(), HologramWaves(), Starfield3D(), WireframeBackground() (+21 more)

### Community 2 - "dependencies"
Cohesion: 0.04
Nodes (46): dependencies, axios, clsx, date-fns, file-saver, framer-motion, html2canvas, jspdf (+38 more)

### Community 3 - "mediaModule.js"
Cohesion: 0.32
Nodes (7): deployRailway(), deployVercel(), __dirname, getEnvVars(), isCmdAvailable(), setEnvVar(), WORKSPACE_DIR

### Community 4 - "automationService.js"
Cohesion: 0.09
Nodes (26): APP_MATRIX, backupProject(), clickElement(), createComponent(), createFile(), createProject(), __dirname, draftEmail() (+18 more)

### Community 5 - "NeonButton.jsx"
Cohesion: 0.16
Nodes (9): GlassCard(), NeonButton(), PremiumLockOverlay(), languages, PRESETS, COMPLEXITY, STACKS, aiAPI (+1 more)

### Community 6 - "Settings.jsx"
Cohesion: 0.10
Nodes (22): CATEGORIES, ModelSelector(), PROVIDER_BADGES, SPEED_COLORS, BrainMemorySettings(), AI_PROVIDER_META, AI_PROVIDERS, ALL_MODELS (+14 more)

### Community 7 - "WorkspaceOS.jsx"
Cohesion: 0.11
Nodes (13): @xterm/xterm, actions, TerminalPanel(), XTerm(), Holographic3DCard(), FileExplorer(), getFileColor(), getFileIcon() (+5 more)

### Community 8 - "aiProviderManager.js"
Cohesion: 0.05
Nodes (49): PERSONALITIES, PROMPTS, chatAI(), getAIMetrics(), getAIOptions(), debugCode(), explainCode(), generateCode() (+41 more)

### Community 9 - "App.jsx"
Cohesion: 0.08
Nodes (24): About, AdminDashboard, AdminPayments, AdminSettings, AdminUsers, App(), AutomationCenter, Billing (+16 more)

### Community 10 - "dependencies"
Cohesion: 0.07
Nodes (26): dependencies, axios, bcryptjs, cors, dotenv, express, express-rate-limit, groq-sdk (+18 more)

### Community 11 - "productivityModule.js"
Cohesion: 0.11
Nodes (20): taskSchema, createReminder(), createTask(), __dirname, DISTRACTING_APPS, enableFocusMode(), enableMeetingMode(), enableStudyMode() (+12 more)

### Community 12 - "automationController.js"
Cohesion: 0.06
Nodes (57): createTask(), deleteTask(), detectAndPlan(), executeBuiltinWorkflow(), executeCustomWorkflow(), executePlan(), executeStep(), getActiveRuns() (+49 more)

### Community 13 - "VoiceAssistant.jsx"
Cohesion: 0.09
Nodes (9): VoiceOrb(), AGENT_BADGES, AI_MODELS, BSCS_SUBJECTS, detectModelSwitch(), ELEVENLABS_IDS, ELEVENLABS_VOICES, VoiceAssistant() (+1 more)

### Community 14 - "package.json"
Cohesion: 0.09
Nodes (22): harvox-app Service, Docker Compose Configuration, Gemini AI API, Groq AI API, MongoDB, dependencies, @google/generative-ai, mongodb (+14 more)

### Community 15 - "useAuthStore"
Cohesion: 0.15
Nodes (9): AdminRoute(), ProtectedRoute(), AdminLayout(), ROUTE_META, TopBar(), Billing(), Profile(), Register() (+1 more)

### Community 17 - "browserModule.js"
Cohesion: 0.10
Nodes (28): activateWindow(), browserBookmark(), browserCloseTab(), browserDownloads(), browserNavigate(), browserNewTab(), browserNextTab(), browserReopenTab() (+20 more)

### Community 18 - "logActivity"
Cohesion: 0.14
Nodes (20): __dirname, generateApiRoute(), generateReadme(), gitAdd(), gitCommit(), gitInit(), gitPush(), gitStatus() (+12 more)

### Community 19 - "automationRegistry.js"
Cohesion: 0.29
Nodes (8): DashboardLayout(), NAV_GROUPS, NavItem(), Sidebar(), HologramCard(), Spotlight(), useSidebarStore, cn()

### Community 20 - "auth.js"
Cohesion: 0.18
Nodes (8): protect(), requireAdmin(), chatSchema, messageSchema, fileSchema, systemSettingsSchema, userSchema, router

### Community 21 - "server.js"
Cohesion: 0.09
Nodes (16): learningTrackSchema, noteSchema, router, router, router, router, router, router (+8 more)

### Community 22 - "Chat.jsx"
Cohesion: 0.14
Nodes (5): ChatErrorBoundary, MODES, ModeSelector(), getModelById(), Chat()

### Community 23 - "cn"
Cohesion: 0.19
Nodes (12): registerModule(), composeEmail(), openGmail(), openGmailCompose(), openGmailInbox(), openOutlook(), openUrl(), searchGmail() (+4 more)

### Community 24 - "api.js"
Cohesion: 0.21
Nodes (6): api, authAPI, memoryAPI, paymentsAPI, profileAPI, userAPI

### Community 25 - "fileModule.js"
Cohesion: 0.26
Nodes (14): compressFolder(), createFile(), createFolder(), deleteFile(), __dirname, extractZip(), findFile(), moveFile() (+6 more)

### Community 26 - "db.js"
Cohesion: 0.27
Nodes (6): connectDB(), DatabaseManager, dbManager, getDBHealth(), startServer(), runTests()

### Community 27 - "Dashboard.jsx"
Cohesion: 0.20
Nodes (4): PromptBar(), Dashboard(), QUICK_COMMANDS, SUBJECT_META

### Community 28 - "fsController.js"
Cohesion: 0.27
Nodes (10): buildTree(), createFileOrFolder(), __dirname, ensureWorkspace(), __filename, getFileContent(), getFileTree(), getSafePath() (+2 more)

### Community 29 - "ChatMessage.jsx"
Cohesion: 0.10
Nodes (54): mediaMute(), mediaNext(), mediaPlayPause(), mediaPrev(), mediaStop(), mediaVolumeDown(), mediaVolumeUp(), openDisneyPlus() (+46 more)

### Community 30 - "Chat.jsx"
Cohesion: 0.67
Nodes (3): chat(), getClient(), isAIConfigured()

### Community 31 - "deploy"
Cohesion: 0.20
Nodes (9): build, builder, dockerfilePath, deploy, healthcheckPath, healthcheckTimeout, restartPolicyMaxRetries, restartPolicyType (+1 more)

### Community 32 - "authController.js"
Cohesion: 0.44
Nodes (8): forgotPassword(), generateToken(), getMe(), login(), register(), sendUser(), updateProfile(), router

### Community 34 - "UserAnalytics.js"
Cohesion: 0.20
Nodes (6): achievementsSchema, badgeSchema, subscriptionSchema, activityLogEntry, userAnalyticsSchema, router

### Community 36 - "settingsRoutes.js"
Cohesion: 0.38
Nodes (4): getSettings(), updateSettings(), userSettingsSchema, router

### Community 38 - "Client Entry Point"
Cohesion: 0.40
Nodes (5): Client Entry Point, AI Chat 3D Illustration, Holographic Brain AI Visualization, Main React Entry, CI Workflow

### Community 39 - "projectController.js"
Cohesion: 0.20
Nodes (4): Chat, getProjectDetails(), commandHistorySchema, projectSchema

### Community 48 - "Chat.jsx"
Cohesion: 0.22
Nodes (4): C, Chat(), useMediaQuery(), chatAPI

### Community 50 - "ChatMessage.jsx"
Cohesion: 0.22
Nodes (5): AGENT_BADGES, TaskPlanWidget(), AutomationCenter(), ICON_MAP, automationAPI

### Community 51 - "CommandPalette.jsx"
Cohesion: 0.40
Nodes (4): react, automationActions, CommandPalette(), navigationActions

## Knowledge Gaps
- **221 isolated node(s):** `name`, `private`, `version`, `type`, `dev` (+216 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **7 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `logActivity()` connect `ChatMessage.jsx` to `aiController.js`, `mediaModule.js`, `automationService.js`, `aiProviderManager.js`, `productivityModule.js`, `automationController.js`, `browserModule.js`, `logActivity`, `cn`, `fileModule.js`?**
  _High betweenness centrality (0.234) - this node is a cross-community bridge._
- **Why does `chatAI()` connect `aiProviderManager.js` to `aiController.js`, `automationController.js`, `ChatMessage.jsx`, `projectController.js`?**
  _High betweenness centrality (0.164) - this node is a cross-community bridge._
- **Why does `Chat` connect `projectController.js` to `aiProviderManager.js`, `App.jsx`?**
  _High betweenness centrality (0.159) - this node is a cross-community bridge._
- **What connects `name`, `private`, `version` to the rest of the system?**
  _221 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `aiController.js` be split into smaller, more focused modules?**
  _Cohesion score 0.11822660098522167 - nodes in this community are weakly interconnected._
- **Should `Landing.jsx` be split into smaller, more focused modules?**
  _Cohesion score 0.05019607843137255 - nodes in this community are weakly interconnected._
- **Should `dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.0425531914893617 - nodes in this community are weakly interconnected._