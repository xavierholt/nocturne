const assert = require('assert')
const tab    = require('../src/lib/tab.js')

describe('tabs', function() {
  beforeEach(function() {
    tab.cache.clear()
  })

  const ID     = 42
  const WWWREQ = {id: ID, url: 'https://www.example.com'}
  const APIREQ = {id: ID, url: 'https://api.example.com'}

  describe('#onCreated()', function() {
    it('should add new tabs to the cache', function() {
      assert.strictEqual(tab.cache.get(ID), undefined)
      tab.handlers.onCreated(WWWREQ)
      assert.notStrictEqual(tab.cache.get(ID), undefined)
    })

    it('should parse the URLs of new tabs', function() {
      tab.handlers.onCreated(WWWREQ)
      assert.strictEqual(tab.cache.get(ID).url.hostname, 'www.example.com')
      assert.strictEqual(tab.cache.get(ID).url.pathname, '/')
    })
  })

  describe('#onUpdated()', function() {
    it('should add new tabs if they have URL diffs', function() {
      assert.strictEqual(tab.cache.get(ID), undefined)
      tab.handlers.onUpdated(ID, {url: 'https://www.example.com'}, WWWREQ)
      assert.notStrictEqual(tab.cache.get(ID), undefined)
    })

    it('should ignore tab changes without a URL diff', function() {
      assert.strictEqual(tab.cache.get(ID), undefined)
      tab.handlers.onUpdated(ID, {changes: 'stuff'}, WWWREQ)
      assert.strictEqual(tab.cache.get(ID), undefined)
    })

    it('should replace existing tabs if they have URL diffs', function() {
      tab.handlers.onCreated(WWWREQ)
      assert.notStrictEqual(tab.cache.get(ID), undefined)
      tab.handlers.onUpdated(ID, {url: 'https://api.example.com'}, APIREQ)
      assert.notStrictEqual(tab.cache.get(ID), undefined)
    })

    it('should parse the URLs of updated tabs', function() {
      tab.handlers.onUpdated(ID, {url: 'https://www.example.com'}, WWWREQ)
      assert.strictEqual(tab.cache.get(ID).url.hostname, 'www.example.com')
      assert.strictEqual(tab.cache.get(ID).url.pathname, '/')
    })
  })

  describe('#onRemoved()', function() {
    it('should remove tabs from the cache', function() {
      tab.handlers.onCreated(WWWREQ)
      assert.notStrictEqual(tab.cache.get(ID), undefined)
      tab.handlers.onRemoved(ID)
      assert.strictEqual(tab.cache.get(ID), undefined)
    })

    it('should not freak out if the tab is missing', function() {
      assert.strictEqual(tab.cache.get(ID), undefined)
      assert.doesNotThrow(function() {
        tab.handlers.onRemoved(ID)
      })
    })
  })
})
