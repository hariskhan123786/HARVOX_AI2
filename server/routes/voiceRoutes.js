import express from 'express';
import { protect } from '../middleware/auth.js';
import {
  getVoicePreferences,
  updateVoicePreferences,
  testVoice
} from '../controllers/voiceController.js';

const router = express.Router();
router.use(protect);

// Get user's voice preferences
router.get('/preferences', getVoicePreferences);

// Update user's voice preferences
router.put('/preferences', updateVoicePreferences);

// Test voice (for preview in settings)
router.post('/test', testVoice);

export default router;
