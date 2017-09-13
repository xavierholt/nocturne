const assert = require('assert')
const Filter = require('../src/lib/filter.js')

describe('Filter', function() {
  describe('#constructor()', function() {
    it('should have a default of allow', function() {
      let filter = new Filter('dummy')
      assert.strictEqual(filter.dfault, 'allow')
    })

    it('should have no exceptions by default', function() {
      let filter = new Filter('dummy')
      assert.strictEqual(filter.special.size, 0)
    })

    it('should accept a specified default', function() {
      let filter = new Filter('dummy', 'hello')
      assert.strictEqual(filter.dfault, 'hello')
    })

    it('should accept special cases', function() {
      let filter = new Filter('dummy', 'hello', {special: 'case'})
      assert.strictEqual(filter.special.size, 1)
      assert.strictEqual(filter.special.get('special'), 'case')
    })
  })

  describe('#action()', function() {
    it('should return the default by default', function() {
      let filter = new Filter('dummy')
      let result = filter.action({name: 'bob', value: 'smith'})
      assert.strictEqual(result, 'allow')
    })

    it('should return a special case if applicable', function() {
      let filter = new Filter('dummy', 'allow', {bob: 'special'})
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
