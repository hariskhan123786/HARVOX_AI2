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
  // Phase 10
  getModules,
  getHistory,
  quickAction,
  getPreferences,
  savePreferences,
  saveWorkflow,
  getWorkflows,
  // Phase 13.2 — Intent + Planning Pipeline
  detectAndPlan,
  executePlan,
  getBuiltinWorkflows,
  executeBuiltinWorkflow,
  getTopSkills,
  rollback,
  executeCustomWorkflow,
  getActiveRuns,
  getRunStatus,
} from '../controllers/automationController.js';

const router = express.Router();

router.use(protect); // Ensure secure automation requests

// Legacy endpoints
router.post('/execute-step', executeStep);
router.get('/dashboard', getDashboardInfo);
router.post('/tasks', createTask);
router.put('/tasks/:id', updateTask);
router.delete('/tasks/:id', deleteTask);
router.post('/learning', logStudyProgress);
router.get('/learning', getStudyProgress);

// ─── Phase 10: Automation Engine ─────────────────────────────────────────────
router.get('/modules', getModules);
router.get('/history', getHistory);
router.post('/quick-action', quickAction);
router.get('/memory/preferences', getPreferences);
router.post('/memory/preferences', savePreferences);
router.get('/workflows', getWorkflows);
router.post('/workflows', saveWorkflow);

// ─── Phase 13.2: Intent Detection + Planning Pipeline ────────────────────────
router.post('/intent', detectAndPlan);           // Detect intent → generate plan
router.post('/plan/execute', executePlan);        // Execute confirmed plan
router.get('/workflows/builtin', getBuiltinWorkflows);                        // List templates
router.post('/workflows/builtin/:id/execute', executeBuiltinWorkflow);        // Run template
router.get('/skills/top', getTopSkills);         // Most-used skills analytics
router.post('/rollback', rollback);              // Undo last action

// ─── Phase 13.4: Smart Workflows ─────────────────────────────────────────────
router.post('/workflows/custom/:id/execute', executeCustomWorkflow);  // Run custom saved workflow
router.get('/workflows/active', getActiveRuns);                       // Monitor running workflows
router.get('/workflows/runs/:runId', getRunStatus);                    // Check specific run status

export default router;
