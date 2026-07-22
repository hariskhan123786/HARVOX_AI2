import express from 'express';
import {
  chatAI,
  generateCode,
  debugCode,
  explainCode,
  generateProject,
  analyzeFile,
  getAIMetrics,
  transcribeSpeech,
  speakText,
  getVoicesList,
} from '../controllers/aiController.js';
import { protect } from '../middleware/auth.js';
import { checkUsageLimit } from '../middleware/usageLimit.js';
import { upload, uploadAudio } from '../middleware/upload.js';
import { requirePro, checkSubscriptionQuota } from '../middleware/subscription.js';

const router = express.Router();

router.use(protect);
router.use(checkUsageLimit);

router.get('/metrics', getAIMetrics);
router.post('/chat', checkSubscriptionQuota('chats'), chatAI);
router.post('/generate-code', checkSubscriptionQuota('codeGen'), generateCode);
router.post('/debug', checkSubscriptionQuota('chats'), debugCode);
router.post('/explain', checkSubscriptionQuota('chats'), explainCode);
router.post('/project', requirePro, generateProject);
router.post('/analyze-file', upload.single('file'), checkSubscriptionQuota('uploads'), analyzeFile);

// ─── Phase 13.6 & 15: Voice Pipeline ──────────────────────────────────────────
router.get('/voice/voices', getVoicesList);
router.post('/voice/stt', uploadAudio.single('file'), checkSubscriptionQuota('uploads'), transcribeSpeech);
router.post('/voice/tts', speakText);

export default router;
