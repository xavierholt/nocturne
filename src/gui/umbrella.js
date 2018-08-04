module.exports = class Umbrella extends preact.Component {
  constructor() {
    super()
    this.listener = (diff, area) => {
      let list  = [] + this.state.list
      let rules = Object.assign({}, this.state.rules)

      for(const key in diff) {
        if(key.indexOf('r:') === 0) {
          // Updated some rule list
          this.listener(diff, 'local')
          rules[key] = diff[key]
        }
      }

      if(area === 'local' && diff['lists']) {
        list  = diff['lists']
      }

      this.setState({
        list:  list,
        path:  this.state.path,
        rules: rules
      })
    }

    this.state = {
      list:  [],
      path:  [],
      rules: {}
    }

    browser.storage.sync.get().then(diff => {
      this.listener(diff, 'sync')
    })

    browser.storage.local.get().then(diff => {
      this.listener(diff, 'local')
    })
  }

  componentWillMount() {
    browser.storage.onChange.addListener(this.listener)
  }

  componentWillUnmount() {
    browser.storage.onChange.removeListener(this.listener)
  }

  render() {
    return el('div', null, null,
      new ListComponent()
    )
  }
}
