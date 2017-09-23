const logger  = require('./logger.js')
const parse   = require('./parse.js')
const Ruleset = require('./ruleset.js')
const tab     = require('./tab.js')

const cache = new Map()
let   rules = new Ruleset()

function source(request) {
  if(request.tabId > 0) {
    // NOTE: Potential race condition!
    // What's the tab URL of a main_frame request?
    let srctab = tab.cache.get(request.tabId)
    if(srctab === undefined) {
      logger.error('No such tab cached!', request)
    }
    else {
      return srctab.url
    }
  }

  if(request.originUrl) {
    // Workaround for #1 - no TabID for Firefox favicon GETs:
    logger.warn('Using Origin URL as source.', request)
    return new URL(request.originUrl)
  }

  // We should never get here...
  logger.error('Could not determine source URL!', request)
  return undefined
}

const handlers = {
  onBeforeRequest: function(request) {
    let src = source(request)
    let dst = new URL(request.url)
    let pcy = rules.get(src, dst)

    cache.set(request.requestId, pcy)
    return pcy.onBeforeRequest(request)
  },

  onBeforeSendHeaders: function(request) {
    const pcy = cache.get(request.requestId)
    if(pcy === undefined) {
      // Theoretically unreachable...
      logger.error('No policy cached for request!', request)
    }
    else {
      return pcy.onBeforeSendHeaders(request)
    }
  },

  onSendHeaders: function(request) {
    const pcy = cache.get(request.requestId)
    if(pcy === undefined) {
      // Theoretically unreachable...
      logger.error('No policy cached for request!', request)
    }
    else {
      return pcy.onSendHeaders(request)
    }
  },

  onHeadersReceived: function(request) {
    const pcy = cache.get(request.requestId)
    if(pcy === undefined) {
      // Theoretically unreachable...
      logger.error('No policy cached for request!', request)
    }
    else {
      return pcy.onHeadersReceived(request)
    }
  },

  onCompleted: function(request) {
    cache.delete(request.requestId)
  },

  onErrorOccurred: function(request) {
    cache.delete(request.requestId)
  }
}

// Possible Values of the "WebRequest.type" Field
// https://developer.mozilla.org/en-US/Add-ons/WebExtensions/API/webRequest/ResourceType
const types = [
  'beacon',
  'csp_report',
  'font',
  'image',
  'imageset',
  'main_frame',
  'media',
  'object',
  'object_subrequest',
  'ping',
  'script',
  'stylesheet',
  'sub_frame',
  'web_manifest',
  'websocket',
  'xbl',
  'xml_dtd',
  'xmlhttprequest',
  'xslt'
]

module.exports = {
  cache:    cache,
  handlers: handlers,
  rules:    rules,
  source:   source,
  types:    types
}
