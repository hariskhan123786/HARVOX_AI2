/**
 * HARVOX AI — Smart Workflow Engine (Phase 13.4)
 *
 * Manages compound automation sequences, custom user-defined workflows,
 * parallel execution, conditional branching, and event triggers.
 */

import { executeAutomationStep } from './automationService.js';
import { WORKFLOW_TEMPLATES } from './plannerService.js';
import AutomationPreferences from '../models/AutomationPreferences.js';
import { logActivity } from './memoryService.js';

// Active running workflows: workflowRunId -> { progress, steps, status }
const _activeRuns = new Map();

/**
 * Execute a workflow by its configuration/definition.
 * Handles parallel, sequential, and conditional step flows.
 *
 * @param {string} userId
 * @param {object} workflow - { name, steps: Array<{action, args, parallel, condition}> }
 * @returns {Promise<{success: boolean, runId: string, results: Array}>}
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
    results
  });

  await logActivity(userId, 'workflow_start', `Started workflow: "${workflow.name}"`, { runId });

  // Separate parallel and serial steps
  const serialSteps = steps.filter(s => !s.parallel);
  const parallelSteps = steps.filter(s => s.parallel);

  // 1. Run parallel batch
  if (parallelSteps.length > 0) {
    console.log(`[WorkflowEngine] Running ${parallelSteps.length} parallel steps for run: ${runId}`);
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
      console.log(`[WorkflowEngine] Running serial step: ${step.action} for run: ${runId}`);
      const res = await executeAutomationStep(userId, { action: step.action, args: step.args });
      results.push({ step: step.label || step.action, success: true, result: res });
    } catch (err) {
      results.push({ step: step.label || step.action, success: false, error: err.message });
      sequenceFailed = true;
    }
  }

  const failedCount = results.filter(r => !r.success).length;
  const status = failedCount === 0 ? 'completed' : failedCount === steps.length ? 'failed' : 'partial';

  _activeRuns.set(runId, {
    name: workflow.name,
    status,
    totalSteps: steps.length,
    completedSteps: results.filter(r => r.success).length,
    results
  });

  await logActivity(userId, 'workflow_complete', `Workflow "${workflow.name}" finished with status: ${status}`, {
    runId,
    status,
    total: steps.length,
    succeeded: steps.length - failedCount
  });

  return {
    success: failedCount === 0,
    runId,
    status,
    results
  };
}

/**
 * Execute a built-in template or user custom workflow by name/id.
 * @param {string} userId
 * @param {string} workflowIdOrName
 * @returns {Promise<object>}
 */
export async function triggerWorkflow(userId, workflowIdOrName) {
  // 1. Try built-in templates first
  if (WORKFLOW_TEMPLATES[workflowIdOrName]) {
    const template = WORKFLOW_TEMPLATES[workflowIdOrName];
    return await executeWorkflow(userId, {
      name: template.name,
      steps: template.steps
    });
  }

  // 2. Try user's custom workflows in DB
  const prefs = await AutomationPreferences.findOne({ userId });
  if (prefs) {
    const customWf = prefs.savedWorkflows.find(
      w => w.name.toLowerCase() === workflowIdOrName.toLowerCase() || w._id?.toString() === workflowIdOrName
    );
    if (customWf) {
      return await executeWorkflow(userId, {
        name: customWf.name,
        steps: customWf.steps
      });
    }
  }

  throw new Error(`Workflow "${workflowIdOrName}" not found in templates or user records.`);
}

/**
 * Fetch execution status of a running workflow.
 * @param {string} runId
 * @returns {object|null}
 */
export function getWorkflowRunStatus(runId) {
  return _activeRuns.get(runId) || null;
}

/**
 * Get all active workflow runs.
 * @returns {Array}
 */
export function getActiveWorkflowRuns() {
  return Array.from(_activeRuns.entries()).map(([runId, details]) => ({
    runId,
    ...details
  }));
}
