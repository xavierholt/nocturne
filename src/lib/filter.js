const logger = require('./logger.js')

module.exports = class Filter {
  constructor(type, dfault = 'allow', special = {}) {
    this.type    = type
    this.dfault  = dfault
    this.special = new Map(Object.entries(special))
  }

  action(kvp) {
    return this.special.get(kvp.name) || this.dfault
  }

  filter(kvp) {
    let action = this.action(kvp)

    switch(action) {
    case 'allow':
      return kvp.value
    case 'block':
      return undefined
    default:
      return action
    }
  }

  verify(kvp) {
    let action = this.action(kvp)

    switch(action) {
    case 'allow':
    case kvp.value:
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
