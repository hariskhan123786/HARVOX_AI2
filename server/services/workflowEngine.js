/**
 * HARVOX AI — Smart Workflow Engine (Phase 14)
 *
 * Manages compound automation sequences, custom user-defined workflows,
 * parallel execution, conditional branching, and event triggers.
 */

import { executeAutomationStep } from './automationService.js';
import { WORKFLOW_TEMPLATES } from './plannerService.js';
import { supabase } from '../config/supabase.js';
import { logActivity } from './memoryService.js';

// Active running workflows: workflowRunId -> { progress, steps, status }
const _activeRuns = new Map();

/**
 * Execute a workflow by its configuration/definition.
 */
export async function executeWorkflow(userId, workflow) {
  const runId = `wf_run_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const steps = workflow.steps || [];
  const results = [];

  _activeRuns.set(runId, {
    name: workflow.name,
    status: 'running',
    totalSteps: steps.length,
    completedSteps: 0,
    results,
  });

  await logActivity(userId, 'workflow_start', `Started workflow: "${workflow.name}"`, { runId });

  const serialSteps = steps.filter((s) => !s.parallel);
  const parallelSteps = steps.filter((s) => s.parallel);

  // 1. Run parallel batch
  if (parallelSteps.length > 0) {
    const promises = parallelSteps.map(async (step) => {
      try {
        const res = await executeAutomationStep(userId, { action: step.action, args: step.args });
        results.push({ step: step.label || step.action, success: true, result: res });
      } catch (err) {
        results.push({ step: step.label || step.action, success: false, error: err.message });
      }
    });
    await Promise.allSettled(promises);
  }

  // 2. Run serial batch
  let sequenceFailed = false;
  for (const step of serialSteps) {
    if (sequenceFailed && step.conditionalBreak !== false) {
      results.push({ step: step.label || step.action, success: false, error: 'Cancelled due to previous step failure.' });
      continue;
    }
    try {
      const res = await executeAutomationStep(userId, { action: step.action, args: step.args });
      results.push({ step: step.label || step.action, success: true, result: res });
    } catch (err) {
      results.push({ step: step.label || step.action, success: false, error: err.message });
      sequenceFailed = true;
    }
  }

  const failedCount = results.filter((r) => !r.success).length;
  const status = failedCount === 0 ? 'completed' : failedCount === steps.length ? 'failed' : 'partial';

  _activeRuns.set(runId, {
    name: workflow.name,
    status,
    totalSteps: steps.length,
    completedSteps: results.filter((r) => r.success).length,
    results,
  });

  await logActivity(userId, 'workflow_complete', `Workflow "${workflow.name}" finished with status: ${status}`, {
    runId, status, total: steps.length, succeeded: steps.length - failedCount,
  });

  return { success: failedCount === 0, runId, status, results };
}

/**
 * Execute a built-in template or user custom workflow by name/id.
 */
export async function triggerWorkflow(userId, workflowIdOrName) {
  // 1. Try built-in templates first
  if (WORKFLOW_TEMPLATES[workflowIdOrName]) {
    const template = WORKFLOW_TEMPLATES[workflowIdOrName];
    return await executeWorkflow(userId, { name: template.name, steps: template.steps });
  }

  // 2. Try user's custom workflows from Supabase user_preferences
  const { data: prefs } = await supabase
    .from('user_preferences')
    .select('saved_workflows')
    .eq('user_id', userId)
    .maybeSingle();

  if (prefs) {
    const customWf = (prefs.saved_workflows || []).find(
      (w) => w.name?.toLowerCase() === workflowIdOrName.toLowerCase() || w._id === workflowIdOrName
    );
    if (customWf) {
      return await executeWorkflow(userId, { name: customWf.name, steps: customWf.steps });
    }
  }

  throw new Error(`Workflow "${workflowIdOrName}" not found in templates or user records.`);
}

export function getWorkflowRunStatus(runId) {
  return _activeRuns.get(runId) || null;
}

export function getActiveWorkflowRuns() {
  return Array.from(_activeRuns.entries()).map(([runId, details]) => ({ runId, ...details }));
}
