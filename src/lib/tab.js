const logger = require('./logger.js')

class Tab {
  constructor(id, url) {
    this.id  = id
    this.url = url
  }
}

const cache = new Map()

function del(id) {
  if(!cache.has(id)) return
  logger.debug(`Tab ${id} removed.`)
  cache.delete(id)
}

function get(id) {
  return cache.get(id)
}

function set(id, texturl) {
  let old = cache.get(id)
  let url = new URL(texturl)

  if(old !== undefined) {
    let heq = (old.url.origin   === url.origin)
    let peq = (old.url.pathname === url.pathname)
    if(heq && peq) return
  }

  logger.debug(`Tab ${id} updated: ${url.origin}${url.pathname}`)
  cache.set(id, new Tab(id, url))
}

module.exports = {
  cache: cache,
  del:   del,
  get:   get,
  set:   set
}
