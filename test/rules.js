const assert  = require('assert')
const parse   = require('../src/lib/parse.js')
const Ruleset = require('../src/lib/ruleset.js')

function ruleset(defs) {
  // Shuffle to guard against insertion order bugs:
  for(let i = defs.length; i; --i) {
    let j = Math.floor(Math.random() * i)
    let t = defs[i - 1]
    defs[i - 1] = defs[j]
    defs[j] = t
  }

  let rs = new Ruleset()
  for(const def of defs) {
    rs.add(def[0], def[1], def[2])
  }

  return rs
}

describe('Ruleset', function() {
  // This lets us test ** and *** separately:
  before(function() {parse.glob =  '**'})
  after( function() {parse.glob = '***'})

  describe('#constructor()', function() {
    it('should exist', function() {
      let s = new Ruleset()
    })
  })

  describe('#get()', function() {
    it('should match exactly', function() {
      let rules = ruleset([
        ['www.example.com', 'www.example.com', {rule: 'example'}]
      ])

      let url  = new URL('http://www.example.com')
      let rule = rules.get(url, url)
      assert.deepEqual(rule, {rule: 'example'})
    })

    it('should provide dummy defaults', function() {
      let rules = ruleset([
        ['?', '?', {rule: 'example'}]
      ])

      let rule = rules.get(undefined, undefined)
      assert.deepEqual(rule, {rule: 'example'})
    })

    it('should return empty if nothing matches', function() {
      let rules = ruleset([
        ['www.example.com', '***', {rule: 'a'}]
      ])

      let url  = new URL('http://api.example.com')
      let rule = rules.get(url, url)
      assert.deepEqual(rule, {})
    })

    it('should match * wildcards', function() {
      let rules = ruleset([
        ['*.example.com', 'www.*.com', {rule: 'example'}]
      ])

      let url  = new URL('http://www.example.com')
      let rule = rules.get(url, url)
      assert.deepEqual(rule, {rule: 'example'})
    })

    it('should match ** wildcards', function() {
      let rules = ruleset([
        ['**.com', 'www.**.example.com', {rule: 'example'}]
      ])

      let url  = new URL('http://www.example.com')
      let rule = rules.get(url, url)
      assert.deepEqual(rule, {rule: 'example'})
    })

    it('should match *** wildcards', function() {
      let rules = ruleset([
        ['***.com', '***', {rule: 'example'}]
      ])

      let url  = new URL('http://www.example.com')
      let rule = rules.get(url, url)
      assert.deepEqual(rule, {rule: 'example'})
    })

    it('should prefer exact matches over *', function() {
      let rules = ruleset([
        ['www.example.com', '***', {rule: 'a'}],
        ['*.example.com',   '***', {rule: 'b'}],
      ])

      let url  = new URL('http://www.example.com')
      let rule = rules.get(url, url)
      assert.deepEqual(rule, {rule: 'a'})
    })

    it('should prefer exact matches over **', function() {
      let rules = ruleset([
        ['www.example.com', '***', {rule: 'a'}],
        ['**.example.com',  '***', {rule: 'b'}]
      ])

      let url  = new URL('http://www.example.com')
      let rule = rules.get(url, url)
      assert.deepEqual(rule, {rule: 'a'})
    })

    it('should prefer exact matches over ***', function() {
      let rules = ruleset([
        ['www.example.com', '***', {rule: 'a'}],
        ['***.example.com', '***', {rule: 'b'}]
      ])

      let url  = new URL('http://www.example.com')
      let rule = rules.get(url, url)
      assert.deepEqual(rule, {rule: 'a'})
    })

    it('should prefer * over **', function() {
      let rules = ruleset([
        ['*.example.com',  '***', {rule: 'a'}],
        ['**.example.com', '***', {rule: 'b'}]
      ])

      let url  = new URL('http://www.example.com')
      let rule = rules.get(url, url)
      assert.deepEqual(rule, {rule: 'a'})
    })

    it('should prefer * over ***', function() {
      let rules = ruleset([
        ['*.example.com',   '***', {rule: 'a'}],
        ['***.example.com', '***', {rule: 'b'}]
      ])

      let url  = new URL('http://www.example.com')
      let rule = rules.get(url, url)
      assert.deepEqual(rule, {rule: 'a'})
    })

    it('should prefer ** over ***', function() {
      let rules = ruleset([
        ['**.example.com',  '***', {rule: 'a'}],
        ['***.example.com', '***', {rule: 'b'}]
      ])

      let url  = new URL('http://www.example.com')
      let rule = rules.get(url, url)
      assert.deepEqual(rule, {rule: 'a'})
    })

    it('should prefer the least greedy match', function() {
      let rules = ruleset([
        ['www.example.com.**', '***', {rule: 'a'}],
        ['www.example.**',     '***', {rule: 'b'}],
        ['www.**',             '***', {rule: 'c'}],
        ['**',                 '***', {rule: 'd'}]
      ])

      let url  = new URL('http://www.example.com')
      let rule = rules.get(url, url)
      assert.deepEqual(rule, {rule: 'a'})
    })

    it('should prefer the most specific match', function() {
      let rules = ruleset([
        ['**.www.example.com', '***', {rule: 'a'}],
        ['**.example.com',     '***', {rule: 'b'}],
        ['**.com',             '***', {rule: 'c'}],
        ['**',                 '***', {rule: 'd'}]
      ])

      let url  = new URL('http://www.example.com')
      let rule = rules.get(url, url)
      assert.deepEqual(rule, {rule: 'a'})
    })

    it('should prefer the most specific domain', function() {
      let rules = ruleset([
        ['*.example.com', '***', {rule: 'a'}],
        ['www.*.com',     '***', {rule: 'b'}],
        ['www.example.*', '***', {rule: 'c'}]
      ])

      let url  = new URL('http://www.example.com')
      let rule = rules.get(url, url)
      assert.deepEqual(rule, {rule: 'a'})
    })

    it('should accumulate data from all matches', function() {
      let rules = ruleset([
        ['**.www.example.com', '***', {a: 'a'}],
        ['**.example.com',     '***', {b: 'b'}],
        ['**.com',             '***', {c: 'c'}],
        ['**',                 '***', {d: 'd'}]
      ])

      let url  = new URL('http://www.example.com')
      let rule = rules.get(url, url)
      assert.deepEqual(rule, {a: 'a', b: 'b', c: 'c', d: 'd'})
    })

    it('should always use Map methods', function() {
      let rules = ruleset([
        ['**', '**', {rule: 'hello'}]
      ])

      // This is a potential bug because Map#get() exists:
      // Looking up the next rule with square brackets returns it!
      // This test should make sure we always use Map#get() instead.
      let url  = new URL('http://www.example.com/get')
      let rule = rules.get(url, url)
      assert.deepEqual(rule, {rule: 'hello'})
    })
  })
})
