const Policy = require('./policy.js')
const logger = require('../logger.js')

module.exports = class Block extends Policy {
  onBeforeRequest(request) {
    return {cancel: true}
  }

  onSendHeaders(request) {
    logger.warn('Blocked request sent!', request)
  }
}
