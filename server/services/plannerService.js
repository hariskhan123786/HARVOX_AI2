/**
 * HARVOX AI — Automation Planner Service (Phase 13.2)
 *
 * Takes a DetectedIntent and generates a human-readable execution plan
 * with steps, timing estimates, risk assessment, and rollback info.
 *
 * Pipeline:
 *   DetectedIntent → PlannerService → ExecutionPlan → (User Confirm) → Executor
 */

import { getAllActions, getSkillMeta } from './automation/automationRegistry.js';
import { INTENT_CATEGORIES } from './intentEngine.js';

// ─── Execution Plan Schema ────────────────────────────────────────────────────

/**
 * @typedef {Object} PlanStep
 * @property {number} id           - Step index (1-based)
 * @property {string} action       - Registry action key
 * @property {string[]} args       - Arguments
 * @property {string} label        - Human-readable step description
 * @property {boolean} sensitive   - Requires explicit user permission
 * @property {number} estimatedMs  - Estimated duration in milliseconds
 * @property {boolean} parallel    - Can run concurrently with other parallel steps
 * @property {string|null} rollback - Action key to undo this step (null if irreversible)
 * @property {string} risk         - 'low' | 'medium' | 'high'
 */

/**
 * @typedef {Object} ExecutionPlan
 * @property {string} planId             - Unique plan ID
 * @property {string} summary            - One-line plan description
 * @property {PlanStep[]} steps          - Ordered execution steps
 * @property {number} totalEstimatedMs   - Total estimated time in ms
 * @property {boolean} requiresConfirmation - Any sensitive steps
 * @property {string[]} warnings         - Safety warnings to show the user
 * @property {string} status             - 'pending' | 'confirmed' | 'executing' | 'done' | 'cancelled'
 * @property {string} intentCategory     - Original intent category
 * @property {string|null} workflowId    - If triggered by a workflow
 * @property {Date} createdAt            - Plan creation timestamp
 */

// ─── Built-in Workflow Templates ──────────────────────────────────────────────

export const WORKFLOW_TEMPLATES = {
  start_coding: {
    id: 'start_coding',
    name: '💻 Start Coding Session',
    description: 'Opens VS Code, your project, browser, music, and enables focus mode',
    steps: [
      { action: 'app_open',          args: ['vscode'],          label: 'Open VS Code',          sensitive: false, parallel: false },
      { action: 'browser_open',      args: ['chrome'],          label: 'Open Chrome',           sensitive: false, parallel: true  },
      { action: 'spotify_play',      args: ['coding lofi'],     label: 'Play Coding Music',     sensitive: false, parallel: true  },
      { action: 'focus_mode_enable', args: [],                  label: 'Enable Focus Mode',     sensitive: false, parallel: false },
      { action: 'prod_create_task',  args: ['Review today\'s coding goals', 'high'], label: 'Create Today\'s Task', sensitive: false, parallel: false },
    ]
  },
  study_session: {
    id: 'study_session',
    name: '📚 Study Session',
    description: 'Opens notes, browser, starts timer, enables focus mode, plays ambient music',
    steps: [
      { action: 'app_open',          args: ['notepad'],          label: 'Open Notes',             sensitive: false, parallel: false },
      { action: 'browser_open',      args: ['chrome'],           label: 'Open Browser',           sensitive: false, parallel: true  },
      { action: 'pomodoro_start',    args: ['45'],               label: 'Start 45-min Timer',     sensitive: false, parallel: false },
      { action: 'focus_mode_enable', args: [],                   label: 'Enable Focus Mode',      sensitive: false, parallel: true  },
      { action: 'spotify_play',      args: ['ambient study music'], label: 'Play Study Music',    sensitive: false, parallel: true  },
    ]
  },
  deploy_project: {
    id: 'deploy_project',
    name: '🚀 Deploy Project',
    description: 'Git add, commit, push, and trigger deployment',
    steps: [
      { action: 'git_status',  args: [],                                                     label: 'Check Git Status',   sensitive: false, parallel: false },
      { action: 'git_add',     args: ['.'],                                                  label: 'Stage All Changes',  sensitive: false, parallel: false },
      { action: 'git_commit',  args: ['Auto-deploy: ' + new Date().toISOString().split('T')[0]], label: 'Commit Changes', sensitive: true,  parallel: false },
      { action: 'git_push',    args: [],                                                     label: 'Push to Remote',     sensitive: true,  parallel: false },
    ]
  },
  morning_routine: {
    id: 'morning_routine',
    name: '🌅 Morning Routine',
    description: 'Check tasks, open email, browser, play music',
    steps: [
      { action: 'system_info',     args: [],                    label: 'Check System Status',  sensitive: false, parallel: false },
      { action: 'open_gmail',      args: [],                    label: 'Open Email',           sensitive: false, parallel: true  },
      { action: 'browser_search',  args: ['today weather'],     label: 'Check Weather',        sensitive: false, parallel: true  },
      { action: 'prod_create_task',args: ['Review morning tasks', 'medium'], label: 'Review Tasks', sensitive: false, parallel: false },
    ]
  },
  end_of_day: {
    id: 'end_of_day',
    name: '🌙 End of Day',
    description: 'Save work, commit, close apps, lock computer',
    steps: [
      { action: 'git_status',  args: [],                                                  label: 'Check for Unsaved Work', sensitive: false, parallel: false },
      { action: 'git_add',     args: ['.'],                                               label: 'Stage Changes',          sensitive: false, parallel: false },
      { action: 'git_commit',  args: ['EOD: ' + new Date().toISOString().split('T')[0]], label: 'Commit Work',            sensitive: true,  parallel: false },
      { action: 'disk_cleanup',args: [],                                                  label: 'Quick Disk Cleanup',     sensitive: false, parallel: false },
      { action: 'lock',        args: [],                                                  label: 'Lock Computer',          sensitive: false, parallel: false },
    ]
  },
};

// ─── Risk Assessment ──────────────────────────────────────────────────────────

const HIGH_RISK_ACTIONS = new Set([
  'shutdown', 'restart', 'logout', 'hibernate', 'empty_recycle_bin',
  'delete_file', 'format', 'git_push', 'deploy', 'whatsapp_send', 'compose_email'
]);

const MEDIUM_RISK_ACTIONS = new Set([
  'git_commit', 'git_add', 'create_file', 'create_folder', 'backup_project',
  'compress_folder', 'move_file', 'rename_file', 'lock', 'sleep'
]);

function assessRisk(action) {
  if (HIGH_RISK_ACTIONS.has(action)) return 'high';
  if (MEDIUM_RISK_ACTIONS.has(action)) return 'medium';
  return 'low';
}

function generatePlanId() {
  return `plan_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

// ─── Planner Core ─────────────────────────────────────────────────────────────

/**
 * Generate an execution plan from a detected intent.
 * @param {DetectedIntent} intent - Output from intentEngine.detectIntent()
 * @param {object} [context] - Additional context (userId, project info, etc.)
 * @returns {ExecutionPlan}
 */
export function generatePlan(intent, context = {}) {
  // Handle workflow intents
  if (intent.workflowId && WORKFLOW_TEMPLATES[intent.workflowId]) {
    return generateWorkflowPlan(intent.workflowId, intent);
  }

  // Chat / code / unknown — no automation steps
  if (
    intent.category === INTENT_CATEGORIES.CHAT ||
    intent.category === INTENT_CATEGORIES.CODE ||
    intent.category === INTENT_CATEGORIES.UNKNOWN ||
    intent.actions.length === 0
  ) {
    return null; // No plan needed — let AI chat handle it
  }

  const warnings = [];
  let totalMs = 0;
  let requiresConfirmation = intent.requiresConfirmation;

  const validActions = intent.actions
    .sort((a, b) => a.order - b.order)
    .filter((action) => {
      if (!getAllActions().includes(action.action)) {
        warnings.push(`⚠️ Action "${action.action}" is not registered and was skipped.`);
        return false;
      }
      return true;
    });

  const steps = validActions
    .map((action, idx) => {
      const meta = getSkillMeta(action.action);
      const estimatedMs = meta?.estimatedMs || 2000;
      const risk = assessRisk(action.action);
      totalMs += action.parallel ? 0 : estimatedMs;

      if (risk === 'high' || action.sensitive) {
        requiresConfirmation = true;
        warnings.push(`⚠️ Step ${idx + 1} ("${action.label}") is a high-risk operation.`);
      }

      return {
        id: idx + 1,
        action: action.action,
        args: action.args,
        label: action.label,
        description: action.label,
        agent: meta?.module || 'developer',
        sensitive: action.sensitive || risk === 'high',
        estimatedMs,
        parallel: action.parallel || false,
        rollback: meta?.rollbackAction || null,
        risk,
      };
    });

  if (intent.missingInfo.length > 0) {
    warnings.push(`ℹ️ Missing info: ${intent.missingInfo.join(', ')}`);
  }

  return {
    planId: generatePlanId(),
    summary: intent.summary,
    steps,
    totalEstimatedMs: totalMs,
    requiresConfirmation,
    warnings,
    status: 'pending',
    intentCategory: intent.category,
    workflowId: null,
    createdAt: new Date(),
  };
}

/**
 * Generate a plan from a predefined workflow template.
 * @param {string} workflowId
 * @param {DetectedIntent} intent
 * @returns {ExecutionPlan}
 */
export function generateWorkflowPlan(workflowId, intent = {}) {
  const template = WORKFLOW_TEMPLATES[workflowId];
  if (!template) {
    throw new Error(`Unknown workflow: ${workflowId}`);
  }

  let totalMs = 0;
  let requiresConfirmation = false;
  const warnings = [];

  const steps = template.steps.map((s, idx) => {
    const meta = getSkillMeta(s.action);
    const estimatedMs = meta?.estimatedMs || 2000;
    const risk = assessRisk(s.action);
    totalMs += s.parallel ? 0 : estimatedMs;

    if (s.sensitive || risk === 'high') {
      requiresConfirmation = true;
      warnings.push(`⚠️ Step ${idx + 1} ("${s.label}") requires confirmation.`);
    }

    return {
      id: idx + 1,
      action: s.action,
      args: s.args || [],
      label: s.label,
      description: s.label, // Align with frontend expectation
      agent: meta?.module || 'developer', // Align with frontend AGENT_BADGES
      sensitive: s.sensitive || risk === 'high',
      estimatedMs,
      parallel: s.parallel || false,
      rollback: meta?.rollbackAction || null,
      risk,
    };
  });

  return {
    planId: generatePlanId(),
    summary: template.name,
    steps,
    totalEstimatedMs: totalMs,
    requiresConfirmation,
    warnings,
    status: 'pending',
    intentCategory: INTENT_CATEGORIES.WORKFLOW,
    workflowId,
    createdAt: new Date(),
  };
}

/**
 * Format an ExecutionPlan as a human-readable text for display in chat.
 * @param {ExecutionPlan} plan
 * @returns {string}
 */
export function formatPlanForDisplay(plan) {
  const lines = [];
  const totalSec = Math.round(plan.totalEstimatedMs / 1000);

  lines.push(`**📋 Execution Plan: ${plan.summary}**`);
  lines.push(`Estimated time: ~${totalSec}s · ${plan.steps.length} step(s)`);
  if (plan.warnings.length > 0) {
    lines.push('');
    plan.warnings.forEach(w => lines.push(w));
  }
  lines.push('');
  lines.push('**Steps:**');

  plan.steps.forEach(step => {
    const riskIcon = step.risk === 'high' ? '🔴' : step.risk === 'medium' ? '🟡' : '🟢';
    const parallelTag = step.parallel ? ' *(parallel)*' : '';
    const args = step.args.length > 0 ? ` \`[${step.args.join(', ')}]\`` : '';
    lines.push(`${step.id}. ${riskIcon} **${step.label}**${args}${parallelTag}`);
  });

  if (plan.requiresConfirmation) {
    lines.push('');
    lines.push('⚠️ **This plan contains sensitive operations. Please confirm to proceed.**');
  }

  return lines.join('\n');
}

/**
 * Get all available workflow templates for display.
 * @returns {Array<{id, name, description, stepCount}>}
 */
export function getAvailableWorkflows() {
  return Object.values(WORKFLOW_TEMPLATES).map(w => ({
    id: w.id,
    name: w.name,
    description: w.description,
    stepCount: w.steps.length,
  }));
}
