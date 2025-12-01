// eventBus.js
const EventEmitter = require('events');

class EventBus extends EventEmitter {
  constructor() {
    super();
    // keep a small in-memory log for quick inspection (capped)
    this.log = [];
    this.maxLog = 200;
  }

  publish(action) {
    // minimal validation
    if (!action || !action.type || !action.userId) return;
    action.timestamp = Date.now();
    this.log.push(action);
    if (this.log.length > this.maxLog) this.log.shift();
    this.emit('action', action);
  }

  getLog() {
    return this.log.slice().reverse(); // newest first
  }
}

module.exports = new EventBus();
