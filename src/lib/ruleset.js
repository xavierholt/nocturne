const Frie   = require('./frie.js')
const parse  = require('./parse.js')
const Policy = require('./policy.js')

module.exports = class Ruleset {
  constructor() {
    this.root = new Frie()
  }

  add(src, dst, policy) {
    let s = parse.rule(src)
    let d = parse.rule(dst)
    this.root.set(s.concat(d), policy)
  }

  get(src, dst) {
    let s = (src)? parse.url(src) : [['?'], ['?']]
    let d = (dst)? parse.url(dst) : [['?'], ['?']]

    let policy = new Policy()
    this.root.glob(s.concat(d), x => {policy.merge(x)})
    return policy
  }
}
