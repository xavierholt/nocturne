const parse = require('./parse.js')
const rules = require('./rules.js')
const tabs  = require('./tabs.js')

const cache = new Map()

const handlers = {
  onBeforeRequest: function(request) {
    let src = undefined
    let dst = parse.url(new URL(request.url))

    if(request.tabId > 0) {
      //TODO: Potential race condition!
      src = parse.url(tabs.cache.get(request.tabId).url)
    }
    else if(request.originUrl) {
      // Workaround for #1 - no TabID for Firefox favicon GETs:
      console.warn('No TabID set - using Origin URL as source.')
      src = parse.url(new URL(request.originUrl))
    }
    else {
      console.error('Could not determine source URL!')
      console.error(request)
      src = [['?'], ['?']]
    }

    let policy = rules.get(src.concat(dst))
    //TODO: Look up policy for request type.

    if(policy) {
      cache.set(request.requestId, policy)
      return policy.onBeforeRequest(request)
    }
    else {
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
    console.warn('A request error occurred!')
    console.warn(request.error)
  }
}

module.exports = {
  cache:    cache,
  handlers: handlers
}
