const assert = require('assert')
const Filter = require('../src/lib/filter.js')
const policy = require('../src/lib/policy.js')

let mocreq = function(headers) {
  return {
    requestHeaders: Object.keys(headers).map(key => ({
      name: key, value: headers[key]
    }))
  }
}

describe('Policy::Allow', function() {
  describe('#onBeforeRequest()', function() {
    it('should return undefined', function() {
      let result = policy.ALLOW.onBeforeRequest({})
      assert.strictEqual(result, undefined)
    })
  })
})

describe('Policy::Block', function() {
  describe('#onBeforeRequest()', function() {
    it('should block the request', function() {
      let result = policy.BLOCK.onBeforeRequest({})
      assert.deepEqual(result, {cancel: true})
    })
  })

  describe('#onSendHeaders()', function() {
    it('should log a warning', function() {
      assert.logs('warn', function() {
        policy.BLOCK.onSendHeaders({})
      })
    })
  })
})

describe('Policy::Custom', function() {
  describe('#onBeforeSendHeaders()', function() {
    it('should allow headers', function() {
      let p = new policy.Custom({
        headers: new Filter('headers'),
        cookies: new Filter('cookies')
      })

      let request = mocreq({'User-Agent': '007'})
      let result = p.onBeforeSendHeaders(request)
      assert.deepEqual(result.requestHeaders, [{
        name:  'user-agent',
        value: '007'
      }])
    })

    it('should block headers', function() {
      let p = new policy.Custom({
        headers: new Filter('headers', 'block'),
        cookies: new Filter('cookies')
      })

      let request = mocreq({'User-Agent': '007'})
      let result = p.onBeforeSendHeaders(request)
      assert.deepEqual(result.requestHeaders, [])
    })

    it('should override headers', function() {
      let p = new policy.Custom({
        headers: new Filter('headers', 'orange'),
        cookies: new Filter('cookies')
      })

      let request = mocreq({'User-Agent': '007'})
      let result = p.onBeforeSendHeaders(request)
      assert.deepEqual(result.requestHeaders, [{
        name:  'user-agent',
        value: 'orange'
      }])
    })

    it('should allow cookies', function() {
      let p = new policy.Custom({
        headers: new Filter('headers'),
        cookies: new Filter('cookies')
      })

      let request = mocreq({'Cookie': 'favorite=macaron'})
      let result = p.onBeforeSendHeaders(request)
      assert.deepEqual(result.requestHeaders, [{
        name:  'cookie',
        value: 'favorite=macaron'
      }])
    })

    it('should block all cookies', function() {
      let p = new policy.Custom({
        headers: new Filter('headers'),
        cookies: new Filter('cookies', 'block')
      })

      let request = mocreq({'Cookie': 'favorite=macaron'})
      let result = p.onBeforeSendHeaders(request)
      assert.deepEqual(result.requestHeaders, [])
    })

    it('should block single cookies', function() {
      let p = new policy.Custom({
        headers: new Filter('headers'),
        cookies: new Filter('cookies', 'allow', {dunkable: 'block'})
      })

      let request = mocreq({'Cookie': 'favorite=macaron; dunkable=false'})
      let result = p.onBeforeSendHeaders(request)
      assert.deepEqual(result.requestHeaders, [{
        name:  'cookie',
        value: 'favorite=macaron'
      }])
    })

    it('should override cookies', function() {
      let p = new policy.Custom({
        headers: new Filter('headers'),
        cookies: new Filter('cookies', 'snickerdoodle')
      })

      let request = mocreq({'Cookie': 'favorite=macaron'})
      let result = p.onBeforeSendHeaders(request)
      assert.deepEqual(result.requestHeaders, [{
        name:  'cookie',
        value: 'favorite=snickerdoodle'
      }])
    })
  })

  describe('#onSendHeaders()', function() {
    it('should verify headers', function() {
      let p = new policy.Custom({
        headers: new Filter('headers', 'block'),
        cookies: new Filter('cookies', 'allow')
      })

      let request = mocreq({'User-Agent': 'smith'})
      assert.logs('warn', function() {
        p.onSendHeaders(request)
      })
    })

    it('should verify cookies', function() {
      let p = new policy.Custom({
        headers: new Filter('headers', 'allow'),
        cookies: new Filter('cookies', 'block')
      })

      let request = mocreq({'Cookie': 'favorite=macaron'})
      assert.logs('warn', function() {
        p.onSendHeaders(request)
      })
    })
  })
})

describe('Policy::Policy', function() {
  describe('#[lifecycle]()', function() {
    it('should have all the WebRequest lifecycle hooks', function() {
      let p = new policy.Policy()
      assert.strictEqual(p.onAuthRequired(),      undefined)
      assert.strictEqual(p.onBeforeRedirect(),    undefined)
      assert.strictEqual(p.onBeforeRequest(),     undefined)
      assert.strictEqual(p.onBeforeSendHeaders(), undefined)
      assert.strictEqual(p.onCompleted(),         undefined)
      assert.strictEqual(p.onErrorOccurred(),     undefined)
      assert.strictEqual(p.onHeadersReceived(),   undefined)
      assert.strictEqual(p.onResponseStarted(),   undefined)
      assert.strictEqual(p.onSendHeaders(),       undefined)
    })
  })
})
