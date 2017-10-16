const assert = require('assert')
const Filter = require('../src/lib/filter.js')
const Policy = require('../src/lib/policy.js')

let mocreq = function(headers = {}) {
  return {
    url: 'http://dst.example.com/?q=what',
    requestHeaders: Object.keys(headers).map(key => ({
      name: key, value: headers[key]
    }))
  }
}

let mocrsp = function(headers = {}) {
  return {
    url: 'http://dst.example.com/?q=what',
    responseHeaders: Object.keys(headers).map(key => ({
      name: key, value: headers[key]
    }))
  }
}

describe('Policy', function() {
  describe('#constructor()', function() {
    it('should be tested', function() {
      assert.equal('TODO', true)
    })
  })

  describe('#merge()', function() {
    it('should be tested', function() {
      assert.equal('TODO', true)
    })
  })

  describe('#onBeforeRequest()', function() {
    it('should not modify requests by default', function() {
      let policy = new Policy()
      let result = policy.onBeforeRequest(mocreq())
      assert.strictEqual(result, undefined)
    })

    it('should cancel requests if told to', function() {
      let policy = new Policy({request: 'block'})
      let result = policy.onBeforeRequest(mocreq())
      assert.deepEqual(result, {cancel: true})
    })

    it('should redirect to HTTPS if told to', function() {
      let policy = new Policy({encrypt: 'force'})
      let result = policy.onBeforeRequest(mocreq())
      assert.deepEqual(result, {
        redirectUrl: 'https://dst.example.com/?q=what'
      })
    })

    it('should block query params if told to', function() {
      let policy = new Policy({queries: 'block'})
      let result = policy.onBeforeRequest(mocreq())
      assert.deepEqual(result, {
        redirectUrl: 'http://dst.example.com/'
      })
    })

    it('should rewrite queries if told to', function() {
      let policy = new Policy({queries: 'who'})
      let result = policy.onBeforeRequest(mocreq())
      assert.deepEqual(result, {
        redirectUrl: 'http://dst.example.com/?q=who'
      })
    })
  })

  describe('#onBeforeSendHeaders()', function() {
    it('should allow headers by default', function() {
      let policy  = new Policy()
      let request = mocreq({'User-Agent': '007'})
      let result  = policy.onBeforeSendHeaders(request)
      assert.strictEqual(result, undefined)
    })

    it('should block headers if told to', function() {
      let policy  = new Policy({headers: 'block'})
      let request = mocreq({'User-Agent': '007'})
      let result  = policy.onBeforeSendHeaders(request)
      assert.deepEqual(result.requestHeaders, [])
    })

    it('should override headers if told to', function() {
      let policy  = new Policy({headers: 'orange'})
      let request = mocreq({'User-Agent': '007'})
      let result  = policy.onBeforeSendHeaders(request)
      assert.deepEqual(result.requestHeaders, [{
        name:  'user-agent',
        value: 'orange'
      }])
    })

    it('should allow cookies by default', function() {
      let policy  = new Policy()
      let request = mocreq({'Cookie': 'favorite=macaron'})
      let result  = policy.onBeforeSendHeaders(request)
      assert.strictEqual(result, undefined)
    })

    it('should block all cookies if old to', function() {
      let policy  = new Policy({cookies: 'block'})
      let request = mocreq({'Cookie': 'favorite=macaron'})
      let result  = policy.onBeforeSendHeaders(request)
      assert.deepEqual(result.requestHeaders, [])
    })

    it('should block single cookies if told to', function() {
      let policy  = new Policy({cookies: {dunkable: 'block'}})
      let request = mocreq({'Cookie': 'favorite=macaron; dunkable=false'})
      let result  = policy.onBeforeSendHeaders(request)
      assert.deepEqual(result.requestHeaders, [{
        name:  'cookie',
        value: 'favorite=macaron'
      }])
    })

    it('should override cookies if told to', function() {
      let policy  = new Policy({cookies: 'snickerdoodle'})
      let request = mocreq({'Cookie': 'favorite=macaron'})
      let result  = policy.onBeforeSendHeaders(request)
      assert.deepEqual(result.requestHeaders, [{
        name:  'cookie',
        value: 'favorite=snickerdoodle'
      }])
    })
  })

  describe('#onHeadersReceived()', function() {
    it('should do nothing by default', function() {
      let policy = new Policy()
      let result = policy.onHeadersReceived(mocrsp())
      assert.strictEqual(result, undefined)
    })

    it('should allow all headers by default', function() {
      let policy = new Policy()
      let result = policy.onHeadersReceived(mocrsp({'X-Y-Z': '123'}))
      assert.strictEqual(result, undefined)
    })

    it('should allow cookies by default', function() {
      let policy = new Policy()
      let result = policy.onHeadersReceived(mocrsp({
        'Set-Cookie': 'favorite=chocolate-chip; Path=/; Secure'
      }))

      assert.strictEqual(result, undefined)
    })

    it('should block cookies if told to', function() {
      let policy = new Policy({cookies: 'block'})
      let result = policy.onHeadersReceived(mocrsp({
        'Set-Cookie': 'favorite=chocolate-chip; Path=/; Secure'
      }))

      assert.deepEqual(result, {
        responseHeaders: []
      })
    })

    it('should rewrite cookies if told to', function() {
      let policy = new Policy( {cookies: 'gingersnaps'})
      let result = policy.onHeadersReceived(mocrsp({
        'Set-Cookie': 'favorite=chocolate-chip; Path=/; Secure; HttpOnly'
      }))

      assert.deepEqual(result, {responseHeaders: [{
        name:  'set-cookie',
        value: 'favorite=gingersnaps; Path=/; Secure; HttpOnly'
      }]})
    })

    it('should block all scripts if told to', function() {
      let policy = new Policy({scripts: 'block'})
      let result = policy.onHeadersReceived(mocrsp())
      assert.deepEqual(result.responseHeaders, [{
        name:  'content-security-policy',
        value: 'script-src \'none\''
      }])
    })
  })

  describe('#onSendHeaders()', function() {
    it('should flag requests that should have been blocked', function() {
      let policy = new Policy({request: 'block'})
      assert.logs('warn', function() {
        policy.onSendHeaders(mocreq())
      })
    })

    it('should flag requests that should have been encrypted', function() {
      let policy = new Policy({encrypt: 'force'})
      assert.logs('warn', function() {
        policy.onSendHeaders(mocreq())
      })
    })

    it('should flag requests with the wrong headers', function() {
      let policy  = new Policy({headers: 'block'})
      let request = mocreq({'User-Agent': 'smith'})
      assert.logs('warn', function() {
        policy.onSendHeaders(request)
      })
    })

    it('should flag requests with the wrong cookies', function() {
      let policy  = new Policy({cookies: 'block'})
      let request = mocreq({'Cookie': 'favorite=macaron'})
      assert.logs('warn', function() {
        policy.onSendHeaders(request)
      })
    })
  })
})
