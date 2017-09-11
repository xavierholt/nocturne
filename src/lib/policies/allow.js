const Policy = require('./policy.js')

class Allow extends Policy {
  // The default Policy implementation allows everything.
}

module.exports = new Allow()
