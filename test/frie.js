const assert = require('assert')
const Frie   = require('../src/lib/frie.js')

const PATH1 = [
  ['a', 'b', 'c'],
  ['d', 'e', 'f']
]

const PATH2 = [
  ['*', 'b', 'c'],
  ['d', 'e', 'f']
]

const PATH3 = [
  ['a', '**', 'c'],
  ['d', 'e',  'f']
]

const PATH4 = [
  ['a', 'b', '***'],
  ['d', 'e', 'f']
]

describe('Frie', function() {
  describe('#constructor()', function() {
    it('should exist', function() {
      let s = new Frie()
    })
  })

  describe('#del()', function() {
    it('should delete items', function() {
      let frie = new Frie()
      frie.set(PATH1, 'hello')
      assert.strictEqual(frie.get(PATH1), 'hello')

      frie.del(PATH1)
      assert.strictEqual(frie.get(PATH1), undefined)
    })

    it('should not freak out if there\'s nothing there', function() {
      assert.doesNotThrow(function() {
        let frie = new Frie()
        frie.del(PATH1)
      })
    })
  })

  describe('#get()', function() {
    it('should retrieve stored items', function() {
      let frie = new Frie()
      frie.set(PATH1, 'hello')
      assert.strictEqual(frie.get(PATH1), 'hello')
    })

    it('should return undefined if there\'s nothing there', function() {
      let frie = new Frie()
      assert.strictEqual(frie.get(PATH1), undefined)
    })
  })

  describe('#node()', function() {
    it('should return a node if there is one', function() {
      let frie = new Frie()
      frie.set(PATH1, 'hello')
      let node = frie.node(PATH1)

      assert.strictEqual(typeof node, 'object')
      assert.strictEqual(node.constructor.name, 'Frie')
    })

    it('should return undefined if there\'s nothing there', function() {
      let frie = new Frie()
      assert.strictEqual(frie.node(PATH1), undefined)
    })

    it('should return undefined if there\'s a missing next', function() {
      let frie = new Frie()
      frie.set([['a']], 'hello')
      assert.strictEqual(frie.node([['a']]).next, null)
      assert.strictEqual(frie.node([['a', 'b']]), undefined)
    })

    it('should return undefined if there\'s a missing fork', function() {
      let frie = new Frie()
      frie.set([['a']], 'hello')
      assert.strictEqual(frie.node([['a']]).fork, null)
      assert.strictEqual(frie.node([['a'], ['b']]), undefined)
    })

    it('should return undefined if there\'s a missing path segment', function() {
      let frie = new Frie()
      frie.set([['a', 'b']], 'hello')
      assert.strictEqual(frie.node([['a']]).next.get('c'), undefined)
      assert.strictEqual(frie.node([['a', 'c']]), undefined)
    })

    it('should treat * globs as path segments', function() {
      let frie = new Frie()
      frie.set(PATH2, 'hello')
      assert.strictEqual(frie.node(PATH2).data, 'hello')
    })

    it('should treat ** globs as path segments', function() {
      let frie = new Frie()
      frie.set(PATH3, 'hello')
      assert.strictEqual(frie.node(PATH3).data, 'hello')
    })

    it('should treat *** globs as path segments', function() {
      let frie = new Frie()
      frie.set(PATH4, 'hello')
      assert.strictEqual(frie.node(PATH4).data, 'hello')
    })
  })

  describe('#set()', function() {
    it('should store items', function() {
      let frie = new Frie()
      assert.strictEqual(frie.get(PATH1), undefined)

      frie.set(PATH1, 'hello')
      assert.strictEqual(frie.get(PATH1), 'hello')
    })

    it('should overwrite existing items', function() {
      let frie = new Frie()
      frie.set(PATH1, 'hello')
      frie.set(PATH1, 'goodbye')
      assert.strictEqual(frie.get(PATH1), 'goodbye')
    })
  })
})
