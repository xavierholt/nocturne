const assert = require('assert')
const Frie   = require('../src/lib/frie.js')

const PATH = [
  ['a', 'b', 'c'],
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
      frie.set(PATH, 'hello')
      assert.strictEqual(frie.get(PATH), 'hello')

      frie.del(PATH)
      let val = frie.get(PATH)
      assert.strictEqual(frie.get(PATH), undefined)
    })

    it('should not freak out if there\'s nothing there', function() {
      assert.doesNotThrow(function() {
        let frie = new Frie()
        frie.del(PATH)
      })
    })
  })

  describe('#get()', function() {
    it('should retrieve stored items', function() {
      let frie = new Frie()
      frie.set(PATH, 'hello')
      let val = frie.get(PATH)
      assert.strictEqual(frie.get(PATH), 'hello')
    })

    it('should return undefined if there\'s nothing there', function() {
      let frie = new Frie()
      let val = frie.get(PATH)
      assert.strictEqual(frie.get(PATH), undefined)
    })
  })

  describe('#set()', function() {
    it('should store items', function() {
      let frie = new Frie()
      assert.strictEqual(frie.get(PATH), undefined)

      frie.set(PATH, 'hello')
      let val = frie.get(PATH)
      assert.strictEqual(frie.get(PATH), 'hello')
    })
  })
})
