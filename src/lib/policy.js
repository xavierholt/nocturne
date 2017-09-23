const Allow = require('./policies/allow.js')
const Block = require('./policies/block.js')

module.exports = {
  ALLOW:  new Allow(),
  BLOCK:  new Block(),
  Custom: require('./policies/custom.js'),
  Policy: require('./policies/policy.js')
}
