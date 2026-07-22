import express from 'express';
import { protect } from '../middleware/auth.js';
import {
  getMemories,
  createMemory,
  updateMemory,
  togglePinMemory,
  toggleArchiveMemory,
  deleteMemory,
  mergeMemories,
  exportMemories,
  importMemories,
  clearMemories,
  getBrainAnalytics,
  rebuildBrain,
  getIndexerStatusController,
  startIndexerController,
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
router.post('/import', importMemories);
router.delete('/clear', clearMemories);
router.get('/analytics', getBrainAnalytics);
router.post('/rebuild', rebuildBrain);
router.get('/indexer-status', getIndexerStatusController);
router.post('/indexer-action', startIndexerController);
router.post('/merge', mergeMemories);
router.post('/summarize-identity', summarizeIdentity);
router.get('/detect-conflicts', detectConflicts);
router.post('/auto-tag', autoTagMemory);
router.post('/learn', triggerLearning);
router.put('/:id', updateMemory);
router.put('/:id/pin', togglePinMemory);
router.put('/:id/archive', toggleArchiveMemory);
router.delete('/:id', deleteMemory);

export default router;
