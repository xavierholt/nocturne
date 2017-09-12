class Frie {
  constructor() {
    this.data = undefined
    this.next = null
    this.fork = null

    this.one  = null
    this.any  = null
    this.all  = null
  }

  del(rule) {
    let node = this.node(rule)
    if(node) node.data = undefined
  }

  get(rule) {
    let node = this.node(rule)
    return node && node.data
  }

  glob(rule, func, x = 0, y = 0) {
    let path = rule[x]

    if(this.all !== null) {
      this.all.glob(rule, func, x, path.length)
    }

    if(this.any !== null) {
      for(let i = path.length; i >= y; --i) {
        this.any.glob(rule, func, x, i)
      }
    }

    if(y < path.length) {
      if(this.one !== null) {
        this.one.glob(rule, func, x, y + 1)
      }

      if(this.next !== null) {
        let temp = this.next.get(path[y])
        if(temp) temp.glob(rule, func, x, y + 1)
      }
    }
    else {
      if(this.data !== undefined) {
        func(this.data)
      }
      if(this.fork !== null) {
        this.fork.glob(rule, func, x + 1, 0)
      }
    }
  }

  node(rule, x = 0, y = 0) {
    let path = rule[x]
    let next = null

    if(y < path.length) {
      switch(path[y]) {
        case '***': next = this.all; break
        case '**':  next = this.any; break
        case '*':   next = this.one; break
        default:    next = this.next && this.next.get(path[y])
      }

      if(next) {
        return next.node(rule, x, y + 1)
      }
    }
    else if(x < rule.length - 1) {
      if(this.fork !== null) {
        return this.fork.node(rule, x + 1, 0)
      }
    }
    else {
      return this
    }
  }

  set(rule, data, x = 0, y = 0) {
    let path = rule[x]
    let next = null

    if(y < path.length) {
      switch(path[y]) {
      case '***': next = this.all = this.all || new Frie(); break
      case '**':  next = this.any = this.any || new Frie(); break
      case '*':   next = this.one = this.one || new Frie(); break
      default:
        this.next = this.next || new Map()
        next = this.next.get(path[y])
        if(next === undefined) {
          this.next.set(path[y], next = new Frie())
        }
      }

      next.set(rule, data, x, y + 1)
    }
    else if(x < rule.length - 1) {
      this.fork = this.fork || new Frie()
      this.fork.set(rule, data, x + 1, 0)
    }
    else {
      this.data = data
    }
  }
}

module.exports = Frie
