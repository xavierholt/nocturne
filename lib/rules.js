var DEBUG = false;

class Rule {
  constructor(name) {
    this.name = name
    this.next = new Map
    this.fork = null
    this.rule = null
  }

  print(depth = 0) {
    console.log("   ".repeat(depth) + this.name)
    if(this.fork) {
      console.log("   ".repeat(depth) + " - FORK:")
      this.fork.print(depth + 1)
    }

    if(this.next.size !== 0) {
      console.log("   ".repeat(depth) + " - NEXT:")
      for(let [k, v] in this.next) k.print(depth + 1)
    }
  }
}

class Matcher {
  constructor(path, options = {}) {
    this.path = path
    this.rule = options['rule'] || {}
    this.opts = options
  }

  match(rule, x = 0, y = 0) {
    var next;

    // console.log('Checking rule ' + rule.name)

    if((next = rule.next['***'])) {
      if(DEBUG) console.log(' MATCHED ***')
      this.match(next, x, this.path[x].length)
    }

    if((next = rule.next['**'])) {
      if(DEBUG) console.log(' MATCHED **')
      for(let i = y; i <= this.path[x].length; ++i) {
        this.match(next, x, i)
      }
    }

    //TODO: Careful here...
    if(y < this.path[x].length) {
      if((next = rule.next['*'])) {
        if(DEBUG) console.log(' MATCHED *')
        this.match(next, x, y + 1)
      }

      if((next = rule.next[this.path[x][y]])) {
        if(DEBUG) console.log(' MATCHED ' + this.path[x][y])
        this.match(next, x, y + 1)
      }
    }
    else {
      if(rule.rule) {
        // console.log(' MATCHED ' + rule.name)
        Object.assign(this.rule, rule.rule)
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

  add(path, rule) {
    let r = this.root
    for(const segs of path) {
      for(const seg of segs) {
        r = r.next[seg] = r.next[seg] || new Rule(seg)
      }

      if(segs === path[path.length - 1]) {
        r.rule = rule
      }
      else {
        r = r.fork = r.fork || new Rule('[root]')
      }
    }
  }

  get(path) {
    let matcher = new Matcher(path)
    matcher.match(this.root)
    return matcher.rule
  }
};

if(module) {
  module.exports = {
    Rule:    Rule,
    RuleSet: RuleSet,
    Matcher: Matcher
  }
}
