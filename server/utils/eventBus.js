/**
 * HARVOX AI — Central Event Bus
 * Decouples cross-cutting concerns like activity logging, telemetry, achievement updates,
 * and user notifications from core business logic and automation scripts.
 */

import { EventEmitter } from 'events';

class CentralEventBus extends EventEmitter {
  constructor() {
    super();
    // Increase limit to prevent listener warnings in complex workflows
    this.setMaxListeners(50);
  }

  /**
   * Helper to emit activity logging events.
   * @param {string} userId
   * @param {string} actionKey
   * @param {string} description
   * @param {object} [details={}]
   */
  emitActivity(userId, actionKey, description, details = {}) {
    this.emit('activity', { userId, actionKey, description, details });
  }

  /**
   * Helper to emit custom system/user alerts.
   * @param {string} userId
   * @param {string} type - 'info' | 'warning' | 'error' | 'success'
   * @param {string} message
   */
  emitAlert(userId, type, message) {
    this.emit('alert', { userId, type, message });
  }
}

export const eventBus = new CentralEventBus();
export default eventBus;
