const assert = require('assert')
const logger = require('../src/lib/logger.js')
const mocha  = require('mocha')
const sinon  = require('sinon')

before(function() {
  // This would normally come from the browser...
  if(typeof URL === 'undefined') URL = require('url').URL

  // Capture logging so we can test it.
  // Also it keeps our output pretty!
  logger.level   = logger.levels.debug
  logger.backend = {
    debug: sinon.stub(),
    log:   sinon.stub(),
    warn:  sinon.stub(),
    error: sinon.stub(),

    reset: function() {
      this.debug.reset()
      this.log.reset()
      this.warn.reset()
      this.error.reset()
    }
  }
})

assert.logs = function(counts, callback) {
  logger.backend.reset()
  let result = callback()

  if(typeof counts === 'string') counts = {[counts]: 1}
  assert.strictEqual(logger.backend.debug.callCount, counts.debug || 0, 'wrong number of debug logs')
  assert.strictEqual(logger.backend.log.callCount,   counts.log   || 0, 'wrong number of normal logs')
  assert.strictEqual(logger.backend.warn.callCount,  counts.warn  || 0, 'wrong number of warning logs')
  assert.strictEqual(logger.backend.error.callCount, counts.error || 0, 'wrong number of error logs')

  return result
}
