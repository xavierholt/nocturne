const assert   = require('assert')
const policies = require('../src/lib/policies')

describe('Policy::Allow', function() {
  describe('#onBeforeRequest()', function() {
    it('should return undefined', function() {
      let result = policies.ALLOW.onBeforeRequest({})
      assert.strictEqual(result, undefined)
    })
  })
})

describe('Policy::Block', function() {
  describe('#onBeforeRequest()', function() {
    it('should block the request', function() {
      let result = policies.BLOCK.onBeforeRequest({})
      assert.deepEqual(result, {cancel: true})
    })
  })

  describe('#onSendHeaders()', function() {
    it('should log a warning', function() {
      assert.logs('warn', function() {
        policies.BLOCK.onSendHeaders({})
      })
    })
  })
})

describe('Policy::Custom', function() {
  
})
