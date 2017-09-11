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
      return undefined
    default:
      return action
    }
  }

  _inspect(type, policy, kvp) {
    let action = policy.get(kvp.name) || policy.default
    switch(action) {
    case 'allow':
      return
    case 'block':
      console.warn('Found blocked ' + type + ': ' + kvp.name)
    default:
      if(kvp.value === action) return
      console.warn('Override failed for ' + type + ' ' + kvp.name + ':')
      console.warn('  expected: ' + action)
      console.warn('  got:      ' + kvp.value)
    }
  }

  _parseCookies(string) {
    return string.split(/\s*;\s*/).map(crumb => {
      let index = crumb.indexOf('=')

      return {
        name:  crumb.slice(0, index),
        value: crumb.slice(index + 1)
      }
    })
  }

  onBeforeSendHeaders(request) {
    let headers = []

    for(header of request.requestHeaders) {
      header.name = header.name.toLowerCase()

      if(header.name === 'cookie') {
        let cookies = []
        for(cookie of _parseCookies(cookies)) {
          let val = _enforce(this.cookies, cookie)
          if(val) cookies.push(cookie.name + '=' + val)
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
        for(cookie of _parseCookies(cookies)) {
          _inspect('cookie', this.cookies, cookie)
        }
      }
      else {
        _inspect('header', this.headers, header)
      }
    }
  }

  onHeadersReceived(request) {
    //TODO: Add custom CSP here if desired.
  }
}

module.exports = Custom