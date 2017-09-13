const assert = require('assert')
const logger = require('../src/lib/logger.js')

describe('logger', function() {
  describe('#[level]()', function() {
    it('should log to the console', function() {
      assert.logs('error', function() {
        logger.error('Hey!  I\'m a log message!')
      })
    })

    it('should not log messages with too low a level', function() {
      const oldlevel = logger.level
      logger.level = logger.levels.warn

      assert.logs({}, function() {
        logger.debug('Hey!  I\'m a log message!')
      })

      logger.level = oldlevel
    })
  })
})
