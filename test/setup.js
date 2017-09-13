const assert = require('assert')
const mocha  = require('mocha')
const sinon  = require('sinon')

const stublog = {
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

before(function() {
  // This would normally come from the browser...
  URL = require('url').URL

  // Capture logging so we can test it.
  // Also it keeps our output pretty!
  const logger   = require('../src/lib/logger.js')
  logger.level   = logger.levels.debug
  logger.backend = stublog
})

assert.logs = function(counts, callback) {
  stublog.reset()
  let result = callback()

  if(typeof counts === 'string') counts = {[counts]: 1}
  assert.strictEqual(stublog.debug.callCount, counts.debug || 0, 'wrong number of debug logs')
  assert.strictEqual(stublog.log.callCount,   counts.log   || 0, 'wrong number of normal logs')
  assert.strictEqual(stublog.warn.callCount,  counts.warn  || 0, 'wrong number of warning logs')
  assert.strictEqual(stublog.error.callCount, counts.error || 0, 'wrong number of error logs')

  return result
}
