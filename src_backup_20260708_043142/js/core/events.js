/**
 * Lightweight Event Emitter
 */
export class EventBus {
  constructor() {
    this._listeners = new Map()
    this._onceListeners = new Map()
  }

  /**
   * Register event listener
   * @param {string} event
   * @param {Function} callback
   * @returns {Function} unsubscribe function
   */
  on(event, callback) {
    if (!this._listeners.has(event)) {
      this._listeners.set(event, new Set())
    }
    this._listeners.get(event).add(callback)
    return () => this.off(event, callback)
  }

  /**
   * Register one-time event listener
   * @param {string} event
   * @param {Function} callback
   */
  once(event, callback) {
    if (!this._onceListeners.has(event)) {
      this._onceListeners.set(event, new Set())
    }
    this._onceListeners.get(event).add(callback)
  }

  /**
   * Remove event listener
   * @param {string} event
   * @param {Function} callback
   */
  off(event, callback) {
    this._listeners.get(event)?.delete(callback)
    this._onceListeners.get(event)?.delete(callback)
  }

  /**
   * Emit event
   * @param {string} event
   * @param {*} data
   */
  emit(event, data) {
    const listeners = this._listeners.get(event)
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(data)
        } catch (error) {
          console.error(`Error in event listener for "${event}":`, error)
        }
      })
    }

    const onceListeners = this._onceListeners.get(event)
    if (onceListeners) {
      onceListeners.forEach(callback => {
        try {
          callback(data)
        } catch (error) {
          console.error(`Error in once listener for "${event}":`, error)
        }
      })
      this._onceListeners.delete(event)
    }
  }

  /**
   * Remove all listeners for an event
   * @param {string} event
   */
  removeAllListeners(event) {
    this._listeners.delete(event)
    this._onceListeners.delete(event)
  }
}