const assert  = require('assert')
const policy  = require('../src/lib/policy.js')
const request = require('../src/lib/request.js')
const Ruleset = require('../src/lib/ruleset.js')
const sinon   = require('sinon')
const tab     = require('../src/lib/tab.js')

describe('request', function() {
  const REQID = 13
  const TABID = 42

  const FROM = 'https://www.example.com'
  const GOOD = 'https://good.example.com'
  const EVIL = 'https://evil.example.com'

  beforeEach(function() {
    request.cache.clear()
  })

  function stubPolicy(requestId, callback) {
    let stub = sinon.stub()
    request.cache.set(requestId, {[callback]: stub})
    return stub
  }

  describe('#onBeforeRequest()', function() {
    before(function() {
      request.rules.add('www.example.com', 'good.example.com', policy.ALLOW)
      request.rules.add('www.example.com', 'evil.example.com', policy.BLOCK)
      tab.cache.set(TABID, {url: new URL(FROM)})
    })

    after(function() {
      request.rules = new Ruleset()
      tab.cache.clear()
    })

    it('should add new requests to the cache', function() {
      request.handlers.onBeforeRequest({
        requestId: REQID,
        tabId:     TABID,
        url:       GOOD
      })

      let pcy = request.cache.get(REQID)
      assert.deepEqual(pcy, policy.ALLOW)
    })

    it('should run a callback if there is one', function() {
      // TODO (there should always be one)
    })
  })

  describe('#onBeforeSendHeaders()', function() {
    it('should run a callback if there is one', function() {
      let stub = stubPolicy(REQID, 'onBeforeSendHeaders')
      request.handlers.onBeforeSendHeaders({requestId: REQID})
      assert.strictEqual(stub.callCount, 1)
    })

    it('should log errors for missing policies', function() {
      assert.logs('error', function() {
        request.handlers.onBeforeSendHeaders({requestId: REQID})
      })
    })
  })

  describe('#onSendHeaders()', function() {
    it('should run a callback if there is one', function() {
      let stub = stubPolicy(REQID, 'onSendHeaders')
      request.handlers.onSendHeaders({requestId: REQID})
      assert.strictEqual(stub.callCount, 1)
    })

    it('should log errors for missing policies', function() {
      assert.logs('error', function() {
        request.handlers.onSendHeaders({requestId: REQID})
      })
    })
  })

  describe('#onHeadersReceived()', function() {
    it('should run a callback if there is one', function() {
      let stub = stubPolicy(REQID, 'onHeadersReceived')
      request.handlers.onHeadersReceived({requestId: REQID})
      assert.strictEqual(stub.callCount, 1)
    })

    it('should log errors for missing policies', function() {
      assert.logs('error', function() {
        request.handlers.onHeadersReceived({requestId: REQID})
      })
    })
  })

  describe('#onCompleted()', function() {
    it('should remove the request from the cache', function() {
      request.cache.set(REQID, null)
      request.handlers.onCompleted({requestId: REQID})
      assert(!request.cache.has(REQID))
    })
  })

  describe('#onErrorOccurred()', function() {
    it('should remove the request from the cache', function() {
      request.cache.set(REQID, null)
      request.handlers.onErrorOccurred({requestId: REQID})
      assert(!request.cache.has(REQID))
    })
  })

  describe('#source()', function() {
    it('should use the tab URL if it can', function() {
      let src = request.source({
        originUrl: EVIL,
        requestId: REQID,
        tabId:     TABID,
        url:       GOOD
      })

      assert.deepEqual(src, new URL(FROM))
    })

    it('should log an error if the tab isn\'t cached', function() {
      // Logs one error when it can't find the tab, and then another
      // when it gives up and returns undefined.
      assert.logs({error: 2}, function() {
        request.source({
          requestId: REQID,
          tabId:     9.75,
          url:       GOOD
        })
      })
    })

    it('should warn and use the origin URL if there is no tab', function() {
      assert.logs('warn', function() {
        let src = request.source({
          originUrl: EVIL,
          requestId: REQID,
          tabId:     0,
          url:       GOOD
        })

        assert.deepEqual(src, new URL(EVIL))
      })
    })

    it('should log an error if it can\'t determine the source', function() {
      assert.logs('error', function() {
        let src = request.source({
          requestId: REQID,
          url:       GOOD
        })

        assert.strictEqual(src, undefined)
      })
    })
  })
})
