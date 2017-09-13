const Frie  = require('./frie.js')
const parse = require('./parse.js')

class Ruleset {
  constructor() {
    this.root = new Frie()
  }

  add(src, dst, data) {
    let s = parse.rule(src)
    let d = parse.rule(dst)
    this.root.set(s.concat(d), data)
  }

  get(src, dst) {
    let s = (src)? parse.url(src) : [['?'], ['?']]
    let d = (dst)? parse.url(dst) : [['?'], ['?']]

    let data = new Object()
    this.root.glob(s.concat(d), x => {data = Object.assign(data, x)})
    return data
  }
}

module.exports = Ruleset
