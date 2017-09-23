const logger = require('./logger.js')

class Tab {
  constructor(tab) {
    this.url = new URL(tab.url)
  }
}

const cache = new Map()

const handlers = {
  onCreated: function(tab) {
    logger.debug(`Tab ${tab.id} created.`, tab)
    cache.set(tab.id, new Tab(tab))
  },

  onRemoved: function(id, info) {
    logger.debug(`Tab ${id} removed.`)
    cache.delete(id)
  },

  onUpdated: function(id, diff, tab) {
    if(diff.hasOwnProperty('url')) {
      logger.debug(`Tab ${tab.id} updated.`, tab)
      cache.set(tab.id, new Tab(tab))
    }
  }
}

module.exports = {
  cache:    cache,
  handlers: handlers
}
