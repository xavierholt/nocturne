const assert   = require('assert')
const Filter   = require('../src/lib/filter.js')
const policies = require('../src/lib/policies')

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
      let result = policies.ALLOW.onBeforeRequest({})
      assert.strictEqual(result, undefined)
    })
  })
})

describe('Policy::Block', function() {
  describe('#onBeforeRequest()', function() {
    it('should block the request', function() {
      let result = policies.BLOCK.onBeforeRequest({})
      assert.deepEqual(result, {cancel: true})
    })
  })

  describe('#onSendHeaders()', function() {
    it('should log a warning', function() {
      assert.logs('warn', function() {
        policies.BLOCK.onSendHeaders({})
      })
    })
  })
})

describe('Policy::Custom', function() {
  describe('#onBeforeSendHeaders()', function() {
    it('should allow headers', function() {
      let policy = new policies.Custom({
        headers: new Filter('headers'),
        cookies: new Filter('cookies')
      })

      let request = mocreq({'User-Agent': '007'})
      let result = policy.onBeforeSendHeaders(request)
      assert.deepEqual(result.requestHeaders, [{
        name:  'user-agent',
        value: '007'
      }])
    })

    it('should block headers', function() {
      let policy = new policies.Custom({
        headers: new Filter('headers', 'block'),
        cookies: new Filter('cookies')
      })

      let request = mocreq({'User-Agent': '007'})
      let result = policy.onBeforeSendHeaders(request)
      assert.deepEqual(result.requestHeaders, [])
    })

    it('should override headers', function() {
      let policy = new policies.Custom({
        headers: new Filter('headers', 'orange'),
        cookies: new Filter('cookies')
      })

      let request = mocreq({'User-Agent': '007'})
      let result = policy.onBeforeSendHeaders(request)
      assert.deepEqual(result.requestHeaders, [{
        name:  'user-agent',
        value: 'orange'
      }])
    })

    it('should allow cookies', function() {
      let policy = new policies.Custom({
        headers: new Filter('headers'),
        cookies: new Filter('cookies')
      })

      let request = mocreq({'Cookie': 'favorite=macaron'})
      let result = policy.onBeforeSendHeaders(request)
      assert.deepEqual(result.requestHeaders, [{
        name:  'cookie',
        value: 'favorite=macaron'
      }])
    })

    it('should block all cookies', function() {
      let policy = new policies.Custom({
        headers: new Filter('headers'),
        cookies: new Filter('cookies', 'block')
      })

      let request = mocreq({'Cookie': 'favorite=macaron'})
      let result = policy.onBeforeSendHeaders(request)
      assert.deepEqual(result.requestHeaders, [])
    })

    it('should block single cookies', function() {
      let policy = new policies.Custom({
        headers: new Filter('headers'),
        cookies: new Filter('cookies', 'allow', {dunkable: 'block'})
      })

      let request = mocreq({'Cookie': 'favorite=macaron; dunkable=false'})
      let result = policy.onBeforeSendHeaders(request)
      assert.deepEqual(result.requestHeaders, [{
        name:  'cookie',
        value: 'favorite=macaron'
      }])
    })

    it('should override cookies', function() {
      let policy = new policies.Custom({
        headers: new Filter('headers'),
        cookies: new Filter('cookies', 'snickerdoodle')
      })

      let request = mocreq({'Cookie': 'favorite=macaron'})
      let result = policy.onBeforeSendHeaders(request)
      assert.deepEqual(result.requestHeaders, [{
        name:  'cookie',
        value: 'favorite=snickerdoodle'
      }])
    })
  })

  describe('#onSendHeaders()', function() {
    it('should verify headers', function() {
      let policy = new policies.Custom({
        headers: new Filter('headers', 'block'),
        cookies: new Filter('cookies', 'allow')
      })

      let request = mocreq({'User-Agent': 'smith'})
      assert.logs('warn', function() {
        policy.onSendHeaders(request)
      })
    })

    it('should verify cookies', function() {
      let policy = new policies.Custom({
        headers: new Filter('headers', 'allow'),
        cookies: new Filter('cookies', 'block')
      })

      let request = mocreq({'Cookie': 'favorite=macaron'})
      assert.logs('warn', function() {
        policy.onSendHeaders(request)
      })
    })
  })
})

describe('Policy::Policy', function() {
  describe('#[lifecycle]()', function() {
    it('should have all the WebRequest lifecycle hooks', function() {
      let policy = new policies.Policy()
      assert.strictEqual(policy.onAuthRequired(),      undefined)
      assert.strictEqual(policy.onBeforeRedirect(),    undefined)
      assert.strictEqual(policy.onBeforeRequest(),     undefined)
      assert.strictEqual(policy.onBeforeSendHeaders(), undefined)
      assert.strictEqual(policy.onCompleted(),         undefined)
      assert.strictEqual(policy.onErrorOccurred(),     undefined)
      assert.strictEqual(policy.onHeadersReceived(),   undefined)
      assert.strictEqual(policy.onResponseStarted(),   undefined)
      assert.strictEqual(policy.onSendHeaders(),       undefined)
    })
  })
})
