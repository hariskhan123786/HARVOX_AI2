import { executeAutomationStep, executeAutomationPlan, getAllModules, getAllActions } from '../services/automationService.js';
import { detectIntent, looksLikeAutomation } from '../services/intentEngine.js';
import { generatePlan, generateWorkflowPlan, formatPlanForDisplay, getAvailableWorkflows } from '../services/plannerService.js';
import { auditPlanPermissions, formatConfirmationRequest, grantSessionPermission } from '../services/permissionService.js';
import { executeRollback } from '../services/rollbackService.js';
import { triggerWorkflow, getActiveWorkflowRuns, getWorkflowRunStatus } from '../services/workflowEngine.js';
import Task from '../models/Task.js';
import LearningTrack from '../models/LearningTrack.js';
import Project from '../models/Project.js';
import Memory from '../models/Memory.js';
import AutomationPreferences from '../models/AutomationPreferences.js';
import { logActivity, getContextPrompt } from '../services/memoryService.js';
import { getAIOptions } from './aiController.js';

export const executeStep = async (req, res) => {
  try {
    const { step } = req.body;

    if (!step || !step.action) {
      return res.status(400).json({ message: 'Invalid automation step: missing required field "action".' });
    }

    // ── Schema normalisation ────────────────────────────────────────────────
    if (!Array.isArray(step.args)) {
      if (step.target !== undefined) {
        step.args = [String(step.target)];
      } else {
        step.args = [];
      }
    }

    const result = await executeAutomationStep(req.user._id, step);
    res.json(result);
  } catch (err) {
    res.status(500).json({
      message: 'Failed to execute automation step',
      error: err.message,
    });
  }
};

/**
 * Fetch all dashboard stats (tasks, projects, BSCS study tracks, recent log activity)
 */
export const getDashboardInfo = async (req, res) => {
  try {
    const userId = req.user._id;

    // 1. Fetch all tasks for checklist
    const tasks = await Task.find({ userId }).sort({ deadline: 1, createdAt: -1 });

    // 2. Fetch learning tracking progress
    const studyTrack = await LearningTrack.find({ userId });

    // 3. Fetch active projects
    const projects = await Project.find({ userId }).select('name framework updatedAt');

    // 4. Fetch telemetry / activity logs
    const activities = await Memory.find({ userId, category: 'activity' })
      .sort({ createdAt: -1 })
      .limit(15);

    res.json({
      tasks,
      studyTrack,
      projects,
      activities
    });
  } catch (err) {
    res.status(500).json({
      message: 'Failed to retrieve dashboard data',
      error: err.message,
    });
  }
};

/**
 * Task CRUD
 */
export const createTask = async (req, res) => {
  try {
    const { title, description, deadline, priority } = req.body;
    const task = await Task.create({
      userId: req.user._id,
      title,
      description,
      deadline,
      priority
    });
    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create task', error: err.message });
  }
};

export const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, deadline, priority, status } = req.body;
    const task = await Task.findOneAndUpdate(
      { _id: id, userId: req.user._id },
      { title, description, deadline, priority, status },
      { new: true }
    );
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json(task);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update task', error: err.message });
  }
};

export const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    const task = await Task.findOneAndDelete({ _id: id, userId: req.user._id });
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json({ message: 'Task deleted successfully', task });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete task', error: err.message });
  }
};

/**
 * Study Tracking
 */
export const logStudyProgress = async (req, res) => {
  try {
    const { subject, hours, notes } = req.body;
    if (!['AI', 'Database', 'Software Engineering', 'Assembly Language'].includes(subject)) {
      return res.status(400).json({ message: 'Invalid BSCS subject. Must be AI, Database, Software Engineering, or Assembly Language.' });
    }

    let track = await LearningTrack.findOne({ userId: req.user._id, subject });
    if (track) {
      track.hours += Number(hours);
      if (notes) track.notes = notes;
      track.lastStudied = new Date();
      await track.save();
    } else {
      track = await LearningTrack.create({
        userId: req.user._id,
        subject,
        hours: Number(hours),
        notes,
        lastStudied: new Date()
      });
    }

    await logActivity(req.user._id, 'log_learning', `Studied ${subject} for ${hours} hours`, { subject, hours });

    res.json(track);
  } catch (err) {
    res.status(500).json({ message: 'Failed to log study progress', error: err.message });
  }
};

export const getStudyProgress = async (req, res) => {
  try {
    const progress = await LearningTrack.find({ userId: req.user._id });
    res.json(progress);
  } catch (err) {
    res.status(500).json({ message: 'Failed to retrieve study progress', error: err.message });
  }
};

// ─── PHASE 10: New Automation Engine Endpoints ──────────────────────────────────

/**
 * GET /automation/modules
 * Returns all registered automation modules with their skills.
 */
export const getModules = async (req, res) => {
  try {
    const modules = getAllModules();
    const totalActions = getAllActions().length;
    res.json({ modules, totalActions });
  } catch (err) {
    res.status(500).json({ message: 'Failed to retrieve modules', error: err.message });
  }
};

/**
 * GET /automation/history
 * Returns recent automation activity from memory log.
 */
export const getHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    const limit = parseInt(req.query.limit || '20');

    const activities = await Memory.find({ userId, category: 'activity' })
      .sort({ createdAt: -1 })
      .limit(Math.min(limit, 50))
      .select('action summary metadata createdAt');

    res.json({ activities });
  } catch (err) {
    res.status(500).json({ message: 'Failed to retrieve history', error: err.message });
  }
};

/**
 * POST /automation/quick-action
 * Execute a single automation skill directly without a full plan.
 */
export const quickAction = async (req, res) => {
  try {
    const { action, args } = req.body;
    if (!action) return res.status(400).json({ message: 'Action is required.' });

    const step = { action, args: Array.isArray(args) ? args : (args ? [String(args)] : []) };
    const result = await executeAutomationStep(req.user._id, step);

    // Track preferences
    const prefs = await AutomationPreferences.getOrCreate(req.user._id);
    await prefs.recordRun(true).catch(() => {});

    res.json(result);
  } catch (err) {
    // Track failure
    const prefs = await AutomationPreferences.getOrCreate(req.user._id).catch(() => null);
    if (prefs) await prefs.recordRun(false).catch(() => {});

    res.status(500).json({ message: 'Quick action failed', error: err.message });
  }
};

/**
 * GET /automation/memory/preferences
 * Get user automation preferences.
 */
export const getPreferences = async (req, res) => {
  try {
    const prefs = await AutomationPreferences.getOrCreate(req.user._id);
    res.json({ preferences: prefs });
  } catch (err) {
    res.status(500).json({ message: 'Failed to retrieve preferences', error: err.message });
  }
};

/**
 * POST /automation/memory/preferences
 * Update user automation preferences.
 */
export const savePreferences = async (req, res) => {
  try {
    const userId = req.user._id;
    const {
      preferredMusicService,
      favoriteContacts,
      pomodoroMinutes,
      breakMinutes,
      permissions,
    } = req.body;

    const prefs = await AutomationPreferences.getOrCreate(userId);

    if (preferredMusicService) prefs.preferredMusicService = preferredMusicService;
    if (favoriteContacts) prefs.favoriteContacts = favoriteContacts;
    if (pomodoroMinutes) prefs.pomodoroMinutes = pomodoroMinutes;
    if (breakMinutes) prefs.breakMinutes = breakMinutes;
    if (permissions) prefs.permissions = { ...prefs.permissions, ...permissions };

    await prefs.save();
    await logActivity(userId, 'prefs_update', 'Updated automation preferences');

    res.json({ message: 'Automation preferences saved.', preferences: prefs });
  } catch (err) {
    res.status(500).json({ message: 'Failed to save preferences', error: err.message });
  }
};

/**
 * POST /automation/workflows
 * Save a reusable workflow template.
 */
export const saveWorkflow = async (req, res) => {
  try {
    const { name, description, steps } = req.body;
    if (!name || !steps?.length) {
      return res.status(400).json({ message: 'Workflow name and steps are required.' });
    }

    const prefs = await AutomationPreferences.getOrCreate(req.user._id);
    prefs.savedWorkflows.push({ name, description, steps });
    await prefs.save();

    await logActivity(req.user._id, 'workflow_save', `Saved workflow: "${name}"`, { name });
    res.status(201).json({ message: `Workflow "${name}" saved.`, workflow: prefs.savedWorkflows.at(-1) });
  } catch (err) {
    res.status(500).json({ message: 'Failed to save workflow', error: err.message });
  }
};

/**
 * GET /automation/workflows
 * Get user's saved workflow templates.
 */
export const getWorkflows = async (req, res) => {
  try {
    const prefs = await AutomationPreferences.getOrCreate(req.user._id);
    res.json({ workflows: prefs.savedWorkflows });
  } catch (err) {
    res.status(500).json({ message: 'Failed to retrieve workflows', error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Phase 13.2 — Intent Detection + Planning Pipeline
// ─────────────────────────────────────────────────────────────────────────────

/**
 * POST /automation/intent
 * Detect user intent from natural language and generate an execution plan.
 */
export const detectAndPlan = async (req, res) => {
  try {
    const userId = req.user._id;
    const { message, conversationHistory = [] } = req.body;
    if (!message) return res.status(400).json({ message: 'Message is required.' });

    let aiOptions = {};
    try { aiOptions = await getAIOptions(userId); } catch (_) {}
    const memoryContext = await getContextPrompt(userId).catch(() => '');

    const intent = await detectIntent(message, { userId, conversationHistory, memoryContext }, aiOptions);
    const plan = generatePlan(intent, { userId });

    if (!plan) {
      return res.json({ type: 'chat', intent, plan: null, displayText: null });
    }

    const permAudit = auditPlanPermissions(userId, plan.steps);
    let requiresConfirmation = plan.requiresConfirmation;
    let confirmationText = null;

    if (permAudit.blocked) {
      return res.json({ type: 'blocked', intent, plan: { ...plan, status: 'blocked' }, displayText: `❌ ${permAudit.reason}`, requiresConfirmation: false });
    }
    if (permAudit.needsConfirmation) {
      requiresConfirmation = true;
      confirmationText = formatConfirmationRequest(plan, permAudit.blockedSteps);
    }

    await logActivity(userId, 'intent_detected', `Detected: ${intent.summary}`, { category: intent.category, confidence: intent.confidence, steps: plan.steps.length });

    return res.json({ type: 'plan', intent, plan, displayText: formatPlanForDisplay(plan), requiresConfirmation, confirmationText });
  } catch (err) {
    res.status(500).json({ message: 'Intent detection failed', error: err.message });
  }
};

/**
 * POST /automation/plan/execute
 * Execute a confirmed plan (after user approves).
 */
export const executePlan = async (req, res) => {
  try {
    const userId = req.user._id;
    const { plan, grantedActions = [] } = req.body;
    if (!plan || !Array.isArray(plan.steps)) return res.status(400).json({ message: 'Valid plan with steps is required.' });

    for (const action of grantedActions) grantSessionPermission(userId, action);
    plan.status = 'executing';

    const result = await executeAutomationPlan(userId, plan);
    res.json({
      success: result.success,
      summary: result.summary,
      results: result.results.map(r => ({ step: r.step?.label, success: r.success, message: r.result?.message })),
      failed: result.failed.map(f => ({ step: f.step?.label, error: f.error })),
    });
  } catch (err) {
    res.status(500).json({ message: 'Plan execution failed', error: err.message });
  }
};

/**
 * GET /automation/workflows/builtin
 * Return all built-in workflow templates.
 */
export const getBuiltinWorkflows = async (req, res) => {
  try {
    res.json({ workflows: getAvailableWorkflows() });
  } catch (err) {
    res.status(500).json({ message: 'Failed to get workflows', error: err.message });
  }
};

/**
 * POST /automation/workflows/builtin/:id/execute
 * Execute a built-in workflow by ID (with optional confirmation bypass).
 */
export const executeBuiltinWorkflow = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;
    const { confirmed = false } = req.body;
    const plan = generateWorkflowPlan(id);

    if (!confirmed && plan.requiresConfirmation) {
      const permAudit = auditPlanPermissions(userId, plan.steps);
      if (permAudit.needsConfirmation) {
        return res.json({ type: 'needs_confirmation', plan, displayText: formatPlanForDisplay(plan), confirmationText: formatConfirmationRequest(plan, permAudit.blockedSteps) });
      }
    }
    const result = await executeAutomationPlan(userId, plan);
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: 'Workflow execution failed', error: err.message });
  }
};

/**
 * GET /automation/skills/top
 * Return most-used automation skills.
 */
export const getTopSkills = async (req, res) => {
  try {
    const { getTopSkills: topFn } = await import('../services/automation/automationRegistry.js');
    res.json({ skills: topFn(10) });
  } catch (err) {
    res.status(500).json({ message: 'Failed to get top skills', error: err.message });
  }
};

/**
 * POST /automation/rollback
 * Undo the last automation operation.
 */
export const rollback = async (req, res) => {
  try {
    const userId = req.user._id;
    const result = await executeRollback(userId);
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: 'Rollback failed', error: err.message });
  }
};

/**
 * POST /automation/workflows/custom/:id/execute
 * Execute a custom user-saved workflow by ID.
 */
export const executeCustomWorkflow = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;
    const result = await triggerWorkflow(userId, id);
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: 'Custom workflow execution failed', error: err.message });
  }
};

/**
 * GET /automation/workflows/active
 * Return all active workflow runs on the system.
 */
export const getActiveRuns = async (req, res) => {
  try {
    res.json({ runs: getActiveWorkflowRuns() });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch active runs', error: err.message });
  }
};

/**
 * GET /automation/workflows/runs/:runId
 * Return execution status for a specific workflow run.
 */
export const getRunStatus = async (req, res) => {
  try {
    const { runId } = req.params;
    const status = getWorkflowRunStatus(runId);
    if (!status) return res.status(404).json({ message: 'Run ID not found.' });
    res.json(status);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch run status', error: err.message });
  }
};

