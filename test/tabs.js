const assert = require('assert')
const tabs   = require('../src/lib/tabs.js')

describe('tabs', function() {
  afterEach(function() {
    tabs.cache.clear()
  })

  const ID     = 42
  const WWWREQ = {id: ID, url: 'https://www.example.com'}
  const APIREQ = {id: ID, url: 'https://api.example.com'}

  describe('#onCreated()', function() {
    it('should add new tabs to the cache', function() {
      assert.strictEqual(tabs.cache.get(ID), undefined)
      tabs.handlers.onCreated(WWWREQ)
      assert.notStrictEqual(tabs.cache.get(ID), undefined)
    })

    it('should parse the URLs of new tabs', function() {
      tabs.handlers.onCreated(WWWREQ)
      assert.strictEqual(tabs.cache.get(ID).url.hostname, 'www.example.com')
      assert.strictEqual(tabs.cache.get(ID).url.pathname, '/')
    })
  })

  describe('#onUpdated()', function() {
    it('should add new tabs if they have URL diffs', function() {
      assert.strictEqual(tabs.cache.get(ID), undefined)
      tabs.handlers.onUpdated(ID, {url: 'https://www.example.com'}, WWWREQ)
      assert.notStrictEqual(tabs.cache.get(ID), undefined)
    })

    it('should ignore tab changes without a URL diff', function() {
      assert.strictEqual(tabs.cache.get(ID), undefined)
      tabs.handlers.onUpdated(ID, {changes: 'stuff'}, WWWREQ)
      assert.strictEqual(tabs.cache.get(ID), undefined)
    })

    it('should replace existing tabs if they have URL diffs', function() {
      tabs.handlers.onCreated(WWWREQ)
      assert.notStrictEqual(tabs.cache.get(ID), undefined)
      tabs.handlers.onUpdated(ID, {url: 'https://api.example.com'}, APIREQ)
      assert.notStrictEqual(tabs.cache.get(ID), undefined)
    })

    it('should parse the URLs of updated tabs', function() {
      tabs.handlers.onUpdated(ID, {url: 'https://www.example.com'}, WWWREQ)
      assert.strictEqual(tabs.cache.get(ID).url.hostname, 'www.example.com')
      assert.strictEqual(tabs.cache.get(ID).url.pathname, '/')
    })
  })

  describe('#onRemoved()', function() {
    it('should remove tabs from the cache', function() {
      tabs.handlers.onCreated(WWWREQ)
      assert.notStrictEqual(tabs.cache.get(ID), undefined)
      tabs.handlers.onRemoved(ID)
      assert.strictEqual(tabs.cache.get(ID), undefined)
    })

    it('should not freak out if the tab to remove is missing', function() {
      assert.strictEqual(tabs.cache.get(ID), undefined)
      assert.doesNotThrow(function() {
        tabs.handlers.onRemoved(ID)
      })
    })
  })
})
