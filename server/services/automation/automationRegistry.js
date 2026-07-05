/**
 * HARVOX Automation Engine — Central Skill Registry (Phase 13 Enhanced)
 *
 * Every automation module registers its skills here.
 * The dispatcher resolves action names → module handlers.
 *
 * Phase 13 Enhancement:
 *   - Richer skill schema: voiceAliases, category, permissions, rollbackAction, errorHandler
 *   - usageCount tracking per skill
 *   - getSkillMeta() exposed for permission & planner services
 */

// action → { handler, module, label, sensitive, estimatedMs, voiceAliases, category, permissions, rollbackAction, usageCount }
const _registry = new Map();
// moduleName → { name, icon, description, skills[] }
const _modules = new Map();

/**
 * Register an automation module and its skills.
 *
 * @param {string} moduleName - e.g. 'media', 'browser', 'system'
 * @param {object} moduleMeta - { name, icon, description }
 * @param {Array}  skills     - Array of skill definitions
 *
 * Skill schema (Phase 13):
 * {
 *   action:         string    — registry key (required)
 *   label:          string    — human-readable name
 *   handler:        function  — async (userId, args) → { success, message, ... }
 *   sensitive?:     boolean   — requires user confirmation (default: false)
 *   estimatedMs?:   number    — estimated execution time in ms (default: 2000)
 *   voiceAliases?:  string[]  — voice trigger phrases
 *   category?:      string    — skill category for UI grouping
 *   permissions?:   string[]  — permission keys required (e.g. ['system.shutdown'])
 *   rollbackAction?:string    — action key to undo this skill (null = irreversible)
 *   errorHandler?:  function  — async (userId, error, args) — optional custom error handler
 *   platforms?:     string[]  — supported platforms ['windows','mac','linux'] (default: all)
 * }
 */
export function registerModule(moduleName, moduleMeta, skills) {
  const registeredSkills = [];

  for (const skill of skills) {
    if (!skill.action || typeof skill.handler !== 'function') {
      console.warn(`[AutomationRegistry] Skipping invalid skill in module '${moduleName}':`, skill);
      continue;
    }

    _registry.set(skill.action, {
      handler: skill.handler,
      module: moduleName,
      label: skill.label || skill.action,
      sensitive: skill.sensitive === true,
      estimatedMs: skill.estimatedMs || 2000,
      voiceAliases: Array.isArray(skill.voiceAliases) ? skill.voiceAliases : [],
      category: skill.category || 'general',
      permissions: Array.isArray(skill.permissions) ? skill.permissions : [],
      rollbackAction: skill.rollbackAction || null,
      errorHandler: typeof skill.errorHandler === 'function' ? skill.errorHandler : null,
      platforms: Array.isArray(skill.platforms) ? skill.platforms : ['windows', 'mac', 'linux'],
      usageCount: 0,
    });

    registeredSkills.push({
      action: skill.action,
      label: skill.label || skill.action,
      sensitive: skill.sensitive === true,
      estimatedMs: skill.estimatedMs || 2000,
      voiceAliases: Array.isArray(skill.voiceAliases) ? skill.voiceAliases : [],
      category: skill.category || 'general',
      permissions: Array.isArray(skill.permissions) ? skill.permissions : [],
      rollbackAction: skill.rollbackAction || null,
      platforms: Array.isArray(skill.platforms) ? skill.platforms : ['windows', 'mac', 'linux'],
    });
  }

  _modules.set(moduleName, {
    ...moduleMeta,
    moduleName,
    skills: registeredSkills,
  });

  console.log(`[AutomationRegistry] Module '${moduleName}' registered with ${registeredSkills.length} skills.`);
}

/**
 * Dispatch an automation action to the correct module handler.
 *
 * @param {string} userId
 * @param {object} step - { action, args, target }
 * @returns {Promise<object>} - { success, message, output? }
 */
export async function dispatchAction(userId, step) {
  const { action } = step;
  const entry = _registry.get(action);

  if (!entry) {
    throw new Error(`No registered skill for action: '${action}'. Available: ${[...getAllActions().slice(0, 10)].join(', ')}...`);
  }

  // Normalize args
  let args = [];
  if (Array.isArray(step.args) && step.args.length > 0) {
    args = step.args.map(String);
  } else if (step.target) {
    args = [String(step.target)];
  }

  console.log(`[AutomationRegistry] Dispatching '${action}' (module: ${entry.module}) args=${JSON.stringify(args)}`);

  try {
    // Increment usage count
    entry.usageCount = (entry.usageCount || 0) + 1;

    const result = await entry.handler(userId, args);
    return result;
  } catch (err) {
    // Use custom error handler if provided
    if (entry.errorHandler) {
      return await entry.errorHandler(userId, err, args);
    }
    throw err;
  }
}

/**
 * Check if a skill is registered.
 * @param {string} action
 * @returns {boolean}
 */
export function hasAction(action) {
  return _registry.has(action);
}

/**
 * Get full skill metadata (sensitive flag, estimatedMs, voiceAliases, etc.)
 * Used by PermissionService and PlannerService.
 * @param {string} action
 * @returns {object|null}
 */
export function getSkillMeta(action) {
  const entry = _registry.get(action);
  if (!entry) return null;
  const { handler, errorHandler, ...meta } = entry;
  return meta;
}

/**
 * Get all registered modules with their skills.
 * @returns {Array}
 */
export function getAllModules() {
  return Array.from(_modules.values());
}

/**
 * Get a flat list of all registered action keys.
 * @returns {string[]}
 */
export function getAllActions() {
  return Array.from(_registry.keys());
}

/**
 * Get top N most-used skills across all modules.
 * @param {number} n
 * @returns {Array<{action, label, module, usageCount}>}
 */
export function getTopSkills(n = 10) {
  return Array.from(_registry.entries())
    .map(([action, entry]) => ({
      action,
      label: entry.label,
      module: entry.module,
      usageCount: entry.usageCount || 0,
    }))
    .sort((a, b) => b.usageCount - a.usageCount)
    .slice(0, n);
}

/**
 * Find skills matching a voice alias phrase.
 * @param {string} phrase - Spoken phrase (lowercased)
 * @returns {string[]} matching action keys
 */
export function findByVoiceAlias(phrase) {
  const lowerPhrase = phrase.toLowerCase();
  const matches = [];
  for (const [action, entry] of _registry.entries()) {
    if (entry.voiceAliases.some(alias => lowerPhrase.includes(alias.toLowerCase()))) {
      matches.push(action);
    }
  }
  return matches;
}
