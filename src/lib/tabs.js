// istanbul ignore else
if(typeof URL === 'undefined') {
  URL = require('url').URL
}

class Tab {
  constructor(tab) {
    // this.tab = tab
    this.url = new URL(tab.url)
  }
}

const cache = new Map()

const handlers = {
  onCreated: function(tab) {
    // console.debug('Tab ' + tab.id + ' created: ' + tab.url)
    cache.set(tab.id, new Tab(tab))
  },

  onRemoved: function(id, info) {
    // console.debug('Tab ' + id + ' removed.')
    cache.delete(id)
  },

  onUpdated: function(id, diff, tab) {
    if(diff.hasOwnProperty('url')) {
      // console.debug('Tab ' + tab.id + ' updated: ' + tab.url)
      cache.set(tab.id, new Tab(tab))
    }
  }
}

module.exports = {
  cache:    cache,
  handlers: handlers
}
