# Graph Report - harvox_ai  (2026-07-22)

## Corpus Check
- 176 files · ~256,386 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1011 nodes · 2033 edges · 69 communities (59 shown, 10 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 57 edges (avg confidence: 0.59)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `f92b9330`
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
- [[_COMMUNITY_CommandPalette.jsx|CommandPalette.jsx]]
- [[_COMMUNITY_vercel.json|vercel.json]]
- [[_COMMUNITY_subscription.js|subscription.js]]
- [[_COMMUNITY_intentEngine.js|intentEngine.js]]
- [[_COMMUNITY_cn|cn]]
- [[_COMMUNITY_PerformanceProvider.jsx|PerformanceProvider.jsx]]
- [[_COMMUNITY_card.jsx|card.jsx]]
- [[_COMMUNITY_useThemeStore.js|useThemeStore.js]]
- [[_COMMUNITY_Profile.jsx|Profile.jsx]]
- [[_COMMUNITY_agent.mjs|agent.mjs]]
- [[_COMMUNITY_voiceController.js|voiceController.js]]
- [[_COMMUNITY_ModeSelector.jsx|ModeSelector.jsx]]

## God Nodes (most connected - your core abstractions)
1. `logActivity()` - 162 edges
2. `runPS()` - 56 edges
3. `useAuthStore` - 35 edges
4. `getAIOptions()` - 25 edges
5. `NeonButton()` - 21 edges
6. `GlassCard()` - 20 edges
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
- `handler()` --calls--> `app`  [INFERRED]
  api/[...path].js → server/server.js

## Import Cycles
- 3-file cycle: `server/controllers/ai/chatController.js -> server/services/postChatSummarizer.js -> server/controllers/aiController.js -> server/controllers/ai/chatController.js`
- 4-file cycle: `server/controllers/ai/chatController.js -> server/services/postChatSummarizer.js -> server/controllers/aiController.js -> server/controllers/ai/codeController.js -> server/controllers/ai/chatController.js`
- 4-file cycle: `server/controllers/ai/chatController.js -> server/services/postChatSummarizer.js -> server/controllers/aiController.js -> server/controllers/ai/fileAnalysisController.js -> server/controllers/ai/chatController.js`
- 4-file cycle: `server/controllers/ai/chatController.js -> server/services/postChatSummarizer.js -> server/controllers/aiController.js -> server/controllers/ai/projectController.js -> server/controllers/ai/chatController.js`
- 5-file cycle: `server/controllers/ai/chatController.js -> server/services/postChatSummarizer.js -> server/controllers/aiController.js -> server/controllers/ai/voiceController.js -> server/services/voiceService.js -> server/controllers/ai/chatController.js`

## Hyperedges (group relationships)
- **Harvox AI Technology Stack** — docker_compose_harvox_app, mongodb, groq_api, gemini_api [EXTRACTED 1.00]
- **Continuous Integration Pipeline** — github_workflows_ci_yml, docker_compose_yml, client_index_html [INFERRED 0.85]

## Communities (69 total, 10 thin omitted)

### Community 1 - "Landing.jsx"
Cohesion: 0.14
Nodes (10): FOMOBadge(), articles, faqs, features, HologramOrb, Landing(), plans, testimonials (+2 more)

### Community 2 - "dependencies"
Cohesion: 0.04
Nodes (48): dependencies, axios, clsx, date-fns, file-saver, framer-motion, html2canvas, jspdf (+40 more)

### Community 3 - "mediaModule.js"
Cohesion: 0.28
Nodes (8): registerModule(), deployRailway(), deployVercel(), __dirname, getEnvVars(), isCmdAvailable(), setEnvVar(), WORKSPACE_DIR

### Community 4 - "automationService.js"
Cohesion: 0.12
Nodes (31): openUnreadChats(), openWhatsApp(), openWhatsAppChat(), searchWhatsAppContact(), sendWhatsAppMessage(), APP_MATRIX, backupProject(), clickElement() (+23 more)

### Community 5 - "NeonButton.jsx"
Cohesion: 0.15
Nodes (9): GlassCard(), NeonButton(), PremiumLockOverlay(), languages, PRESETS, COMPLEXITY, STACKS, aiAPI (+1 more)

### Community 6 - "Settings.jsx"
Cohesion: 0.10
Nodes (22): CATEGORIES, ModelSelector(), PROVIDER_BADGES, SPEED_COLORS, AI_PROVIDER_META, AI_PROVIDERS, ALL_MODELS, CEREBRAS_MODELS (+14 more)

### Community 7 - "WorkspaceOS.jsx"
Cohesion: 0.11
Nodes (12): @xterm/xterm, actions, TerminalPanel(), XTerm(), Holographic3DCard(), FileExplorer(), getFileColor(), getFileIcon() (+4 more)

### Community 8 - "aiProviderManager.js"
Cohesion: 0.11
Nodes (8): calculateCost(), chat(), estimateTokens(), FAILOVER_CHAIN, MODEL_PRICING, providers, routePrompt(), saveLog()

### Community 9 - "App.jsx"
Cohesion: 0.06
Nodes (30): About, AdaptiveCustomCursor(), AdminDashboard, AdminPayments, AdminSettings, AdminUsers, AutomationCenter, Billing (+22 more)

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
Cohesion: 0.08
Nodes (9): VoiceOrb(), AGENT_BADGES, AI_MODELS, BSCS_SUBJECTS, detectModelSwitch(), ELEVENLABS_IDS, ELEVENLABS_VOICES, VoiceAssistant() (+1 more)

### Community 14 - "package.json"
Cohesion: 0.06
Nodes (35): harvox-app Service, Docker Compose Configuration, Gemini AI API, Groq AI API, MongoDB, dependencies, axios, cors (+27 more)

### Community 15 - "useAuthStore"
Cohesion: 0.14
Nodes (7): ROUTE_META, TopBar(), Billing(), Profile(), Login(), Register(), useAuthStore

### Community 17 - "browserModule.js"
Cohesion: 0.15
Nodes (22): activateWindow(), browserBookmark(), browserCloseTab(), browserDownloads(), browserNavigate(), browserNewTab(), browserNextTab(), browserReopenTab() (+14 more)

### Community 18 - "logActivity"
Cohesion: 0.14
Nodes (20): __dirname, generateApiRoute(), generateReadme(), gitAdd(), gitCommit(), gitInit(), gitPush(), gitStatus() (+12 more)

### Community 19 - "automationRegistry.js"
Cohesion: 0.22
Nodes (6): DashboardLayout(), NAV_GROUPS, Sidebar(), getModelById(), Chat(), useSidebarStore

### Community 20 - "auth.js"
Cohesion: 0.25
Nodes (7): lockComputer(), logoutUser(), restartComputer(), shutdownComputer(), __dirname, runPSCommand(), TEMP_DIR

### Community 21 - "server.js"
Cohesion: 0.06
Nodes (38): handler(), connectDB(), getDBHealth(), ensurePublicRecords(), forgotPassword(), getMe(), login(), register() (+30 more)

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
Cohesion: 0.29
Nodes (5): App(), ACCENT_PALETTES, FONT_FAMILIES, FONT_SIZES, useThemeStore

### Community 27 - "Dashboard.jsx"
Cohesion: 0.20
Nodes (4): PromptBar(), Dashboard(), QUICK_COMMANDS, SUBJECT_META

### Community 28 - "fsController.js"
Cohesion: 0.27
Nodes (10): buildTree(), createFileOrFolder(), __dirname, ensureWorkspace(), __filename, getFileContent(), getFileTree(), getSafePath() (+2 more)

### Community 29 - "ChatMessage.jsx"
Cohesion: 0.24
Nodes (13): chatAI(), getAIMetrics(), debugCode(), explainCode(), generateCode(), analyzeFile(), generateProject(), getVoicesList() (+5 more)

### Community 30 - "Chat.jsx"
Cohesion: 0.22
Nodes (4): C, Chat(), useMediaQuery(), chatAPI

### Community 31 - "deploy"
Cohesion: 0.20
Nodes (9): build, builder, dockerfilePath, deploy, healthcheckPath, healthcheckTimeout, restartPolicyMaxRetries, restartPolicyType (+1 more)

### Community 32 - "authController.js"
Cohesion: 0.09
Nodes (35): autoTagMemory(), clearMemories(), createMemory(), deleteMemory(), detectConflicts(), exportMemories(), getBrainAnalytics(), getIndexerStatusController() (+27 more)

### Community 33 - "RightPanel.jsx"
Cohesion: 0.24
Nodes (4): PERSONALITIES, PROMPTS, ACTION_MAP, FIELD_MAP

### Community 34 - "UserAnalytics.js"
Cohesion: 0.60
Nodes (5): createProject(), getProjectDetails(), getProjects(), mapProject(), updateProjectLayout()

### Community 36 - "settingsRoutes.js"
Cohesion: 0.20
Nodes (5): HologramOrb(), LoadingOrb(), SplineComponent(), SplineErrorBoundary, SplineReact

### Community 37 - "memoryService.js"
Cohesion: 0.29
Nodes (5): BackgroundEffects(), CyberGrid(), GradientBlobs(), HologramWaves(), Starfield3D()

### Community 38 - "Client Entry Point"
Cohesion: 0.40
Nodes (5): Client Entry Point, AI Chat 3D Illustration, Holographic Brain AI Visualization, Main React Entry, CI Workflow

### Community 39 - "ChatMessage.jsx"
Cohesion: 0.13
Nodes (10): AGENT_BADGES, TaskPlanWidget(), BrainMemorySettings(), ICON_MAP, api, automationAPI, memoryAPI, paymentsAPI (+2 more)

### Community 48 - "Chat.jsx"
Cohesion: 0.33
Nodes (5): buildCommand, framework, installCommand, outputDirectory, rewrites

### Community 49 - "studyModule.js"
Cohesion: 0.36
Nodes (7): getAIOptions(), __dirname, generateFlashcards(), generateMCQs(), generateNotes(), logStudy(), WORKSPACE_DIR

### Community 51 - "CommandPalette.jsx"
Cohesion: 0.60
Nodes (5): run(), testCerebras(), testGemini(), testGroq(), testOpenRouter()

### Community 52 - "vercel.json"
Cohesion: 0.29
Nodes (6): buildCommand, installCommand, outputDirectory, rewrites, $schema, version

### Community 53 - "subscription.js"
Cohesion: 0.40
Nodes (4): react, automationActions, CommandPalette(), navigationActions

### Community 56 - "cn"
Cohesion: 0.48
Nodes (4): NavItem(), HologramCard(), Spotlight(), cn()

### Community 63 - "PerformanceProvider.jsx"
Cohesion: 0.52
Nodes (6): getInitialProfile(), getManualProfile(), getStoredGraphicsMode(), GRAPHICS_MODES, PerformanceContext, PerformanceProvider()

### Community 64 - "card.jsx"
Cohesion: 0.29
Nodes (6): Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle

### Community 66 - "Profile.jsx"
Cohesion: 0.13
Nodes (5): MODE_LABELS, PerformanceMonitor(), usePerformanceMode(), supabase, authAPI

### Community 68 - "agent.mjs"
Cohesion: 0.40
Nodes (4): execute(), ORIGINS, PORT, run()

### Community 69 - "voiceController.js"
Cohesion: 0.52
Nodes (5): speakText(), transcribeSpeech(), ELEVENLABS_VOICE_CATALOG, synthesizeSpeech(), transcribeAudio()

## Knowledge Gaps
- **235 isolated node(s):** `name`, `private`, `version`, `type`, `dev` (+230 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **10 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `showToast()` connect `productivityModule.js` to `api.js`, `Settings.jsx`, `ChatMessage.jsx`?**
  _High betweenness centrality (0.321) - this node is a cross-community bridge._
- **Why does `Settings()` connect `Settings.jsx` to `Profile.jsx`, `ChatMessage.jsx`, `productivityModule.js`, `useAuthStore`, `db.js`?**
  _High betweenness centrality (0.290) - this node is a cross-community bridge._
- **Why does `logActivity()` connect `automationService.js` to `authController.js`, `RightPanel.jsx`, `mediaModule.js`, `productivityModule.js`, `automationController.js`, `browserModule.js`, `logActivity`, `studyModule.js`, `auth.js`, `cn`, `api.js`, `fileModule.js`, `ChatMessage.jsx`?**
  _High betweenness centrality (0.207) - this node is a cross-community bridge._
- **What connects `name`, `private`, `version` to the rest of the system?**
  _235 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Landing.jsx` be split into smaller, more focused modules?**
  _Cohesion score 0.14166666666666666 - nodes in this community are weakly interconnected._
- **Should `dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.04081632653061224 - nodes in this community are weakly interconnected._
- **Should `automationService.js` be split into smaller, more focused modules?**
  _Cohesion score 0.12310606060606061 - nodes in this community are weakly interconnected._