import express from 'express';
import { protect } from '../middleware/auth.js';
import { getSettings, updateSettings } from '../controllers/settingsController.js';

const router = express.Router();
router.use(protect);

router.get('/', getSettings);
router.put('/', updateSettings);

export default router;
