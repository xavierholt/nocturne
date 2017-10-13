const logger = require('./logger.js')

module.exports = class Filter {
  constructor(type, general, special = {}) {
    if(general instanceof Object) {
      special = general
      general = undefined
    }

    this.type    = type
    this.general = general
    this.special = new Map(Object.entries(special))
  }

  action(kvp) {
    return this.special.get(kvp.name) || this.general
  }

  filter(kvp) {
    let action = this.action(kvp)

    switch(action) {
    case 'allow':
    case undefined:
      return kvp.value
    case 'block':
      logger.debug(`Blocked ${this.type}: ${kvp.name}`, kvp)
      return undefined
    default:
      logger.debug(`Rewrote ${this.type}: ${kvp.name}`, {
        name:     kvp.name,
        oldvalue: kvp.value,
        newvalue: action
      })
      return action
    }
  }

  merge(other) {
    if(other.general) {
      this.general = other.general
      this.special.clear()
    }

    other.special.forEach((v, k) => {
      this.special.set(k, v)
    })
  }

  verify(kvp) {
    let action = this.action(kvp)

    switch(action) {
    case 'allow':
    case kvp.value:
    case undefined:
      break
    case 'block':
      logger.warn(`Blocked ${this.type} sent: ${kvp.name}`)
      break
    default:
      logger.warn(`Override failed for ${this.type} ${kvp.name}!`, {
        set: action,
        got: kvp.value
      })
    }
  }
}
