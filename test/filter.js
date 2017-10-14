const assert = require('assert')
const Filter = require('../src/lib/filter.js')

describe('Filter', function() {
  describe('#constructor()', function() {
    it('should have a default of undefined', function() {
      let filter = new Filter('dummy')
      assert.strictEqual(filter.general, undefined)
    })

    it('should have no special cases by default', function() {
      let filter = new Filter('dummy')
      assert.strictEqual(filter.special.size, 0)
    })

    it('should accept a specified default', function() {
      let filter = new Filter('dummy', 'hello')
      assert.strictEqual(filter.general, 'hello')
      assert.strictEqual(filter.special.size, 0)
    })

    it('should accept a default and special cases', function() {
      let filter = new Filter('dummy', 'hello', {special: 'case'})
      assert.strictEqual(filter.special.size, 1)
      assert.strictEqual(filter.special.get('special'), 'case')
    })

    it('should accept special cases only and default to undefined', function() {
      let filter = new Filter('dummy', {special: 'case'})
      assert.strictEqual(filter.special.size, 1)
      assert.strictEqual(filter.special.get('special'), 'case')
      assert.strictEqual(filter.general, undefined)
    })
  })

  describe('#action()', function() {
    it('should return the default by default', function() {
      let filter = new Filter('dummy', 'san andreas')
      let result = filter.action({name: 'bob', value: 'smith'})
      assert.strictEqual(result, 'san andreas')
    })

    it('should return a special case if applicable', function() {
      let filter = new Filter('dummy', 'san andreas', {bob: 'special'})
      let result = filter.action({name: 'bob', value: 'smith'})
      assert.strictEqual(result, 'special')
    })
  })

  describe('#filter()', function() {
    it('should return the input value to allow', function() {
      let filter = new Filter('dummy', 'allow')
      let result = filter.filter({name: 'bob', value: 'smith'})
      assert.strictEqual(result, 'smith')
    })

    it('should return undefined to block', function() {
      let filter = new Filter('dummy', 'block')
      let result = filter.filter({name: 'bob', value: 'smith'})
      assert.strictEqual(result, undefined)
    })

    it('should return a new value to set', function() {
      let filter = new Filter('dummy', 'reset')
      let result = filter.filter({name: 'bob', value: 'smith'})
      assert.strictEqual(result, 'reset')
    })
  })

  describe('#merge()', function() {
    it('should preserve the default if the other doesn\'t have one', function() {
      let filter = new Filter('dummy', 'general')
      filter.merge(new Filter('other', undefined))
      assert.strictEqual(filter.general, 'general')
    })

    it('should merge special cases if the other has no default', function() {
      let filter = new Filter('dummy', 'general', {magical: 'brew'})
      filter.merge(new Filter('other', undefined, {special: 'case'}))
      assert.strictEqual(filter.special.get('magical'), 'brew')
      assert.strictEqual(filter.special.get('special'), 'case')
    })

    it('should take on the other\'s default if it has one', function() {
      let filter = new Filter('dummy', 'general')
      filter.merge(new Filter('other', 'colonel'))
      assert.strictEqual(filter.general, 'colonel')
    })

    it('should clear special cases if the other has a default', function() {
      let filter = new Filter('dummy', 'general', {magical: 'brew'})
      filter.merge(new Filter('other', 'colonel', {special: 'case'}))
      assert.strictEqual(filter.special.get('special'), 'case')
      assert.strictEqual(filter.special.has('magical'), false)
    })
  })

  describe('#verify()', function() {
    it('should log nothing for allowed pairs', function() {
      let filter = new Filter('dummy', 'allow')
      assert.logs({}, function() {
        filter.verify({name: 'bob', value: 'smith'})
      })
    })

    it('should log nothing for overridden pairs', function() {
      let filter = new Filter('dummy', 'smith')
      assert.logs({}, function() {
        filter.verify({name: 'bob', value: 'smith'})
      })
    })

    it('should log a warning for blocked pairs', function() {
      let filter = new Filter('dummy', 'block')
      assert.logs('warn', function() {
        filter.verify({name: 'bob', value: 'smith'})
      })
    })

    it('should log a warning for unoverridden pairs', function() {
      let filter = new Filter('dummy', 'newvalue')
      assert.logs('warn', function() {
        filter.verify({name: 'bob', value: 'smith'})
      })
    })
  })
})
