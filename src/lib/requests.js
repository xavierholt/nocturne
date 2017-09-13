const parse   = require('./parse.js')
const Ruleset = require('./ruleset.js')
const tabs    = require('./tabs.js')

const cache = new Map()
let   rules = new Ruleset()

const handlers = {
  onBeforeRequest: function(request) {
    let src = undefined
    let dst = new URL(request.url)

    if(request.tabId > 0) {
      // NOTE: Potential race condition!
      // What's the tab URL of a main_frame request?
      let tab = tabs.cache.get(request.tabId)
      // TODO: Add request logging to the tab cache.
      src = tab.url
    }
    else if(request.originUrl) {
      // Workaround for #1 - no TabID for Firefox favicon GETs:
      console.warn('No TabID set - using Origin URL as source.')
      src = new URL(request.originUrl)
    }
    else {
      // We should never get here...
      console.error('Could not determine source URL!')
      console.error(request)
    }

    let policy = rules.get(src, dst)
    // TODO: Look up policy by request type.

    if(policy) {
      cache.set(request.requestId, policy)
      return policy.onBeforeRequest(request)
    }
    else {
      // Once we get default rules this will be unnecessary...
      console.error('No rule matches this request!')
      console.error(request)
    }
  },

  onBeforeSendHeaders: function(request) {
    const policy = cache.get(request.requestId)
    if(policy) return policy.onBeforeSendHeaders(request)
  },

  onSendHeaders: function(request) {
    const policy = cache.get(request.requestId)
    if(policy) return policy.onSendHeaders(request)
  },

  onHeadersReceived: function(request) {
    const policy = cache.get(request.requestId)
    if(policy) return policy.onHeadersReceived(request)
  },

  onCompleted: function(request) {
    tabs.cache.delete(request.tabId)
  },

  onErrorOccurred: function(request) {
    tabs.cache.delete(request.tabId)
    // console.warn('A request error occurred!')
    // console.warn(request.error)
  }
}

module.exports = {
  cache:    cache,
  handlers: handlers
}
