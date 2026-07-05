/**
 * HARVOX AI — Permission Service (Phase 13.2)
 *
 * Manages permission grants for sensitive automation actions.
 * Ensures the user is always asked before destructive operations.
 *
 * Permission levels:
 *   - 'always_ask'   : Every time, ask the user
 *   - 'session'      : Ask once per server session
 *   - 'always_allow' : User has granted permanent permission
 *   - 'always_deny'  : User has denied this action permanently
 */

import { logActivity } from './memoryService.js';

// ─── In-Memory Session Grants ─────────────────────────────────────────────────
// Key: `${userId}:${action}` → 'session_allow' | 'session_deny'
const _sessionGrants = new Map();

// ─── Sensitive Action Definitions ────────────────────────────────────────────

/**
 * Default permission policy per action.
 * 'always_ask' = confirm every time (highest safety)
 * 'session'    = ask once per session
 */
export const PERMISSION_POLICIES = {
  // Power — always ask, every time
  shutdown: 'always_ask',
  restart: 'always_ask',
  hibernate: 'always_ask',
  logout: 'always_ask',
  empty_recycle_bin: 'always_ask',

  // File destruction — always ask
  delete_file: 'always_ask',
  format_drive: 'always_ask',

  // Communication — always ask (never auto-send)
  whatsapp_send: 'always_ask',
  compose_email: 'always_ask',
  send_email: 'always_ask',

  // Code deployment — ask once per session
  git_push: 'session',
  git_commit: 'session',
  deploy: 'session',
  run_command: 'session',
  shell_command: 'session',
  install_package: 'session',

  // Moderate risk — ask once per session
  backup_project: 'session',
  move_file: 'session',
  rename_file: 'session',

  // Everything else — no confirmation needed
  _default: 'allow',
};

// ─── Permission Check ─────────────────────────────────────────────────────────

/**
 * Check if a user has permission to execute an action.
 * @param {string} userId
 * @param {string} action - Registry action key
 * @returns {'allow' | 'deny' | 'needs_confirmation'}
 */
export function checkPermission(userId, action) {
  const policy = PERMISSION_POLICIES[action] || PERMISSION_POLICIES._default;

  if (policy === 'allow') return 'allow';

  const sessionKey = `${userId}:${action}`;
  const sessionGrant = _sessionGrants.get(sessionKey);

  if (sessionGrant === 'session_allow') return 'allow';
  if (sessionGrant === 'session_deny') return 'deny';

  // Needs user confirmation
  return 'needs_confirmation';
}

/**
 * Grant session-level permission for an action.
 * @param {string} userId
 * @param {string} action
 */
export function grantSessionPermission(userId, action) {
  _sessionGrants.set(`${userId}:${action}`, 'session_allow');
  console.log(`[PermissionService] Session grant: ${userId}:${action}`);
}

/**
 * Deny session-level permission for an action.
 * @param {string} userId
 * @param {string} action
 */
export function denySessionPermission(userId, action) {
  _sessionGrants.set(`${userId}:${action}`, 'session_deny');
  console.log(`[PermissionService] Session deny: ${userId}:${action}`);
}

/**
 * Clear all session permissions for a user (e.g. on logout).
 * @param {string} userId
 */
export function clearSessionPermissions(userId) {
  for (const key of _sessionGrants.keys()) {
    if (key.startsWith(`${userId}:`)) {
      _sessionGrants.delete(key);
    }
  }
}

/**
 * Check all steps in a plan and return which ones need confirmation.
 * @param {string} userId
 * @param {PlanStep[]} steps
 * @returns {{ needsConfirmation: boolean, blockedSteps: PlanStep[] }}
 */
export function auditPlanPermissions(userId, steps) {
  const blockedSteps = [];

  for (const step of steps) {
    if (step.sensitive) {
      const status = checkPermission(userId, step.action);
      if (status === 'needs_confirmation') {
        blockedSteps.push(step);
      } else if (status === 'deny') {
        return {
          needsConfirmation: false,
          blocked: true,
          blockedSteps: [step],
          reason: `Action "${step.action}" is denied for this session.`
        };
      }
    }
  }

  return {
    needsConfirmation: blockedSteps.length > 0,
    blocked: false,
    blockedSteps,
  };
}

/**
 * Format a confirmation request message for the user.
 * @param {ExecutionPlan} plan
 * @param {PlanStep[]} blockedSteps - Steps requiring confirmation
 * @returns {string}
 */
export function formatConfirmationRequest(plan, blockedSteps) {
  const lines = [
    `**🔐 Permission Required**`,
    `Plan: **${plan.summary}**`,
    '',
    `The following step(s) require your confirmation:`,
  ];

  blockedSteps.forEach(step => {
    const argsStr = step.args.length > 0 ? ` (${step.args.join(', ')})` : '';
    lines.push(`- 🔴 **${step.label}**${argsStr} — risk: ${step.risk}`);
  });

  lines.push('');
  lines.push('Reply **"yes"** to approve, **"no"** to cancel, or **"skip"** to skip sensitive steps.');

  return lines.join('\n');
}
