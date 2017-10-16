const assert = require('assert')
const logger = require('../src/lib/logger.js')
const mocha  = require('mocha')
const sinon  = require('sinon')

before(function() {
  // These would normally come from the browser...
  if(typeof URL === 'undefined') {
    const u = require('url')
    URLSearchParams = u.URLSearchParams
    URL = u.URL
  }

  // Capture logging so we can test it.
  // Also it keeps our output pretty!
  logger.debug = sinon.stub()
  logger.log   = sinon.stub()
  logger.warn  = sinon.stub()
  logger.error = sinon.stub()

  logger.check = function(counts = {}) {
    assert.strictEqual(logger.debug.callCount, counts.debug || 0, 'wrong number of debug logs')
    assert.strictEqual(logger.log.callCount,   counts.log   || 0, 'wrong number of normal logs')
    assert.strictEqual(logger.warn.callCount,  counts.warn  || 0, 'wrong number of warning logs')
    assert.strictEqual(logger.error.callCount, counts.error || 0, 'wrong number of error logs')
  }

  logger.reset = function() {
    this.debug.reset()
    this.log.reset()
    this.warn.reset()
    this.error.reset()
  }
})

// Test all logging?
// afterEach(function() {
//   logger.check()
//   logger.reset()
// })

assert.logs = function(counts, callback) {
  logger.reset()
  let result = callback()

  if(typeof counts === 'string') counts = {[counts]: 1}
  logger.check(counts)
  return result
}
