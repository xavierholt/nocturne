const assert  = require('assert')
const parse   = require('../src/lib/parse.js')
const Policy  = require('../src/lib/policy.js')
const Ruleset = require('../src/lib/ruleset.js')

describe('Ruleset', function() {
  describe('#constructor()', function() {
    it('should exist', function() {
      let s = new Ruleset()
    })
  })

  describe('#add()', function() {
    it('should add new rules', function() {
      let policy  = new Policy()
      let ruleset = new Ruleset()
      ruleset.add('*.example.com', '***', policy)

      let url = new URL('https://www.example.com')
      let found = ruleset.get(url, url)
      assert.deepEqual(found, policy)
    })

    //TODO: Overwrite (or MERGE!) existing rules
  })

  describe('#get()', function() {
    it('should return a matching policy if there is one', function() {
      let ruleset = new Ruleset()
      let policy  = new Policy({request: 'block'})
      ruleset.add('www.example.com', '***', policy)

      let url = new URL('https://www.example.com')
      let found = ruleset.get(url, url)
      assert.deepEqual(found, policy)
    })

    it('should return a matching policy if there is one', function() {
      let ruleset = new Ruleset()
      let policy  = new Policy({request: 'block'})
      ruleset.add('www.example.com', '***', policy)

      let url = new URL('https://not.example.com')
      let found = ruleset.get(url, url)
      assert.deepEqual(found, new Policy())
    })

    it('should provide dummy defaults for undefined URLs', function() {
      let ruleset = new Ruleset()
      let policy  = new Policy({request: 'block'})
      ruleset.add('?/?', '?/?', policy)

      let found = ruleset.get(undefined, undefined)
      assert.deepEqual(found, policy)
    })
  })
})
