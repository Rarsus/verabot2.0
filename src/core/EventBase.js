/**
 * Base Event Class
 * Provides reusable structure for handling Discord events
 */

/**
 * Base class for all event handlers
 */
class EventHandler {
  constructor(config) {
    this.name = config.name;
    this.once = config.once || false;
    this.execute = config.execute;
  }
}

module.exports = EventHandler;
