# Graph Report - .  (2026-07-04)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 821 nodes · 1558 edges · 48 communities (42 shown, 6 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 14 edges (avg confidence: 0.76)
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
- [[_COMMUNITY_emailModule.js|emailModule.js]]
- [[_COMMUNITY_settingsRoutes.js|settingsRoutes.js]]
- [[_COMMUNITY_paymentRoutes.js|paymentRoutes.js]]
- [[_COMMUNITY_Client Entry Point|Client Entry Point]]
- [[_COMMUNITY_CommandPalette.jsx|CommandPalette.jsx]]
- [[_COMMUNITY_geminiModels.js|geminiModels.js]]
- [[_COMMUNITY_Gamification Award Badges|Gamification Award Badges]]
- [[_COMMUNITY_Creator Portrait (HK)|Creator Portrait (HK)]]
- [[_COMMUNITY_3D Creation Studio Workspace|3D Creation Studio Workspace]]

## God Nodes (most connected - your core abstractions)
1. `logActivity()` - 121 edges
2. `useAuthStore` - 35 edges
3. `executeAutomationStep()` - 27 edges
4. `NeonButton()` - 21 edges
5. `runPS()` - 21 edges
6. `GlassCard()` - 19 edges
7. `cn()` - 17 edges
8. `protect()` - 13 edges
9. `execP()` - 12 edges
10. `aiAPI` - 11 edges

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
- None detected.

## Hyperedges (group relationships)
- **Harvox AI Technology Stack** — docker_compose_harvox_app, mongodb, groq_api, gemini_api [EXTRACTED 1.00]
- **Continuous Integration Pipeline** — github_workflows_ci_yml, docker_compose_yml, client_index_html [INFERRED 0.85]

## Communities (48 total, 6 thin omitted)

### Community 0 - "aiController.js"
Cohesion: 0.07
Nodes (37): Chat, PERSONALITIES, PROMPTS, analyzeFile(), chatAI(), debugCode(), explainCode(), generateCode() (+29 more)

### Community 1 - "Landing.jsx"
Cohesion: 0.05
Nodes (29): AuroraBorealis(), BackgroundEffects(), CyberGrid(), FloatingParticles(), GradientBlobs(), HologramWaves(), Starfield3D(), WireframeBackground() (+21 more)

### Community 2 - "dependencies"
Cohesion: 0.04
Nodes (46): dependencies, axios, clsx, date-fns, file-saver, framer-motion, html2canvas, jspdf (+38 more)

### Community 3 - "mediaModule.js"
Cohesion: 0.11
Nodes (33): __dirname, execP(), mediaMute(), mediaNext(), mediaPlayPause(), mediaPrev(), mediaStop(), mediaVolumeDown() (+25 more)

### Community 4 - "automationService.js"
Cohesion: 0.13
Nodes (30): dispatchAction(), hasAction(), APP_MATRIX, backupProject(), clickElement(), createComponent(), createFile(), createProject() (+22 more)

### Community 5 - "NeonButton.jsx"
Cohesion: 0.15
Nodes (9): GlassCard(), NeonButton(), PremiumLockOverlay(), languages, PRESETS, COMPLEXITY, STACKS, aiAPI (+1 more)

### Community 6 - "Settings.jsx"
Cohesion: 0.11
Nodes (20): CATEGORIES, ModelSelector(), PROVIDER_BADGES, SPEED_COLORS, AI_PROVIDER_META, AI_PROVIDERS, ALL_MODELS, GEMINI_MODELS (+12 more)

### Community 7 - "WorkspaceOS.jsx"
Cohesion: 0.11
Nodes (13): @xterm/xterm, actions, TerminalPanel(), XTerm(), Holographic3DCard(), FileExplorer(), getFileColor(), getFileIcon() (+5 more)

### Community 8 - "aiProviderManager.js"
Cohesion: 0.09
Nodes (12): AICallLog, aiCallLogSchema, calculateCost(), chat(), estimateTokens(), FAILOVER_CHAIN, MODEL_PRICING, providers (+4 more)

### Community 9 - "App.jsx"
Cohesion: 0.08
Nodes (24): About, AdminDashboard, AdminPayments, AdminSettings, AdminUsers, App(), AutomationCenter, Billing (+16 more)

### Community 10 - "dependencies"
Cohesion: 0.07
Nodes (26): dependencies, axios, bcryptjs, cors, dotenv, express, express-rate-limit, groq-sdk (+18 more)

### Community 11 - "productivityModule.js"
Cohesion: 0.12
Nodes (22): BrainMemorySettings(), taskSchema, createReminder(), createTask(), __dirname, DISTRACTING_APPS, enableFocusMode(), enableMeetingMode() (+14 more)

### Community 12 - "automationController.js"
Cohesion: 0.17
Nodes (20): createTask(), deleteTask(), executeStep(), getDashboardInfo(), getHistory(), getModules(), getPreferences(), getStudyProgress() (+12 more)

### Community 13 - "VoiceAssistant.jsx"
Cohesion: 0.09
Nodes (7): VoiceOrb(), AGENT_BADGES, AI_MODELS, BSCS_SUBJECTS, detectModelSwitch(), VoiceAssistant(), PtyManager

### Community 14 - "package.json"
Cohesion: 0.09
Nodes (22): harvox-app Service, Docker Compose Configuration, Gemini AI API, Groq AI API, MongoDB, dependencies, @google/generative-ai, mongodb (+14 more)

### Community 15 - "useAuthStore"
Cohesion: 0.14
Nodes (8): AdminRoute(), ProtectedRoute(), AdminLayout(), ROUTE_META, TopBar(), Login(), Register(), useAuthStore

### Community 17 - "browserModule.js"
Cohesion: 0.16
Nodes (21): browserBookmark(), browserCloseTab(), browserDownloads(), browserNavigate(), browserNewTab(), browserNextTab(), browserReopenTab(), __dirname (+13 more)

### Community 18 - "logActivity"
Cohesion: 0.20
Nodes (21): __dirname, generateApiRoute(), generateReadme(), gitAdd(), gitCommit(), gitInit(), gitPush(), gitStatus() (+13 more)

### Community 19 - "automationRegistry.js"
Cohesion: 0.13
Nodes (15): _modules, registerModule(), _registry, APP_MATRIX, closeApplication(), openApplication(), resolveApp(), __dirname (+7 more)

### Community 20 - "auth.js"
Cohesion: 0.16
Nodes (9): protect(), requireAdmin(), chatSchema, messageSchema, noteSchema, userSchema, router, router (+1 more)

### Community 21 - "server.js"
Cohesion: 0.12
Nodes (14): router, router, router, router, router, allowedOrigins, app, authLimiter (+6 more)

### Community 22 - "Chat.jsx"
Cohesion: 0.15
Nodes (3): ChatErrorBoundary, getModelById(), Chat()

### Community 23 - "cn"
Cohesion: 0.29
Nodes (8): DashboardLayout(), NAV_GROUPS, NavItem(), Sidebar(), HologramCard(), Spotlight(), useSidebarStore, cn()

### Community 24 - "api.js"
Cohesion: 0.18
Nodes (8): Billing(), Profile(), api, authAPI, memoryAPI, paymentsAPI, profileAPI, userAPI

### Community 25 - "fileModule.js"
Cohesion: 0.24
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
Cohesion: 0.22
Nodes (5): AGENT_BADGES, TaskPlanWidget(), AutomationCenter(), ICON_MAP, automationAPI

### Community 30 - "Chat.jsx"
Cohesion: 0.22
Nodes (4): C, Chat(), useMediaQuery(), chatAPI

### Community 31 - "deploy"
Cohesion: 0.20
Nodes (9): build, builder, dockerfilePath, deploy, healthcheckPath, healthcheckTimeout, restartPolicyMaxRetries, restartPolicyType (+1 more)

### Community 32 - "authController.js"
Cohesion: 0.44
Nodes (8): forgotPassword(), generateToken(), getMe(), login(), register(), sendUser(), updateProfile(), router

### Community 34 - "UserAnalytics.js"
Cohesion: 0.25
Nodes (5): achievementsSchema, badgeSchema, activityLogEntry, userAnalyticsSchema, router

### Community 35 - "emailModule.js"
Cohesion: 0.43
Nodes (7): composeEmail(), openGmail(), openGmailCompose(), openGmailInbox(), openOutlook(), openUrl(), searchGmail()

### Community 36 - "settingsRoutes.js"
Cohesion: 0.38
Nodes (4): getSettings(), updateSettings(), userSettingsSchema, router

### Community 37 - "paymentRoutes.js"
Cohesion: 0.33
Nodes (3): subscriptionSchema, systemSettingsSchema, router

### Community 38 - "Client Entry Point"
Cohesion: 0.40
Nodes (5): Client Entry Point, AI Chat 3D Illustration, Holographic Brain AI Visualization, Main React Entry, CI Workflow

### Community 39 - "CommandPalette.jsx"
Cohesion: 0.40
Nodes (4): react, automationActions, CommandPalette(), navigationActions

## Knowledge Gaps
- **216 isolated node(s):** `name`, `private`, `version`, `type`, `dev` (+211 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **6 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `logActivity()` connect `logActivity` to `aiController.js`, `emailModule.js`, `mediaModule.js`, `automationService.js`, `productivityModule.js`, `automationController.js`, `browserModule.js`, `automationRegistry.js`, `fileModule.js`?**
  _High betweenness centrality (0.248) - this node is a cross-community bridge._
- **Why does `Chat` connect `aiController.js` to `App.jsx`?**
  _High betweenness centrality (0.160) - this node is a cross-community bridge._
- **Why does `chatAI()` connect `aiController.js` to `logActivity`?**
  _High betweenness centrality (0.156) - this node is a cross-community bridge._
- **What connects `name`, `private`, `version` to the rest of the system?**
  _216 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `aiController.js` be split into smaller, more focused modules?**
  _Cohesion score 0.06623376623376623 - nodes in this community are weakly interconnected._
- **Should `Landing.jsx` be split into smaller, more focused modules?**
  _Cohesion score 0.05019607843137255 - nodes in this community are weakly interconnected._
- **Should `dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.0425531914893617 - nodes in this community are weakly interconnected._