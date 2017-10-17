const assert = require('assert')
const tab    = require('../src/lib/tab.js')

describe('tabs', function() {
  afterEach(function() {
    tab.cache.clear()
  })

  before(function() {
    tab.cache.clear()
  })

  describe('#del()', function() {
    it('should remove existing tabs from the cache', function() {
      tab.cache.set('marco', 'polo')
      assert.strictEqual(tab.cache.get('marco'), 'polo')

      assert.logs('debug', function() {tab.del('marco')})
      assert.strictEqual(tab.cache.get('marco'), undefined)
    })

    it('should do nothing if no such tab exists', function() {
      assert.strictEqual(tab.cache.get('nope'), undefined)

      assert.logs('error', function() {tab.del('nope')})
      assert.strictEqual(tab.cache.get('nope'), undefined)
    })
  })

  describe('#get()', function() {
    it('should retrieve tabs from the cache', function() {
      tab.cache.set('heave', 'ho')
      assert.strictEqual(tab.get('heave'), 'ho')
    })

    it('should return undefined if there\'s nothing there', function() {
      assert.strictEqual(tab.get('anybody..?'), undefined)
    })
  })

  describe('#set()', function() {
    it('should add new tabs to the cache', function() {
      assert.strictEqual(tab.cache.has('example'), false)

      tab.set('example', 'https://www.example.com')
      assert(tab.cache.has('example'))
    })

    it('should overwrite tabs when the scheme changes', function() {
      assert.logs('debug', () => tab.set('id', 'http://www.example.com'))
      assert.strictEqual(tab.cache.get('id').url.protocol, 'http:')

      assert.logs('debug', () => tab.set('id', 'https://www.example.com'))
      assert.strictEqual(tab.cache.get('id').url.protocol, 'https:')
    })

    it('should overwrite tabs when the host changes', function() {
      assert.logs('debug', () => tab.set('id', 'https://www.example.com'))
      assert.strictEqual(tab.cache.get('id').url.hostname, 'www.example.com')

      assert.logs('debug', () => tab.set('id', 'https://xxx.example.com'))
      assert.strictEqual(tab.cache.get('id').url.hostname, 'xxx.example.com')
    })

    it('should overwrite tabs when the port changes', function() {
      assert.logs('debug', () => tab.set('id', 'https://www.example.com:42'))
      assert.strictEqual(tab.cache.get('id').url.port, '42')

      assert.logs('debug', () => tab.set('id', 'https://www.example.com:88'))
      assert.strictEqual(tab.cache.get('id').url.port, '88')
    })

    it('should overwrite tabs when the path changes', function() {
      assert.logs('debug', () => tab.set('id', 'https://www.example.com/heaven'))
      assert.strictEqual(tab.cache.get('id').url.pathname, '/heaven')

      assert.logs('debug', () => tab.set('id', 'https://www.example.com/earth'))
      assert.strictEqual(tab.cache.get('id').url.pathname, '/earth')
    })

    it('should not overwrite tabs when only the hash changes', function() {
      assert.logs('debug', () => tab.set('id', 'https://www.example.com#tags'))
      assert.strictEqual(tab.cache.get('id').url.hash, '#tags')

      assert.logs('none', () => tab.set('id', 'https://www.example.com#cats'))
      assert.strictEqual(tab.cache.get('id').url.hash, '#tags')
    })

    it('should not overwrite tabs when only the query changes', function() {
      assert.logs('debug', () => tab.set('id', 'https://www.example.com?q=who'))
      assert.strictEqual(tab.cache.get('id').url.search, '?q=who')

      assert.logs('none', () => tab.set('id', 'https://www.example.com?q=why'))
      assert.strictEqual(tab.cache.get('id').url.search, '?q=who')
    })
  })
})
