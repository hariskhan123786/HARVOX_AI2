import express from 'express';
import {
  chatAI,
  generateCode,
  debugCode,
  explainCode,
  generateProject,
  analyzeFile,
} from '../controllers/aiController.js';
import { protect } from '../middleware/auth.js';
import { checkUsageLimit } from '../middleware/usageLimit.js';
import { upload } from '../middleware/upload.js';
import { requirePro, checkSubscriptionQuota } from '../middleware/subscription.js';

const router = express.Router();

router.use(protect);
router.use(checkUsageLimit);

router.post('/chat', checkSubscriptionQuota('chats'), chatAI);
router.post('/generate-code', checkSubscriptionQuota('codeGen'), generateCode);
router.post('/debug', checkSubscriptionQuota('chats'), debugCode);
router.post('/explain', checkSubscriptionQuota('chats'), explainCode);
router.post('/project', requirePro, generateProject);
router.post('/analyze-file', upload.single('file'), checkSubscriptionQuota('uploads'), analyzeFile);

export default router;
