const assert  = require('assert')
const Policy  = require('../src/lib/policy.js')
const request = require('../src/lib/request.js')
const Ruleset = require('../src/lib/ruleset.js')
const tab     = require('../src/lib/tab.js')

describe('request', function() {
  function mocreq(requestId, tabId, originUrl, url) {
    return {requestId, tabId, originUrl, url}
  }

  afterEach(function() {
    request.cache.clear()
    request.rules.clear()
    tab.cache.clear()
  })

  describe('#add()', function() {
    it('should add new policies to the cache', function() {
      request.add(mocreq('id', 0, 'http://foo.com', 'http://bar.com'))
      assert(request.cache.get('id') instanceof Policy)
    })

    it('should look up policies in the rules list', function() {
      request.rules.add('**.foo.com', '**.bar.com', new Policy({request: 'custom'}))
      request.add(mocreq('id', 0, 'http://foo.com', 'http://bar.com'))
      assert.strictEqual(request.cache.get('id').request, 'custom')
    })

    it('should return the policy it creates', function() {
      let got = request.add(mocreq('id', 0, 'http://foo.com', 'http://bar.com'))
      assert.strictEqual(got, request.cache.get('id'))
    })
  })

  describe('#del()', function() {
    it('should delete requests from the cache', function() {
      request.cache.set('ruby', 'tuesday')
      assert.strictEqual(request.cache.get('ruby'), 'tuesday')

      request.del({requestId: 'ruby'})
      assert(!request.cache.has('ruby'))
    })

    it('should log a warning if there\'s nothing there', function() {
      assert(!request.cache.has('bananas'))
      assert.logs('warn', function() {
        request.del({requestId: 'bananas'})
      })
    })
  })

  describe('#get()', function() {
    it('should retrieve requests from the cache', function() {
      request.cache.set('marco', 'polo')
      assert.strictEqual(request.cache.get('marco'), 'polo')

      let got = request.get({requestId: 'marco'})
      assert.strictEqual(got, 'polo')
    })

    it('should log an error if there\'s nothing there', function() {
      assert(!request.cache.has('donuts'))
      assert.logs('error', function() {
        let got = request.get({requestId: 'donuts'})
        assert.strictEqual(got, undefined)
      })
    })
  })

  describe('#source()', function() {
    it('should use the tab URL if it can', function() {
      tab.set(42, 'https://mystical-bear-paradise.com')
      let url = request.source(mocreq('id', 42, 'http://foo.com', 'http://bar.com'))
      assert.strictEqual(url, tab.get(42).url)
    })

    it('should log an error if the tab isn\'t cached', function() {
      // Logs an error when it can't find the tab
      // Logs a warning when it uses the originUrl
      assert.logs({error: 1, warn: 1}, function() {
        let src = request.source(mocreq('id', 9.75, 'http://foo.com', 'http://bar.com'))
        assert.deepEqual(src, new URL('http://bar.com'))
      })
    })

    it('should warn and use the origin URL if there is no tab', function() {
      assert.logs('warn', function() {
        let src = request.source(mocreq('id', -1, 'http://foo.com', 'http://bar.com'))
        assert.deepEqual(src, new URL('http://bar.com'))
      })
    })

    it('should log an error if it can\'t determine the source', function() {
      assert.logs('error', function() {
        let src = request.source(mocreq('id', -1, undefined, 'http://bar.com'))
        assert.strictEqual(src, undefined)
      })
    })
  })
})
