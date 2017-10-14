const Filter = require('./filter.js')
const logger = require('./logger.js')
const parse  = require('./parse.js')

module.exports = class Policy {
  constructor(options = {}) {
    this.cookies = new Filter('cookie', options.cookies)
    this.headers = new Filter('header', options.headers)
    this.queries = new Filter('query',  options.queries)

    this.encrypt = options.encrypt
    this.request = options.request
    this.scripts = options.scripts
    this.storage = options.storage
  }

  merge(other) {
    this.cookies.merge(other.cookies)
    this.headers.merge(other.headers)
    this.queries.merge(other.queries)

    this.encrypt = other.encrypt || this.encrypt
    this.request = other.request || this.request
    this.scripts = other.scripts || this.scripts
    this.storage = other.storage || this.storage
  }

  onBeforeRequest(request) {
    if(this.request === 'block') {
      logger.debug('Blocked request.', request)
      return {cancel: true}
    }

    let dst      = new URL(request.url)
    let target   = new URL(request.url)
    let redirect = false

    if(this.encrypt === 'force' && dst.protocol === 'http:') {
      target.protocol = 'https:'
      redirect = true
    }

    let params = new URLSearchParams()
    let change = false

    for(const [name, value] of dst.searchParams.entries()) {
      let val = this.queries.filter({name: name, value: value})
      if(val) params.append(name, val)
      change = change || val !== value
    }

    if(change) {
      target.search = params.toString()
      redirect = true
    }

    if(redirect) {
      request.newurl = target.toString()
      logger.debug('Redirected request.', request)
      return {redirectUrl: request.newurl}
    }
  }

  onBeforeSendHeaders(request) {
    let headers = []
    for(const header of request.requestHeaders) {
      header.name = header.name.toLowerCase()

      if(header.name === 'cookie') {
        let cookies = []
        for(const cookie of parse.cookies(header.value)) {
          let val = this.cookies.filter(cookie)
          if(val) cookies.push(`${cookie.name}=${val}`)
        }

        if(cookies.length > 0) {
          headers.push({name: 'cookie', value: cookies.join('; ')})
        }
      }
      else {
        let val = this.headers.filter(header)
        if(val) headers.push({name: header.name, value: val})
      }
    }

    return {
      requestHeaders: headers
    }
  }

  onSendHeaders(request) {
    const dst = new URL(request.url)
    if(this.request === 'block') {
      logger.warn('Blocked request sent!', request)
      return
    }

    if(this.encrypt === 'force' && dst.protocol !== 'https:') {
      logger.warn('Redirect to HTTPS failed!', request)
    }

    for(const [name, value] of dst.searchParams.entries()) {
      this.queries.verify({name: name, value: value})
    }

    for(const header of request.requestHeaders) {
      header.name = header.name.toLowerCase()

      if(header.name === 'cookie') {
        for(const cookie of parse.cookies(header.value)) {
          this.cookies.verify(cookie)
        }
      }
      else {
        // TODO: continue if it's a "special" header.
        this.headers.verify(header)
      }
    }
  }

  onHeadersReceived(response) {
    let headers = []
    for(const header of response.responseHeaders) {
      header.name = header.name.toLowerCase()

      if(header.name === 'set-cookie') {
        // TODO: Make this do something useful.
        if(this.cookies !== 'block') {
          headers.push(header)
        }
      }
      else {
        // TODO: More filtering?
        headers.push(header)
      }
    }

    if(this.scripts === 'block') {
      logger.debug('Blocked scripts.', request)
      headers.push({
        name:  'content-security-policy',
        value: 'srcipt-src \'none\''
      })
    }

    return {
      responseHeaders: headers
    }
  }
}
