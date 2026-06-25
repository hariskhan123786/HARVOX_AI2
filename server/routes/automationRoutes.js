import express from 'express';
import { protect } from '../middleware/auth.js';
import {
  executeStep,
  getDashboardInfo,
  createTask,
  updateTask,
  deleteTask,
  logStudyProgress,
  getStudyProgress,
} from '../controllers/automationController.js';

const router = express.Router();

router.use(protect); // Ensure secure automation requests

router.post('/execute-step', executeStep);
router.get('/dashboard', getDashboardInfo);
router.post('/tasks', createTask);
router.put('/tasks/:id', updateTask);
router.delete('/tasks/:id', deleteTask);
router.post('/learning', logStudyProgress);
router.get('/learning', getStudyProgress);

export default router;
