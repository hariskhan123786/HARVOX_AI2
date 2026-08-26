# Graph Report - harvox_ai  (2026-07-31)

## Corpus Check
- 207 files · ~306,236 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1427 nodes · 2770 edges · 104 communities (82 shown, 22 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 106 edges (avg confidence: 0.61)
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
- [[_COMMUNITY_clipboard.py|clipboard.py]]
- [[_COMMUNITY_processes.py|processes.py]]
- [[_COMMUNITY_test_engine.py|test_engine.py]]
- [[_COMMUNITY_commands.py|commands.py]]
- [[_COMMUNITY___init__.py|__init__.py]]
- [[_COMMUNITY___init__.py|__init__.py]]
- [[_COMMUNITY___init__.py|__init__.py]]
- [[_COMMUNITY___init__.py|__init__.py]]
- [[_COMMUNITY_detect_domain|detect_domain]]
- [[_COMMUNITY_TestSearchDomains|TestSearchDomains]]
- [[_COMMUNITY_handler|handler]]
- [[_COMMUNITY_db.js|db.js]]
- [[_COMMUNITY_rollbackService.js|rollbackService.js]]
- [[_COMMUNITY_settingsRoutes.js|settingsRoutes.js]]
- [[_COMMUNITY_voiceRoutes.js|voiceRoutes.js]]
- [[_COMMUNITY_validate_data.py|validate_data.py]]
- [[_COMMUNITY_validate_data.py|validate_data.py]]
- [[_COMMUNITY_search.py|search.py]]
- [[_COMMUNITY_search.py|search.py]]
- [[_COMMUNITY_jspdf|jspdf]]

## God Nodes (most connected - your core abstractions)
1. `logActivity()` - 177 edges
2. `runPS()` - 80 edges
3. `useAuthStore` - 37 edges
4. `VoiceConfigStore` - 26 edges
5. `getAIOptions()` - 25 edges
6. `DesignSystemGenerator` - 21 edges
7. `NeonButton()` - 21 edges
8. `VoiceProviderManager` - 21 edges
9. `GlassCard()` - 20 edges
10. `execCmd()` - 19 edges

## Surprising Connections (you probably didn't know these)
- `TestDomainDetection` --uses--> `BM25`  [INFERRED]
  agent/skills/ui-ux-pro-max/scripts/tests/test_core.py → .claude/skills/ui-ux-pro-max/scripts/core.py
- `TestPersistence` --uses--> `BM25`  [INFERRED]
  agent/skills/ui-ux-pro-max/scripts/tests/test_core.py → .claude/skills/ui-ux-pro-max/scripts/core.py
- `TestReasoningMatch` --uses--> `BM25`  [INFERRED]
  agent/skills/ui-ux-pro-max/scripts/tests/test_core.py → .claude/skills/ui-ux-pro-max/scripts/core.py
- `TestSearchDomains` --uses--> `BM25`  [INFERRED]
  agent/skills/ui-ux-pro-max/scripts/tests/test_core.py → .claude/skills/ui-ux-pro-max/scripts/core.py
- `TestTokenizer` --uses--> `BM25`  [INFERRED]
  agent/skills/ui-ux-pro-max/scripts/tests/test_core.py → .claude/skills/ui-ux-pro-max/scripts/core.py

## Import Cycles
- 3-file cycle: `server/controllers/ai/chatController.js -> server/services/postChatSummarizer.js -> server/controllers/aiController.js -> server/controllers/ai/chatController.js`
- 4-file cycle: `server/controllers/ai/chatController.js -> server/services/postChatSummarizer.js -> server/controllers/aiController.js -> server/controllers/ai/codeController.js -> server/controllers/ai/chatController.js`
- 4-file cycle: `server/controllers/ai/chatController.js -> server/services/postChatSummarizer.js -> server/controllers/aiController.js -> server/controllers/ai/fileAnalysisController.js -> server/controllers/ai/chatController.js`
- 4-file cycle: `server/controllers/ai/chatController.js -> server/services/postChatSummarizer.js -> server/controllers/aiController.js -> server/controllers/ai/projectController.js -> server/controllers/ai/chatController.js`
- 5-file cycle: `server/controllers/ai/chatController.js -> server/services/postChatSummarizer.js -> server/controllers/aiController.js -> server/controllers/ai/voiceController.js -> server/services/voiceService.js -> server/controllers/ai/chatController.js`

## Hyperedges (group relationships)
- **Harvox AI Technology Stack** — docker_compose_harvox_app, mongodb, groq_api, gemini_api [EXTRACTED 1.00]
- **Continuous Integration Pipeline** — github_workflows_ci_yml, docker_compose_yml, client_index_html [INFERRED 0.85]

## Communities (104 total, 22 thin omitted)

### Community 0 - "aiController.js"
Cohesion: 0.15
Nodes (12): MODES, ModeSelector(), DashboardLayout(), NAV_GROUPS, NavItem(), Sidebar(), HologramCard(), Magnetic() (+4 more)

### Community 1 - "Landing.jsx"
Cohesion: 0.07
Nodes (21): Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle, FOMOBadge(), HologramOrb() (+13 more)

### Community 2 - "dependencies"
Cohesion: 0.06
Nodes (32): dependencies, axios, clsx, date-fns, file-saver, framer-motion, gsap, @gsap/react (+24 more)

### Community 3 - "mediaModule.js"
Cohesion: 0.12
Nodes (19): dispatchAction(), hasAction(), _modules, registerModule(), _registry, deployRailway(), deployVercel(), __dirname (+11 more)

### Community 4 - "automationService.js"
Cohesion: 0.12
Nodes (33): openUnreadChats(), openWhatsApp(), openWhatsAppChat(), searchWhatsAppContact(), sendWhatsAppMessage(), APP_MATRIX, backupProject(), clickElement() (+25 more)

### Community 5 - "NeonButton.jsx"
Cohesion: 0.13
Nodes (11): MODE_LABELS, PerformanceMonitor(), GlassCard(), NeonButton(), PremiumLockOverlay(), languages, PRESETS, COMPLEXITY (+3 more)

### Community 6 - "Settings.jsx"
Cohesion: 0.11
Nodes (22): CATEGORIES, ModelSelector(), PROVIDER_BADGES, SPEED_COLORS, usePerformanceMode(), AI_PROVIDER_META, AI_PROVIDERS, ALL_MODELS (+14 more)

### Community 7 - "WorkspaceOS.jsx"
Cohesion: 0.11
Nodes (13): @xterm/xterm, actions, TerminalPanel(), XTerm(), Holographic3DCard(), FileExplorer(), getFileColor(), getFileIcon() (+5 more)

### Community 8 - "aiProviderManager.js"
Cohesion: 0.08
Nodes (10): calculateCost(), chat(), estimateTokens(), FAILOVER_CHAIN, MODEL_PRICING, providers, routePrompt(), saveLog() (+2 more)

### Community 9 - "App.jsx"
Cohesion: 0.07
Nodes (28): About, AdaptiveCustomCursor(), AdminDashboard, AdminPayments, AdminSettings, AdminUsers, AutomationCenter, Billing (+20 more)

### Community 10 - "dependencies"
Cohesion: 0.08
Nodes (23): dependencies, axios, cors, dotenv, express, express-rate-limit, @google/generative-ai, groq-sdk (+15 more)

### Community 11 - "productivityModule.js"
Cohesion: 0.13
Nodes (19): createReminder(), createTask(), __dirname, DISTRACTING_APPS, enableFocusMode(), enableMeetingMode(), enableStudyMode(), generateDailyPlan() (+11 more)

### Community 12 - "automationController.js"
Cohesion: 0.18
Nodes (24): createTask(), deleteTask(), getActiveRuns(), getBuiltinWorkflows(), getDashboardInfo(), getHistory(), getOrCreatePreferences(), getPreferences() (+16 more)

### Community 13 - "VoiceAssistant.jsx"
Cohesion: 0.14
Nodes (8): VoiceOrb(), AGENT_BADGES, AI_MODELS, BSCS_SUBJECTS, detectModelSwitch(), ELEVENLABS_IDS, ELEVENLABS_VOICES, VoiceAssistant()

### Community 14 - "package.json"
Cohesion: 0.06
Nodes (35): harvox-app Service, Docker Compose Configuration, Gemini AI API, Groq AI API, MongoDB, dependencies, axios, cors (+27 more)

### Community 15 - "useAuthStore"
Cohesion: 0.08
Nodes (14): jszip, AdminRoute(), ProtectedRoute(), RightPanel(), ROUTE_META, TopBar(), AutomationCenter(), callDesktopAgent() (+6 more)

### Community 17 - "browserModule.js"
Cohesion: 0.16
Nodes (21): activateWindow(), browserBookmark(), browserCloseTab(), browserDownloads(), browserNavigate(), browserNewTab(), browserNextTab(), browserReopenTab() (+13 more)

### Community 18 - "logActivity"
Cohesion: 0.10
Nodes (31): __dirname, generateApiRoute(), generateReadme(), gitAdd(), gitCommit(), gitInit(), gitPush(), gitStatus() (+23 more)

### Community 19 - "automationRegistry.js"
Cohesion: 0.12
Nodes (24): ansi_ljust(), _detect_page_type(), format_ascii_box(), format_markdown(), format_master_md(), format_page_override_md(), generate_design_system(), _generate_intelligent_overrides() (+16 more)

### Community 20 - "auth.js"
Cohesion: 0.11
Nodes (20): cancelShutdown(), emptyRecycleBin(), getClipboard(), getNetworkStatus(), getSystemInfo(), lockComputer(), logoutUser(), muteVolume() (+12 more)

### Community 21 - "server.js"
Cohesion: 0.12
Nodes (17): protect(), requireAdmin(), router, router, router, router, router, router (+9 more)

### Community 23 - "cn"
Cohesion: 0.12
Nodes (22): ansi_ljust(), _detect_page_type(), format_ascii_box(), format_master_md(), format_page_override_md(), _generate_intelligent_overrides(), hex_to_ansi(), persist_design_system() (+14 more)

### Community 24 - "api.js"
Cohesion: 0.08
Nodes (34): mediaMute(), mediaNext(), mediaPlayPause(), mediaPrev(), mediaStop(), mediaVolumeDown(), mediaVolumeUp(), openDisneyPlus() (+26 more)

### Community 25 - "fileModule.js"
Cohesion: 0.26
Nodes (14): compressFolder(), createFile(), createFolder(), deleteFile(), __dirname, extractZip(), findFile(), moveFile() (+6 more)

### Community 26 - "db.js"
Cohesion: 0.29
Nodes (5): App(), ACCENT_PALETTES, FONT_FAMILIES, FONT_SIZES, useThemeStore

### Community 27 - "Dashboard.jsx"
Cohesion: 0.10
Nodes (8): PromptBar(), C, Chat(), useMediaQuery(), Dashboard(), QUICK_COMMANDS, SUBJECT_META, chatAPI

### Community 28 - "fsController.js"
Cohesion: 0.27
Nodes (10): buildTree(), createFileOrFolder(), __dirname, ensureWorkspace(), __filename, getFileContent(), getFileTree(), getSafePath() (+2 more)

### Community 29 - "ChatMessage.jsx"
Cohesion: 0.20
Nodes (19): PERSONALITIES, PROMPTS, chatAI(), getAIOptions(), debugCode(), explainCode(), generateCode(), analyzeFile() (+11 more)

### Community 30 - "Chat.jsx"
Cohesion: 0.14
Nodes (10): DesignSystemGenerator, Find matching reasoning rule for a category., Apply reasoning rules to search results., Select best matching result based on priority keywords., Extract results list from search result dict., Generate complete design system recommendation.          variance/motion/densi, Generates design system recommendations from aggregated searches., Load reasoning rules from CSV. (+2 more)

### Community 31 - "deploy"
Cohesion: 0.20
Nodes (9): build, builder, dockerfilePath, deploy, healthcheckPath, healthcheckTimeout, restartPolicyMaxRetries, restartPolicyType (+1 more)

### Community 32 - "authController.js"
Cohesion: 0.17
Nodes (25): autoTagMemory(), clearMemories(), createMemory(), deleteMemory(), detectConflicts(), exportMemories(), getBrainAnalytics(), getIndexerStatusController() (+17 more)

### Community 33 - "RightPanel.jsx"
Cohesion: 0.14
Nodes (4): router, operatorMemories, testUsers, uploadToSupabase()

### Community 34 - "UserAnalytics.js"
Cohesion: 0.60
Nodes (5): createProject(), getProjectDetails(), getProjects(), mapProject(), updateProjectLayout()

### Community 37 - "memoryService.js"
Cohesion: 0.29
Nodes (5): BackgroundEffects(), CyberGrid(), GradientBlobs(), HologramWaves(), Starfield3D()

### Community 38 - "Client Entry Point"
Cohesion: 0.40
Nodes (5): Client Entry Point, AI Chat 3D Illustration, Holographic Brain AI Visualization, Main React Entry, CI Workflow

### Community 39 - "ChatMessage.jsx"
Cohesion: 0.10
Nodes (12): AGENT_BADGES, TaskPlanWidget(), BrainMemorySettings(), Billing(), api, authAPI, automationAPI, memoryAPI (+4 more)

### Community 48 - "Chat.jsx"
Cohesion: 0.33
Nodes (5): buildCommand, framework, installCommand, outputDirectory, rewrites

### Community 49 - "studyModule.js"
Cohesion: 0.14
Nodes (11): DesignSystemGenerator, Find matching reasoning rule for a category., Apply reasoning rules to search results., Select best matching result based on priority keywords., Extract results list from search result dict., Generate complete design system recommendation.          variance/motion/densi, Bucket a 1-10 dial value into its tier config. Returns None if value is None., Generates design system recommendations from aggregated searches. (+3 more)

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
Cohesion: 0.15
Nodes (9): BM25, _normalize(), Apply synonym substitution before tokenizing., BM25 ranking algorithm for text search, Lowercase, normalize synonyms, split, remove punctuation, filter stopwords, Build BM25 index from documents, Score all documents against query, All indexed terms, for suggestion/typo-recovery purposes. (+1 more)

### Community 63 - "PerformanceProvider.jsx"
Cohesion: 0.52
Nodes (6): getInitialProfile(), getManualProfile(), getStoredGraphicsMode(), GRAPHICS_MODES, PerformanceContext, PerformanceProvider()

### Community 64 - "card.jsx"
Cohesion: 0.19
Nodes (16): detect_domain(), _domain_keywords(), _get_bm25(), _load_csv(), _load_product_keywords(), Load CSV and return list of dicts, with mtime-based caching., Fitted BM25 index for this file+columns, with mtime-based caching., Core search function using BM25. Returns (results, bm25_or_none). (+8 more)

### Community 65 - "useThemeStore.js"
Cohesion: 0.12
Nodes (4): TestDomainDetection, TestPersistence, TestReasoningMatch, TestTokenizer

### Community 68 - "agent.mjs"
Cohesion: 0.39
Nodes (7): execute(), openUrl(), ORIGINS, PORT, run(), runPS(), shell()

### Community 69 - "voiceController.js"
Cohesion: 0.13
Nodes (17): getAIMetrics(), getVoicesList(), speakText(), transcribeSpeech(), checkSubscriptionQuota(), QUOTAS, requirePro(), storage (+9 more)

### Community 74 - "LanguageDetector.js"
Cohesion: 0.29
Nodes (7): detectLanguage(), detectLanguageAndSelectVoice(), isEnglish(), isHindi(), isUrdu(), LANGUAGE_CODES, LANGUAGE_PATTERNS

### Community 75 - "paymentRoutes.js"
Cohesion: 0.21
Nodes (12): _domain_keywords(), _get_bm25(), _load_csv(), _load_product_keywords(), Load CSV and return list of dicts, with mtime-based caching., Fitted BM25 index for this file+columns, with mtime-based caching., Core search function using BM25. Returns (results, bm25_or_none)., Nearest known vocabulary terms for a query that returned 0 hits,     so the cal (+4 more)

### Community 78 - "safe_path"
Cohesion: 0.18
Nodes (8): BM25, _normalize(), Apply synonym substitution before tokenizing., BM25 ranking algorithm for text search, Lowercase, normalize synonyms, split, remove punctuation, filter stopwords, Build BM25 index from documents, Score all documents against query, All indexed terms, for suggestion/typo-recovery purposes.

### Community 79 - "detector.py"
Cohesion: 0.23
Nodes (11): executeCustomWorkflow(), executeStep(), quickAction(), executeAutomationStep(), buildAgentProxyResponse(), DESKTOP_AGENT_ACTIONS, needsAgentProxy(), WORKFLOW_TEMPLATES (+3 more)

### Community 80 - "usePerformanceMode"
Cohesion: 0.35
Nodes (11): detectAndPlan(), executeBuiltinWorkflow(), getSkillMeta(), formatConfirmationRequest(), assessRisk(), formatPlanForDisplay(), generatePlan(), generatePlanId() (+3 more)

### Community 81 - "postChatSummarizer.js"
Cohesion: 0.44
Nodes (8): ensurePublicRecords(), forgotPassword(), getMe(), login(), register(), sendUser(), updateProfile(), router

### Community 83 - "clipboard.py"
Cohesion: 0.22
Nodes (7): executePlan(), executeAutomationPlan(), auditPlanPermissions(), checkPermission(), grantSessionPermission(), PERMISSION_POLICIES, _sessionGrants

### Community 84 - "processes.py"
Cohesion: 0.29
Nodes (8): getModules(), getAllActions(), getAllModules(), APP_MATRIX, closeApplication(), listModules(), openApplication(), resolveApp()

### Community 85 - "test_engine.py"
Cohesion: 0.22
Nodes (8): name, private, scripts, build, dev, preview, type, version

### Community 86 - "commands.py"
Cohesion: 0.42
Nodes (8): ACTION_KEYWORDS, buildChatIntent(), buildUnknownIntent(), detectIntent(), hasActionKeyword(), INTENT_CATEGORIES, looksLikeAutomation(), parseIntentJSON()

### Community 88 - "__init__.py"
Cohesion: 0.28
Nodes (4): getContextPrompt(), retrieveRelevantMemories(), CentralEventBus, eventBus

### Community 89 - "__init__.py"
Cohesion: 0.36
Nodes (4): Main search function with auto-domain detection, search(), Known query -> expected top-domain sanity checks (not exact-row pinning,     si, TestSearchDomains

### Community 90 - "__init__.py"
Cohesion: 0.29
Nodes (5): format_markdown(), generate_design_system(), Format design system as markdown., Main entry point for design system generation.      Args:         query: Sear, TestPersistence

### Community 91 - "__init__.py"
Cohesion: 0.25
Nodes (8): devDependencies, autoprefixer, postcss, tailwindcss, @types/react, @types/react-dom, vite, @vitejs/plugin-react

### Community 92 - "detect_domain"
Cohesion: 0.43
Nodes (3): detect_domain(), Auto-detect the most relevant domain from query.      Matches are weighted by, TestDomainDetection

### Community 95 - "db.js"
Cohesion: 0.60
Nodes (4): connectDB(), getDBHealth(), startServer(), runTests()

### Community 96 - "rollbackService.js"
Cohesion: 0.33
Nodes (3): rollback(), executeRollback(), _rollbackStacks

### Community 97 - "settingsRoutes.js"
Cohesion: 0.60
Nodes (4): getSettings(), mapSettings(), updateSettings(), router

### Community 98 - "voiceRoutes.js"
Cohesion: 0.53
Nodes (4): getVoicePreferences(), testVoice(), updateVoicePreferences(), router

### Community 99 - "validate_data.py"
Cohesion: 0.83
Nodes (3): _check_file(), main(), _read_rows()

### Community 100 - "validate_data.py"
Cohesion: 0.83
Nodes (3): _check_file(), main(), _read_rows()

## Knowledge Gaps
- **241 isolated node(s):** `name`, `private`, `version`, `type`, `dev` (+236 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **22 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `showToast()` connect `productivityModule.js` to `Register.jsx`, `Settings.jsx`, `ChatMessage.jsx`?**
  _High betweenness centrality (0.234) - this node is a cross-community bridge._
- **Why does `Settings()` connect `Settings.jsx` to `db.js`, `productivityModule.js`, `ChatMessage.jsx`, `useAuthStore`?**
  _High betweenness centrality (0.219) - this node is a cross-community bridge._
- **Why does `logActivity()` connect `automationService.js` to `authController.js`, `mediaModule.js`, `productivityModule.js`, `automationController.js`, `detector.py`, `usePerformanceMode`, `browserModule.js`, `logActivity`, `Register.jsx`, `processes.py`, `auth.js`, `clipboard.py`, `api.js`, `fileModule.js`, `__init__.py`, `ChatMessage.jsx`?**
  _High betweenness centrality (0.150) - this node is a cross-community bridge._
- **What connects `Apply synonym substitution before tokenizing.`, `BM25 ranking algorithm for text search`, `Lowercase, normalize synonyms, split, remove punctuation, filter stopwords` to the rest of the system?**
  _313 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `aiController.js` be split into smaller, more focused modules?**
  _Cohesion score 0.14814814814814814 - nodes in this community are weakly interconnected._
- **Should `Landing.jsx` be split into smaller, more focused modules?**
  _Cohesion score 0.06722689075630252 - nodes in this community are weakly interconnected._
- **Should `dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.0625 - nodes in this community are weakly interconnected._