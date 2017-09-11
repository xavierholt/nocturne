const Policy = require('./policy.js')

class Block extends Policy {
  onBeforeRequest(request) {
    return {cancel: true}
  }

  onSendHeaders(request) {
    console.warn('Blocked request sent!')
    console.warn(request)
  }
}

module.exports = new Block()
