/**
 * HARVOX AI — Main AI Controller Entrypoint
 * Phase 13.1 — Split into modular focused sub-controllers for high cohesion.
 */

export { getAIOptions, chatAI, getAIMetrics } from './ai/chatController.js';
export { generateCode, debugCode, explainCode } from './ai/codeController.js';
export { generateProject } from './ai/projectController.js';
export { analyzeFile } from './ai/fileAnalysisController.js';
export { transcribeSpeech, speakText } from './ai/voiceController.js';
