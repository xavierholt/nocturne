const parse  = require('../parse.js')
const Policy = require('./policy.js')

module.exports = class Custom extends Policy {
  constructor(filters) {
    // TODO: Query parameter filtering!
    this.cookies = filters.cookies
    this.headers = filters.headers
  }

  onBeforeSendHeaders(request) {
    let headers = []
    for(header of request.requestHeaders) {
      header.name = header.name.toLowerCase()

      if(header.name === 'cookie') {
        let cookies = []
        for(cookie of parse.cookies(header.value)) {
          let val = this.cookies.filter(cookie)
          if(val) cookies.push(`${cookie.name}=${val}`)
        }

        if(cookies.length > 0) {
          headers.push({name: 'cookie', value: cookies.join('; ')})
        }
      }
      else {
        let val = this.headers.filter(header)
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
          this.cookies.verify(cookie)
        }
      }
      else {
        //TODO: continue if it's a "special" header.
        this.headers.verify(header)
      }
    }
  }

  onHeadersReceived(request) {
    //TODO: Add custom CSP here if desired.
  }
}
