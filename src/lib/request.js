const logger  = require('./logger.js')
const Ruleset = require('./ruleset.js')
const tab     = require('./tab.js')

const cache = new Map()
let   rules = new Ruleset()

function source(request) {
  if(request.tabId > 0) {
    // NOTE: Potential race condition!
    // What's the tab URL of a main_frame request?
    let srctab = tab.get(request.tabId)
    if(srctab !== undefined) return srctab.url
    logger.error('No such tab cached!', request)
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

function add(request) {
  let src = source(request)
  let dst = new URL(request.url)
  // log(request, src, dst)

  let policy = rules.get(src, dst)
  cache.set(request.requestId, policy)
  return policy
}

function del(request) {
  if(cache.has(request.requestId)) {
    cache.delete(request.requestId)
  }
  else {
    logger.warn('No such policy to delete!', request)
  }
}

function get(request) {
  let policy = cache.get(request.requestId)
  if(!policy) logger.error('No policy found for request!', request)
  return policy
}

// function log(r, src, dst) {
//   let s = (src)? src.origin : undefined
//   let d = (dst)? dst.origin : undefined
//   logger.debug(`Tab ${r.tabId} (${r.type}): ${s} -> ${d}`)
// }

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
  add:    add,
  cache:  cache,
  del:    del,
  get:    get,
  rules:  rules,
  source: source,
  types:  types
}
