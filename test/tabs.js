const assert = require('assert')
const tabs   = require('../src/lib/tabs.js')

describe('tabs', function() {
  beforeEach(function() {
    tabs.cache.clear()
  })

  const WWWREQ = {id: 42, url: 'https://www.example.com'}
  const APIREQ = {id: 42, url: 'https://api.example.com'}

  describe('#onCreated()', function() {
    it('should add new tabs to the cache', function() {
      assert.strictEqual(tabs.cache.get(42), undefined)
      tabs.handlers.onCreated(WWWREQ)
      assert.notStrictEqual(tabs.cache.get(42), undefined)
    })

    it('should parse the URLs of new tabs', function() {
      tabs.handlers.onCreated(WWWREQ)

      const url = tabs.cache.get(42).url
      assert.strictEqual(url.hostname, 'www.example.com')
      assert.strictEqual(url.pathname, '/')
    })
  })

  describe('#onUpdated()', function() {
    it('should ignore tab changes without a URL diff', function() {
      assert.strictEqual(tabs.cache.get(42), undefined)
      tabs.handlers.onUpdated(42, {changes: 'stuff'}, WWWREQ)
      assert.strictEqual(tabs.cache.get(42), undefined)
    })

    it('should add new tabs if they have URL diffs', function() {
      assert.strictEqual(tabs.cache.get(42), undefined)
      tabs.handlers.onUpdated(42, {url: 'https://www.example.com'}, WWWREQ)
      assert.notStrictEqual(tabs.cache.get(42), undefined)
    })

    it('should replace existing tabs if they have URL diffs', function() {
      tabs.handlers.onCreated(WWWREQ)
      assert.notStrictEqual(tabs.cache.get(42), undefined)
      tabs.handlers.onUpdated(42, {url: 'https://api.example.com'}, APIREQ)
      assert.notStrictEqual(tabs.cache.get(42), undefined)
    })

    it('should parse the URLs of updated tabs', function() {
      tabs.handlers.onUpdated(42, {url: 'https://www.example.com'}, WWWREQ)

      const url = tabs.cache.get(42).url
      assert.strictEqual(url.hostname, 'www.example.com')
      assert.strictEqual(url.pathname, '/')
    })
  })

  describe('#onRemoved()', function() {
    it('should remove tabs from the cache', function() {
      tabs.handlers.onCreated(WWWREQ)
      assert.notStrictEqual(tabs.cache.get(42), undefined)
      tabs.handlers.onRemoved(42)
      assert.strictEqual(tabs.cache.get(42), undefined)
    })

    it('should not freak out if the tab to remove is missing', function() {
      assert.strictEqual(tabs.cache.get(42), undefined)
      assert.doesNotThrow(function() {
        tabs.handlers.onRemoved(42)
      })
    })
  })
})
