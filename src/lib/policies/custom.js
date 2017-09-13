const parse  = require('../parse.js')
const Policy = require('./policy.js')

class Custom extends Policy {
  constructor(data) {
    this.cookies = data.cookies
    this.headers = data.headers
  }

  _enforce(policy, kvp) {
    let action = policy.get(kvp.name) || policy.default
    switch(action) {
    case 'allow':
      return kvp.value
    case 'block':
      console.debug(`Blocked ${type} ${kvp.name}.`)
      return undefined
    default:
      console.debug(`Set ${type} ${kvp.name} to "${action}".`)
      return action
    }
  }

  _inspect(type, policy, kvp) {
    let action = policy.get(kvp.name) || policy.default
    switch(action) {
    case 'allow':
    case kvp.value:
      return
    case 'block':
      console.warn(`Blocked ${type} sent: ${kvp.name}`)
    default:
      console.warn(`Override failed for ${type} ${kvp.name}:`)
      console.warn(`  expected: ${action}`)
      console.warn(`  got:      ${kvp.value}`)
    }
  }

  onBeforeSendHeaders(request) {
    let headers = []

    for(header of request.requestHeaders) {
      header.name = header.name.toLowerCase()

      if(header.name === 'cookie') {
        let cookies = []
        for(cookie of parse.cookies(header.value)) {
          let val = _enforce(this.cookies, cookie)
          if(val) cookies.push(`${cookie.name}=${val}`)
        }

        if(cookies.length > 0) {
          headers.push({name: 'cookie', value: cookies.join('; ')})
        }
      }
      else {
        let val = _enforce(this.headers, header)
        if(val) headers.push({name: name, value: val})
      }
    }

    return {
      requestHeaders: headers
    }
  }

  onSendHeaders(request) {
    for(header of request.requestHeaders) {
      header.name = header.name.toLowerCase()

      if(header.name === 'cookie') {
        for(cookie of parse.cookies(header.value)) {
          _inspect('cookie', this.cookies, cookie)
        }
      }
      else {
        //TODO: continue if it's a "special" header.
        _inspect('header', this.headers, header)
      }
    }
  }

  onHeadersReceived(request) {
    //TODO: Add custom CSP here if desired.
  }
}

module.exports = Custom
