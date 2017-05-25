// function debug(message) {
//   // istanbul ignore next
//   if(true) console.debug(message)
// }

class Rule {
  constructor(name) {
    this.name = name
    this.next = new Map
    this.fork = null
    this.data = null
  }

  // print(depth = 0) {
  //   console.log("   ".repeat(depth) + this.name)
  //   if(this.fork) {
  //     console.log("   ".repeat(depth) + " - FORK:")
  //     this.fork.print(depth + 1)
  //   }
  //   if(this.next.size !== 0) {
  //     console.log("   ".repeat(depth) + " - NEXT:")
  //     for(let [k, v] in this.next) k.print(depth + 1)
  //   }
  // }
}

class Matcher {
  constructor(path, options = {}) {
    this.path = path
    this.data = options['data'] || {}
    this.opts = options
  }

  match(rule, x = 0, y = 0) {
    var next

    // console.log('Checking rule ' + rule.name)

    if((next = rule.next.get('***'))) {
      // console.log('MATCHED ***')
      this.match(next, x, this.path[x].length)
    }

    if((next = rule.next.get('**'))) {
      // console.log('MATCHED **')
      for(let i = y; i <= this.path[x].length; ++i) {
        this.match(next, x, i)
      }
    }

    if(y < this.path[x].length) {
      if((next = rule.next.get('*'))) {
        // console.log('MATCHED *')
        this.match(next, x, y + 1)
      }

      if((next = rule.next.get(this.path[x][y]))) {
        // console.log('MATCHED ' + this.path[x][y])
        this.match(next, x, y + 1)
      }
    }
    else {
      if(rule.data) {
        // console.log('MATCHED ' + rule.name)
        Object.assign(this.data, rule.data)
      }
      if(rule.fork) {
        this.match(rule.fork, x + 1, 0)
      }
    }
  }
}

class RuleSet {
  constructor(rules) {
    this.root = new Rule('SRC ROOT')
  }

  add(path, data) {
    let t = null
    let r = this.root
    for(const segs of path) {
      for(const seg of segs) {
        if(!(t = r.next.get(seg))) {
          t = new Rule(seg)
          r.next.set(seg, t)
        }

        r = t
      }

      if(segs === path[path.length - 1]) {
        r.data = data
      }
      else {
        r = r.fork = r.fork || new Rule('[root]')
      }
    }
  }

  get(path) {
    let matcher = new Matcher(path)
    matcher.match(this.root)
    return matcher.data
  }
}

// istanbul ignore else
if(typeof module !== 'undefined') {
  module.exports = {
    Rule:    Rule,
    RuleSet: RuleSet,
    Matcher: Matcher
  }
}
