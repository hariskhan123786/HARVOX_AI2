import express from 'express';
import { protect } from '../middleware/auth.js';
import {
  getMemories,
  createMemory,
  updateMemory,
  togglePinMemory,
  deleteMemory,
  exportMemories,
  summarizeIdentity,
  detectConflicts,
  autoTagMemory,
  triggerLearning
} from '../controllers/memoryController.js';

const router = express.Router();

router.use(protect); // Secure all memory routes

router.get('/', getMemories);
router.post('/', createMemory);
router.get('/export', exportMemories);
router.post('/summarize-identity', summarizeIdentity);
router.get('/detect-conflicts', detectConflicts);
router.post('/auto-tag', autoTagMemory);
router.post('/learn', triggerLearning);          // Trigger ML learning on activity logs
router.put('/:id', updateMemory);
router.put('/:id/pin', togglePinMemory);
router.delete('/:id', deleteMemory);

export default router;
