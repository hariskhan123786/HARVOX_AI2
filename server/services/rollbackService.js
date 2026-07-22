/**
 * HARVOX AI — Central Rollback Service (Phase 13.3)
 *
 * Tracks changes made by automation steps and maintains an undo stack per operator session.
 * Allows reversing files, folders, system states, and configurations.
 */

import fs from 'fs/promises';
import path from 'path';

// userId -> Array of rollback operations: { description, undoFn }
const _rollbackStacks = new Map();

/**
 * Register a rollback operation for the current session.
 * @param {string} userId
 * @param {object} rollbackOp - { description, undoFn }
 */
export function pushRollback(userId, rollbackOp) {
  if (typeof rollbackOp.undoFn !== 'function') {
    console.warn('[RollbackService] Rejected invalid rollback operation:', rollbackOp);
    return;
  }

  if (!_rollbackStacks.has(userId)) {
    _rollbackStacks.set(userId, []);
  }

  const stack = _rollbackStacks.get(userId);
  stack.push({
    ...rollbackOp,
    timestamp: new Date()
  });

  // Limit stack size to 30 actions per user to prevent memory bloat
  if (stack.length > 30) {
    stack.shift();
  }

  console.log(`[RollbackService] Registered undo: "${rollbackOp.description}" for ${userId}`);
}

/**
 * Revert the last recorded operation.
 * @param {string} userId
 * @returns {Promise<{success: boolean, message: string}>}
 */
export async function executeRollback(userId) {
  const stack = _rollbackStacks.get(userId);
  if (!stack || stack.length === 0) {
    return { success: false, message: 'No actions to rollback in this session.' };
  }

  const op = stack.pop();
  console.log(`[RollbackService] Executing undo: "${op.description}"`);

  try {
    const result = await op.undoFn();
    return {
      success: true,
      message: `🔄 Successfully rolled back: "${op.description}". ${result?.message || ''}`
    };
  } catch (err) {
    console.error(`[RollbackService] Rollback failed for "${op.description}":`, err.message);
    // Put it back in stack in case of transient failure
    stack.push(op);
    return {
      success: false,
      message: `❌ Failed to rollback "${op.description}": ${err.message}`
    };
  }
}

/**
 * Get all undoable actions in the user's stack.
 * @param {string} userId
 * @returns {Array<{description, timestamp}>}
 */
export function getRollbackStack(userId) {
  const stack = _rollbackStacks.get(userId) || [];
  return stack.map(op => ({
    description: op.description,
    timestamp: op.timestamp
  })).reverse();
}

/**
 * Clear the rollback history for a user.
 * @param {string} userId
 */
export function clearRollbackStack(userId) {
  _rollbackStacks.delete(userId);
}
