import { executeAutomationStep, executeAutomationPlan, getAllModules, getAllActions } from '../services/automationService.js';
import { detectIntent, looksLikeAutomation } from '../services/intentEngine.js';
import { generatePlan, generateWorkflowPlan, formatPlanForDisplay, getAvailableWorkflows } from '../services/plannerService.js';
import { auditPlanPermissions, formatConfirmationRequest, grantSessionPermission } from '../services/permissionService.js';
import { executeRollback } from '../services/rollbackService.js';
import { triggerWorkflow, getActiveWorkflowRuns, getWorkflowRunStatus } from '../services/workflowEngine.js';
import { supabase } from '../config/supabase.js';
import { logActivity, getContextPrompt } from '../services/memoryService.js';
import { getAIOptions } from './ai/chatController.js';
import { needsAgentProxy, buildAgentProxyResponse } from '../services/desktopAgent.js';

// Mappers for compatibility
const mapTask = (t) => {
  if (!t) return null;
  return {
    _id: t.id,
    id: t.id,
    userId: t.user_id,
    title: t.title,
    description: t.description,
    deadline: t.deadline,
    status: t.status,
    priority: t.priority,
    createdAt: t.created_at,
    updatedAt: t.updated_at,
  };
};

const mapLearningTrack = (l) => {
  if (!l) return null;
  return {
    _id: l.id,
    id: l.id,
    userId: l.user_id,
    subject: l.subject,
    hours: Number(l.hours || 0),
    notes: l.notes,
    lastStudied: l.last_studied,
    createdAt: l.created_at,
    updatedAt: l.updated_at,
  };
};

const mapMemory = (m) => {
  if (!m) return null;
  return {
    _id: m.id,
    id: m.id,
    userId: m.user_id,
    category: m.category,
    key: m.key,
    value: m.value,
    isPinned: m.is_pinned,
    metadata: m.metadata,
    createdAt: m.created_at,
    updatedAt: m.updated_at,
  };
};

const mapPreferences = (p) => {
  if (!p) return null;
  return {
    _id: p.id,
    id: p.id,
    userId: p.user_id,
    preferredMusicService: p.preferred_music_service,
    favoriteContacts: p.favorite_contacts || [],
    frequentApps: p.frequent_apps || [],
    frequentSites: p.frequent_sites || [],
    savedWorkflows: p.saved_workflows || [],
    pomodoroMinutes: p.pomodoro_minutes,
    breakMinutes: p.break_minutes,
    stats: p.stats,
    permissions: p.permissions,
    createdAt: p.created_at,
    updatedAt: p.updated_at,
  };
};

const getOrCreatePreferences = async (userId) => {
  const { data: existing, error } = await supabase
    .from('user_preferences')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (existing) return existing;

  const { data: created, error: createError } = await supabase
    .from('user_preferences')
    .insert({ user_id: userId })
    .select('*')
    .single();

  if (createError) throw createError;
  return created;
};

const recordRunInPrefs = async (userId, success = true) => {
  try {
    const prefs = await getOrCreatePreferences(userId);
    const stats = prefs.stats || { totalRuns: 0, successCount: 0, failureCount: 0 };
    stats.totalRuns = (stats.totalRuns || 0) + 1;
    if (success) {
      stats.successCount = (stats.successCount || 0) + 1;
    } else {
      stats.failureCount = (stats.failureCount || 0) + 1;
    }
    await supabase
      .from('user_preferences')
      .update({ stats, updated_at: new Date() })
      .eq('user_id', userId);
  } catch (err) {
    console.error('Failed to record run stats in preferences:', err.message);
  }
};

export const executeStep = async (req, res) => {
  try {
    const { step } = req.body;

    if (!step || !step.action) {
      return res.status(400).json({ message: 'Invalid automation step: missing required field "action".' });
    }

    if (!Array.isArray(step.args)) {
      if (step.target !== undefined) {
        step.args = [String(step.target)];
      } else {
        step.args = [];
      }
    }

    // ── Production: Route desktop-level actions to the local agent ──────────
    if (needsAgentProxy(step.action)) {
      return res.json(buildAgentProxyResponse(step.action, step.args));
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


export const getDashboardInfo = async (req, res) => {
  try {
    const userId = req.user._id;

    // 1. Fetch tasks
    const { data: tasks, error: tasksErr } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .order('deadline', { ascending: true })
      .order('created_at', { ascending: false });

    if (tasksErr) throw tasksErr;

    // 2. Fetch learning tracks
    const { data: studyTrack, error: studyErr } = await supabase
      .from('learning_tracks')
      .select('*')
      .eq('user_id', userId);

    if (studyErr) throw studyErr;

    // 3. Fetch active projects
    const { data: projects, error: projErr } = await supabase
      .from('projects')
      .select('id, name, framework, updated_at')
      .eq('user_id', userId);

    if (projErr) throw projErr;

    // 4. Fetch telemetry / activity logs (stored in brain_memory as activities)
    const { data: activities, error: actErr } = await supabase
      .from('brain_memory')
      .select('*')
      .eq('user_id', userId)
      .eq('category', 'activity')
      .order('created_at', { ascending: false })
      .limit(15);

    if (actErr) throw actErr;

    res.json({
      tasks: (tasks || []).map(mapTask),
      studyTrack: (studyTrack || []).map(mapLearningTrack),
      projects: (projects || []).map(p => ({ _id: p.id, name: p.name, framework: p.framework, updatedAt: p.updated_at })),
      activities: (activities || []).map(mapMemory),
    });
  } catch (err) {
    res.status(500).json({
      message: 'Failed to retrieve dashboard data',
      error: err.message,
    });
  }
};

export const createTask = async (req, res) => {
  try {
    const { title, description, deadline, priority } = req.body;
    const { data: task, error } = await supabase
      .from('tasks')
      .insert({
        user_id: req.user._id,
        title,
        description,
        deadline: deadline || null,
        priority: priority || 'medium',
      })
      .select('*')
      .single();

    if (error) throw error;
    res.status(201).json(mapTask(task));
  } catch (err) {
    res.status(500).json({ message: 'Failed to create task', error: err.message });
  }
};

export const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, deadline, priority, status } = req.body;

    const updates = {};
    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (deadline !== undefined) updates.deadline = deadline || null;
    if (priority !== undefined) updates.priority = priority;
    if (status !== undefined) updates.status = status;

    const { data: task, error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', id)
      .eq('user_id', req.user._id)
      .select('*')
      .single();

    if (error) return res.status(404).json({ message: 'Task not found' });
    res.json(mapTask(task));
  } catch (err) {
    res.status(500).json({ message: 'Failed to update task', error: err.message });
  }
};

export const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { data: task, error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id)
      .eq('user_id', req.user._id)
      .select('*')
      .single();

    if (error) return res.status(404).json({ message: 'Task not found' });
    res.json({ message: 'Task deleted successfully', task: mapTask(task) });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete task', error: err.message });
  }
};

export const logStudyProgress = async (req, res) => {
  try {
    const userId = req.user._id;
    const { subject, hours, notes } = req.body;
    if (!['AI', 'Database', 'Software Engineering', 'Assembly Language'].includes(subject)) {
      return res.status(400).json({ message: 'Invalid BSCS subject. Must be AI, Database, Software Engineering, or Assembly Language.' });
    }

    // Upsert study progress
    // Fetch first to see current hours
    const { data: existing } = await supabase
      .from('learning_tracks')
      .select('*')
      .eq('user_id', userId)
      .eq('subject', subject)
      .maybeSingle();

    let track;
    if (existing) {
      const { data, error } = await supabase
        .from('learning_tracks')
        .update({
          hours: Number(existing.hours || 0) + Number(hours),
          notes: notes || existing.notes,
          last_studied: new Date(),
        })
        .eq('id', existing.id)
        .select('*')
        .single();
      
      if (error) throw error;
      track = data;
    } else {
      const { data, error } = await supabase
        .from('learning_tracks')
        .insert({
          user_id: userId,
          subject,
          hours: Number(hours),
          notes: notes || '',
          last_studied: new Date(),
        })
        .select('*')
        .single();

      if (error) throw error;
      track = data;
    }

    await logActivity(userId, 'log_learning', `Studied ${subject} for ${hours} hours`, { subject, hours });

    res.json(mapLearningTrack(track));
  } catch (err) {
    res.status(500).json({ message: 'Failed to log study progress', error: err.message });
  }
};

export const getStudyProgress = async (req, res) => {
  try {
    const { data: progress, error } = await supabase
      .from('learning_tracks')
      .select('*')
      .eq('user_id', req.user._id);

    if (error) throw error;
    res.json((progress || []).map(mapLearningTrack));
  } catch (err) {
    res.status(500).json({ message: 'Failed to retrieve study progress', error: err.message });
  }
};

export const getModules = async (req, res) => {
  try {
    const modules = getAllModules();
    const totalActions = getAllActions().length;
    res.json({ modules, totalActions });
  } catch (err) {
    res.status(500).json({ message: 'Failed to retrieve modules', error: err.message });
  }
};

export const getHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    const limit = parseInt(req.query.limit || '20');

    const { data: activities, error } = await supabase
      .from('brain_memory')
      .select('id, key, value, metadata, created_at')
      .eq('user_id', userId)
      .eq('category', 'activity')
      .order('created_at', { ascending: false })
      .limit(Math.min(limit, 50));

    if (error) throw error;

    res.json({
      activities: (activities || []).map(a => ({
        _id: a.id,
        action: a.key,
        summary: a.value,
        metadata: a.metadata,
        createdAt: a.created_at,
      })),
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to retrieve history', error: err.message });
  }
};

export const quickAction = async (req, res) => {
  try {
    const { action, args } = req.body;
    if (!action) return res.status(400).json({ message: 'Action is required.' });

    const safeArgs = Array.isArray(args) ? args : (args ? [String(args)] : []);

    // ── Production: Route desktop-level actions to the local agent ──────────
    if (needsAgentProxy(action)) {
      return res.json(buildAgentProxyResponse(action, safeArgs));
    }

    const step = { action, args: safeArgs };
    const result = await executeAutomationStep(req.user._id, step);

    await recordRunInPrefs(req.user._id, true);

    res.json(result);
  } catch (err) {
    await recordRunInPrefs(req.user._id, false);
    res.status(500).json({ message: 'Quick action failed', error: err.message });
  }
};

export const getPreferences = async (req, res) => {
  try {
    const prefs = await getOrCreatePreferences(req.user._id);
    res.json({ preferences: mapPreferences(prefs) });
  } catch (err) {
    res.status(500).json({ message: 'Failed to retrieve preferences', error: err.message });
  }
};

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

    const prefs = await getOrCreatePreferences(userId);

    const updates = {};
    if (preferredMusicService) updates.preferred_music_service = preferredMusicService;
    if (favoriteContacts) updates.favorite_contacts = favoriteContacts;
    if (pomodoroMinutes) updates.pomodoro_minutes = pomodoroMinutes;
    if (breakMinutes) updates.break_minutes = breakMinutes;
    if (permissions) updates.permissions = { ...prefs.permissions, ...permissions };

    const { data: updatedPrefs, error } = await supabase
      .from('user_preferences')
      .update(updates)
      .eq('user_id', userId)
      .select('*')
      .single();

    if (error) throw error;

    await logActivity(userId, 'prefs_update', 'Updated automation preferences');

    res.json({ message: 'Automation preferences saved.', preferences: mapPreferences(updatedPrefs) });
  } catch (err) {
    res.status(500).json({ message: 'Failed to save preferences', error: err.message });
  }
};

export const saveWorkflow = async (req, res) => {
  try {
    const { name, description, steps } = req.body;
    if (!name || !steps?.length) {
      return res.status(400).json({ message: 'Workflow name and steps are required.' });
    }

    const prefs = await getOrCreatePreferences(req.user._id);
    const workflows = prefs.saved_workflows || [];
    
    // Create new workflow item
    const newWorkflow = {
      _id: `wf_${Date.now()}`,
      name,
      description,
      steps,
      createdAt: new Date().toISOString(),
    };
    
    workflows.push(newWorkflow);

    const { data: updatedPrefs, error } = await supabase
      .from('user_preferences')
      .update({ saved_workflows: workflows })
      .eq('user_id', req.user._id)
      .select('*')
      .single();

    if (error) throw error;

    await logActivity(req.user._id, 'workflow_save', `Saved workflow: "${name}"`, { name });
    
    res.status(201).json({
      message: `Workflow "${name}" saved.`,
      workflow: newWorkflow,
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to save workflow', error: err.message });
  }
};

export const getWorkflows = async (req, res) => {
  try {
    const prefs = await getOrCreatePreferences(req.user._id);
    res.json({ workflows: prefs.saved_workflows || [] });
  } catch (err) {
    res.status(500).json({ message: 'Failed to retrieve workflows', error: err.message });
  }
};

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

export const getBuiltinWorkflows = async (req, res) => {
  try {
    res.json({ workflows: getAvailableWorkflows() });
  } catch (err) {
    res.status(500).json({ message: 'Failed to get workflows', error: err.message });
  }
};

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

export const getTopSkills = async (req, res) => {
  try {
    const { getTopSkills: topFn } = await import('../services/automation/automationRegistry.js');
    res.json({ skills: topFn(10) });
  } catch (err) {
    res.status(500).json({ message: 'Failed to get top skills', error: err.message });
  }
};

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

export const getActiveRuns = async (req, res) => {
  try {
    res.json({ runs: getActiveWorkflowRuns() });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch active runs', error: err.message });
  }
};

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
