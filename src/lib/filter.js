const logger = require('./logger.js')

module.exports = class Filter {
  constructor(type, general, special = {}) {
    if(general instanceof Object) {
      special = general
      general = undefined
    }

    this.type    = type
    this.general = general
    this.special = new Map()
    for(const [k, v] of Object.entries(special)) {
      if(v === undefined) continue
      if(v === general) continue
      this.special.set(k, v)
    }
  }

  action(kvp = undefined) {
    if(kvp !== undefined) {
      return this.special.get(kvp.name) || this.general
    }
    else if(this.special.size === 0) {
      return this.general
    }
    else {
      return undefined
    }
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
      if(v === this.general) return
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
      logger.warn(`Override failed for ${this.type}: ${kvp.name}!`, {
        set: action,
        got: kvp.value
      })
    }
  }
}
