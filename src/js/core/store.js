import { EventBus } from '@core/events.js'

/**
 * Simple reactive state management with Observer pattern
 */
export class Store {
  constructor(initialState = {}) {
    this._state = { ...initialState }
    this._events = new EventBus()
  }

  /**
   * Get state value by path (supports dot notation)
   * @param {string} path
   * @param {*} defaultValue
   * @returns {*}
   */
  getState(path, defaultValue = null) {
    const keys = path.split('.')
    let value = this._state
    for (const key of keys) {
      if (value === null || value === undefined) return defaultValue
      value = value[key]
    }
    return value ?? defaultValue
  }

  /**
   * Set state value by path
   * @param {string} path
   * @param {*} value
   */
  setState(path, value) {
    const keys = path.split('.')
    let target = this._state

    for (let i = 0; i < keys.length - 1; i++) {
      if (!target[keys[i]] || typeof target[keys[i]] !== 'object') {
        target[keys[i]] = {}
      }
      target = target[keys[i]]
    }

    const oldValue = target[keys[keys.length - 1]]
    target[keys[keys.length - 1]] = value

    this._events.emit(`state:${path}`, { oldValue, newValue: value })
    this._events.emit('state:changed', { path, oldValue, newValue: value })
  }

  /**
   * Subscribe to state changes
   * @param {string} path
   * @param {Function} callback
   * @returns {Function} unsubscribe
   */
  subscribe(path, callback) {
    return this._events.on(`state:${path}`, callback)
  }

  /**
   * Subscribe to any state change
   * @param {Function} callback
   * @returns {Function} unsubscribe
   */
  subscribeAll(callback) {
    return this._events.on('state:changed', callback)
  }

  /**
   * Get entire state
   * @returns {Object}
   */
  getAllState() {
    return { ...this._state }
  }

  /**
   * Reset state
   * @param {Object} newState
   */
  reset(newState = {}) {
    this._state = { ...newState }
    this._events.emit('state:reset', this._state)
  }
}