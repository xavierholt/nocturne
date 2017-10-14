const assert = require('assert')
const Frie   = require('../src/lib/frie.js')

describe('Frie', function() {
  let make = function(first, second = undefined) {
    let frie = new Frie()
    if(second === undefined) {
      // Shuffle to guard against insertion order bugs:
      for(let i = first.length; i > 0; --i) {
        let j = Math.floor(Math.random() * i)
        let t = first[i - 1]
        first[i - 1] = first[j]
        first[j] = t
      }

      first.forEach(pair => frie.set(pair[0], pair[1]))
    }
    else {
      frie.set(first, second)
    }

    return frie
  }

  let glob = function(frie, path) {
    let data = Object.create(null)
    frie.glob(path, d => Object.assign(data, d))
    return data
  }

  describe('#constructor()', function() {
    it('should exist', function() {
      let s = new Frie()
    })
  })

  describe('#del()', function() {
    it('should delete items', function() {
      let frie = new Frie()
      let path = [['a'], ['b']]

      frie.set(path, 'hello')
      assert.strictEqual(frie.get(path), 'hello')

      frie.del(path)
      assert.strictEqual(frie.get(path), undefined)
    })

    it('should not freak out if there\'s nothing there', function() {
      assert.doesNotThrow(function() {
        let frie = new Frie()
        frie.del([['a'], ['b']])
      })
    })
  })

  describe('#get()', function() {
    it('should retrieve stored items', function() {
      let frie = new Frie()
      let path = [['a'], ['b']]

      frie.set(path, 'hello')
      assert.strictEqual(frie.get(path), 'hello')
    })

    it('should return undefined if there\'s nothing there', function() {
      let frie = new Frie()
      assert.strictEqual(frie.get([['a'], ['b']]), undefined)
    })
  })

  describe('#glob()', function() {
    it('should match exactly', function() {
      let path = [['a', 'b'], ['c']]
      let frie = make(path, {marco: 'polo'})
      assert.deepEqual(glob(frie, path), {marco: 'polo'})
    })

    it('should match * wildcards', function() {
      let frie = make([['a', '*'], ['*', 'd']], {marco: 'polo'})
      let data = glob(frie, [['a', 'b'], ['c', 'd']])
      assert.deepEqual(data, {marco: 'polo'})
    })

    it('should match ** wildcards', function() {
      let frie = make([['**'], ['**', 'd'], ['e', '**']], {marco: 'polo'})
      let data = glob(frie, [['a', 'b'], ['c', 'd'], ['e', 'f']])
      assert.deepEqual(data, {marco: 'polo'})
    })

    it('should match *** wildcards', function() {
      let frie = make([['***'], ['c', '***']], {marco: 'polo'})
      let data = glob(frie, [['a', 'b'], ['c', 'd']])
      assert.deepEqual(data, {marco: 'polo'})
    })

    it('should yield exact matches after * matches', function() {
      let frie = make([
        [[['a']], {x: 'a', a: 'a'}],
        [[['*']], {x: '*', b: 'b'}]
      ])

      let data = glob(frie, [['a']])
      assert.deepEqual(data, {a: 'a', b: 'b', x: 'a'})
    })

    it('should yield exact matches after ** matches', function() {
      let frie = make([
        [[['a' ]], {x: 'a',  a: 'a'}],
        [[['**']], {x: '**', b: 'b'}]
      ])

      let data = glob(frie, [['a']])
      assert.deepEqual(data, {a: 'a', b: 'b', x: 'a'})
    })

    it('should yield exact matches after *** matches', function() {
      let frie = make([
        [[['a'  ]], {x: 'a',   a: 'a'}],
        [[['***']], {x: '***', b: 'b'}]
      ])

      let data = glob(frie, [['a']])
      assert.deepEqual(data, {a: 'a', b: 'b', x: 'a'})
    })

    it('should yield * matches after ** matches', function() {
      let frie = make([
        [[['*' ]], {x: '*',  a: 'a'}],
        [[['**']], {x: '**', b: 'b'}]
      ])

      let data = glob(frie, [['a']])
      assert.deepEqual(data, {a: 'a', b: 'b', x: '*'})
    })

    it('should yield * matches after *** matches', function() {
      let frie = make([
        [[['*'  ]], {x: '*',   a: 'a'}],
        [[['***']], {x: '***', b: 'b'}]
      ])

      let data = glob(frie, [['a']])
      assert.deepEqual(data, {a: 'a', b: 'b', x: '*'})
    })

    it('should yield ** matches after *** matches', function() {
      let frie = make([
        [[['**' ]], {x: '**',  a: 'a'}],
        [[['***']], {x: '***', b: 'b'}]
      ])

      let data = glob(frie, [['a']])
      assert.deepEqual(data, {a: 'a', b: 'b', x: '**'})
    })

    it('should yield the most specific * match last', function() {
      let frie = make([
        [[['*', 'b', 'c']], {x: 'a', a: 'a'}],
        [[['a', '*', 'c']], {x: 'b', b: 'b'}],
        [[['a', 'b', '*']], {x: 'c', c: 'c'}]
      ])

      let data = glob(frie, [['a', 'b', 'c']])
      assert.deepEqual(data, {a: 'a', b: 'b', c: 'c', x: 'c'})
    })

    it('should yield the most specific ** match last', function() {
      let frie = make([
        [[['**', 'b',  'c' ]], {x: 'a', a: 'a'}],
        [[['a',  '**', 'c' ]], {x: 'b', b: 'b'}],
        [[['a',  'b',  '**']], {x: 'c', c: 'c'}]
      ])

      let data = glob(frie, [['a', 'b', 'c']])
      assert.deepEqual(data, {a: 'a', b: 'b', c: 'c', x: 'c'})
    })

    it('should yield the least greedy ** match last', function() {
      let frie = make([
        [[['**']],                   {x: 'a', a: 'a'}],
        [[['a',  '**']],             {x: 'b', b: 'b'}],
        [[['a',  'b',  '**']],       {x: 'c', c: 'c'}],
        [[['a',  'b',  'c',  '**']], {x: 'd', d: 'd'}]
      ])

      let data = glob(frie, [['a', 'b', 'c']])
      assert.deepEqual(data, {a: 'a', b: 'b', c: 'c', d: 'd', x: 'd'})
    })

    it('should yield the least greedy *** match last', function() {
      let frie = make([
        [[['***']],                   {x: 'a', a: 'a'}],
        [[['a',  '***']],             {x: 'b', b: 'b'}],
        [[['a',  'b',  '***']],       {x: 'c', c: 'c'}],
        [[['a',  'b',  'c',  '***']], {x: 'd', d: 'd'}]
      ])

      let data = glob(frie, [['a', 'b', 'c']])
      assert.deepEqual(data, {a: 'a', b: 'b', c: 'c', d: 'd', x: 'd'})
    })

    it('should only yield complete *** matches', function() {
      let frie = make([
        [[['***', 'b',  'c' ]],       {x: 'a', a: 'a'}],
        [[['a',  '***', 'c' ]],       {x: 'b', b: 'b'}],
        [[['a',  'b',  '***']],       {x: 'c', c: 'c'}],
        [[['a',  'b',  'c',  '***']], {x: 'd', d: 'd'}]
      ])

      let data = glob(frie, [['a', 'b', 'c']])
      assert.deepEqual(data, {c: 'c', d: 'd', x: 'd'})
    })

  })

  describe('#node()', function() {
    it('should return a node if there is one', function() {
      let frie = new Frie()
      let path = [['a'], ['b']]

      frie.set(path, 'hello')
      let node = frie.node(path)
      assert(node instanceof Frie)
      assert.strictEqual(node.data, 'hello')
    })

    it('should return undefined if there\'s nothing there', function() {
      let frie = new Frie()
      assert.strictEqual(frie.node([['a'], ['b']]), undefined)
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
      let path = [['a'], ['*']]

      frie.set(path, 'hello')
      assert.strictEqual(frie.node(path).data, 'hello')
    })

    it('should treat ** globs as path segments', function() {
      let frie = new Frie()
      let path = [['a'], ['**']]

      frie.set(path, 'hello')
      assert.strictEqual(frie.node(path).data, 'hello')
    })

    it('should treat *** globs as path segments', function() {
      let frie = new Frie()
      let path = [['a'], ['***']]

      frie.set(path, 'hello')
      assert.strictEqual(frie.node(path).data, 'hello')
    })
  })

  describe('#set()', function() {
    it('should store items', function() {
      let frie = new Frie()
      let path = [['a'], ['b']]
      assert.strictEqual(frie.get(path), undefined)

      frie.set(path, 'hello')
      assert.strictEqual(frie.get(path), 'hello')
    })

    it('should overwrite existing items', function() {
      let frie = new Frie()
      let path = [['a'], ['b']]

      frie.set(path, 'hello')
      frie.set(path, 'goodbye')
      assert.strictEqual(frie.get(path), 'goodbye')
    })
  })
})
