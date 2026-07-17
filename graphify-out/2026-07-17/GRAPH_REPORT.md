# Graph Report - harvox_ai  (2026-07-17)

## Corpus Check
- 167 files · ~250,153 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 955 nodes · 1912 edges · 57 communities (48 shown, 9 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 56 edges (avg confidence: 0.59)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `48e1addd`
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
- [[_COMMUNITY_Client Entry Point|Client Entry Point]]
- [[_COMMUNITY_geminiModels.js|geminiModels.js]]
- [[_COMMUNITY_Gamification Award Badges|Gamification Award Badges]]
- [[_COMMUNITY_Creator Portrait (HK)|Creator Portrait (HK)]]
- [[_COMMUNITY_3D Creation Studio Workspace|3D Creation Studio Workspace]]
- [[_COMMUNITY_Chat.jsx|Chat.jsx]]
- [[_COMMUNITY_CommandPalette.jsx|CommandPalette.jsx]]
- [[_COMMUNITY_vercel.json|vercel.json]]
- [[_COMMUNITY_subscription.js|subscription.js]]
- [[_COMMUNITY_cerebrasProvider.js|cerebrasProvider.js]]

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
- `XTerm()` --calls--> `io`  [INFERRED]
  client/src/components/terminal/XTerm.jsx → server/server.js

## Import Cycles
- 3-file cycle: `server/services/automation/modules/fileModule.js -> server/services/rollbackService.js -> server/services/automationService.js -> server/services/automation/modules/fileModule.js`

## Hyperedges (group relationships)
- **Harvox AI Technology Stack** — docker_compose_harvox_app, mongodb, groq_api, gemini_api [EXTRACTED 1.00]
- **Continuous Integration Pipeline** — github_workflows_ci_yml, docker_compose_yml, client_index_html [INFERRED 0.85]

## Communities (57 total, 9 thin omitted)

### Community 1 - "Landing.jsx"
Cohesion: 0.14
Nodes (10): FOMOBadge(), articles, faqs, features, HologramOrb, Landing(), plans, testimonials (+2 more)

### Community 2 - "dependencies"
Cohesion: 0.04
Nodes (46): dependencies, axios, clsx, date-fns, file-saver, framer-motion, html2canvas, jspdf (+38 more)

### Community 3 - "mediaModule.js"
Cohesion: 0.28
Nodes (8): registerModule(), deployRailway(), deployVercel(), __dirname, getEnvVars(), isCmdAvailable(), setEnvVar(), WORKSPACE_DIR

### Community 4 - "automationService.js"
Cohesion: 0.12
Nodes (31): openUnreadChats(), openWhatsApp(), openWhatsAppChat(), searchWhatsAppContact(), sendWhatsAppMessage(), APP_MATRIX, backupProject(), clickElement() (+23 more)

### Community 5 - "NeonButton.jsx"
Cohesion: 0.14
Nodes (10): GlassCard(), NeonButton(), PremiumLockOverlay(), languages, ICON_MAP, PRESETS, COMPLEXITY, STACKS (+2 more)

### Community 6 - "Settings.jsx"
Cohesion: 0.08
Nodes (26): CATEGORIES, ModelSelector(), PROVIDER_BADGES, SPEED_COLORS, MODES, ModeSelector(), AI_PROVIDER_META, AI_PROVIDERS (+18 more)

### Community 7 - "WorkspaceOS.jsx"
Cohesion: 0.11
Nodes (13): @xterm/xterm, actions, TerminalPanel(), XTerm(), Holographic3DCard(), FileExplorer(), getFileColor(), getFileIcon() (+5 more)

### Community 8 - "aiProviderManager.js"
Cohesion: 0.08
Nodes (10): calculateCost(), chat(), estimateTokens(), FAILOVER_CHAIN, MODEL_PRICING, providers, routePrompt(), saveLog() (+2 more)

### Community 9 - "App.jsx"
Cohesion: 0.05
Nodes (36): react, About, AdminDashboard, AdminPayments, AdminSettings, AdminUsers, App(), AutomationCenter (+28 more)

### Community 10 - "dependencies"
Cohesion: 0.08
Nodes (23): dependencies, axios, cors, dotenv, express, express-rate-limit, @google/generative-ai, groq-sdk (+15 more)

### Community 11 - "productivityModule.js"
Cohesion: 0.13
Nodes (19): createReminder(), createTask(), __dirname, DISTRACTING_APPS, enableFocusMode(), enableMeetingMode(), enableStudyMode(), generateDailyPlan() (+11 more)

### Community 12 - "automationController.js"
Cohesion: 0.05
Nodes (73): createTask(), deleteTask(), detectAndPlan(), executeBuiltinWorkflow(), executeCustomWorkflow(), executePlan(), executeStep(), getActiveRuns() (+65 more)

### Community 13 - "VoiceAssistant.jsx"
Cohesion: 0.10
Nodes (11): AGENT_BADGES, TaskPlanWidget(), VoiceOrb(), AGENT_BADGES, AI_MODELS, BSCS_SUBJECTS, detectModelSwitch(), ELEVENLABS_IDS (+3 more)

### Community 14 - "package.json"
Cohesion: 0.07
Nodes (26): harvox-app Service, Docker Compose Configuration, Gemini AI API, Groq AI API, MongoDB, dependencies, @google/generative-ai, mongodb (+18 more)

### Community 15 - "useAuthStore"
Cohesion: 0.12
Nodes (10): jszip, AdminRoute(), ProtectedRoute(), AdminLayout(), Profile(), ProjectGenerator(), Login(), Register() (+2 more)

### Community 17 - "browserModule.js"
Cohesion: 0.15
Nodes (22): activateWindow(), browserBookmark(), browserCloseTab(), browserDownloads(), browserNavigate(), browserNewTab(), browserNextTab(), browserReopenTab() (+14 more)

### Community 18 - "logActivity"
Cohesion: 0.14
Nodes (20): __dirname, generateApiRoute(), generateReadme(), gitAdd(), gitCommit(), gitInit(), gitPush(), gitStatus() (+12 more)

### Community 19 - "automationRegistry.js"
Cohesion: 0.27
Nodes (7): DashboardLayout(), NAV_GROUPS, NavItem(), Sidebar(), ROUTE_META, TopBar(), useSidebarStore

### Community 20 - "auth.js"
Cohesion: 0.15
Nodes (7): BrainMemorySettings(), Billing(), api, memoryAPI, paymentsAPI, profileAPI, userAPI

### Community 21 - "server.js"
Cohesion: 0.05
Nodes (40): connectDB(), getDBHealth(), ensurePublicRecords(), forgotPassword(), getMe(), login(), register(), sendUser() (+32 more)

### Community 23 - "cn"
Cohesion: 0.43
Nodes (7): composeEmail(), openGmail(), openGmailCompose(), openGmailInbox(), openOutlook(), openUrl(), searchGmail()

### Community 24 - "api.js"
Cohesion: 0.08
Nodes (48): mediaMute(), mediaNext(), mediaPlayPause(), mediaPrev(), mediaStop(), mediaVolumeDown(), mediaVolumeUp(), openDisneyPlus() (+40 more)

### Community 25 - "fileModule.js"
Cohesion: 0.26
Nodes (14): compressFolder(), createFile(), createFolder(), deleteFile(), __dirname, extractZip(), findFile(), moveFile() (+6 more)

### Community 26 - "db.js"
Cohesion: 0.25
Nodes (7): lockComputer(), logoutUser(), restartComputer(), shutdownComputer(), __dirname, runPSCommand(), TEMP_DIR

### Community 27 - "Dashboard.jsx"
Cohesion: 0.20
Nodes (4): PromptBar(), Dashboard(), QUICK_COMMANDS, SUBJECT_META

### Community 28 - "fsController.js"
Cohesion: 0.27
Nodes (10): buildTree(), createFileOrFolder(), __dirname, ensureWorkspace(), __filename, getFileContent(), getFileTree(), getSafePath() (+2 more)

### Community 29 - "ChatMessage.jsx"
Cohesion: 0.29
Nodes (6): Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle

### Community 30 - "Chat.jsx"
Cohesion: 0.22
Nodes (4): C, Chat(), useMediaQuery(), chatAPI

### Community 31 - "deploy"
Cohesion: 0.20
Nodes (9): build, builder, dockerfilePath, deploy, healthcheckPath, healthcheckTimeout, restartPolicyMaxRetries, restartPolicyType (+1 more)

### Community 33 - "RightPanel.jsx"
Cohesion: 0.07
Nodes (46): PERSONALITIES, PROMPTS, chatAI(), getAIMetrics(), getAIOptions(), debugCode(), explainCode(), generateCode() (+38 more)

### Community 34 - "UserAnalytics.js"
Cohesion: 0.60
Nodes (5): createProject(), getProjectDetails(), getProjects(), mapProject(), updateProjectLayout()

### Community 36 - "settingsRoutes.js"
Cohesion: 0.60
Nodes (3): HologramCard(), Spotlight(), cn()

### Community 38 - "Client Entry Point"
Cohesion: 0.40
Nodes (5): Client Entry Point, AI Chat 3D Illustration, Holographic Brain AI Visualization, Main React Entry, CI Workflow

### Community 48 - "Chat.jsx"
Cohesion: 0.33
Nodes (5): buildCommand, framework, installCommand, outputDirectory, rewrites

### Community 51 - "CommandPalette.jsx"
Cohesion: 0.60
Nodes (5): run(), testCerebras(), testGemini(), testGroq(), testOpenRouter()

### Community 52 - "vercel.json"
Cohesion: 0.33
Nodes (5): buildCommand, framework, installCommand, outputDirectory, rewrites

### Community 53 - "subscription.js"
Cohesion: 0.20
Nodes (5): HologramOrb(), LoadingOrb(), SplineComponent(), SplineErrorBoundary, SplineReact

## Knowledge Gaps
- **218 isolated node(s):** `name`, `private`, `version`, `type`, `dev` (+213 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **9 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `showToast()` connect `productivityModule.js` to `api.js`, `auth.js`, `Settings.jsx`?**
  _High betweenness centrality (0.251) - this node is a cross-community bridge._
- **Why does `logActivity()` connect `automationService.js` to `RightPanel.jsx`, `mediaModule.js`, `productivityModule.js`, `automationController.js`, `browserModule.js`, `logActivity`, `cn`, `api.js`, `fileModule.js`, `db.js`?**
  _High betweenness centrality (0.207) - this node is a cross-community bridge._
- **Why does `useAuthStore` connect `useAuthStore` to `aiController.js`, `NeonButton.jsx`, `Settings.jsx`, `App.jsx`, `VoiceAssistant.jsx`, `automationRegistry.js`, `auth.js`, `Dashboard.jsx`?**
  _High betweenness centrality (0.191) - this node is a cross-community bridge._
- **What connects `name`, `private`, `version` to the rest of the system?**
  _218 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Landing.jsx` be split into smaller, more focused modules?**
  _Cohesion score 0.14166666666666666 - nodes in this community are weakly interconnected._
- **Should `dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.0425531914893617 - nodes in this community are weakly interconnected._
- **Should `automationService.js` be split into smaller, more focused modules?**
  _Cohesion score 0.12310606060606061 - nodes in this community are weakly interconnected._