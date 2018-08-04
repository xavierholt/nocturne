const el = preact.createElement

function listitem(item, query) {

  let cls = (item.name.match(query))? 'item match' : 'item'
  return el('a', {class: cls}, null,
    el('span', {'class': 'name'}, item.name),
    // el('span', {'class': 'desc'}, item.desc),
  )
}

module.exports = class Clock extends preact.Component {
  constructor() {
    super()
    this.state = {
      query: '',
      items: [
        {name: 'Stuff', desc: 'Just some stuff...'},
        {name: 'Such',  desc: 'Found it under the couch.'}
      ]
    }
  }

  render() {
    let query = this.state.query
    return el('div', null, null,
      el('h2', null, 'Rule Lists'),
      el('div', {class: 'search'}, null,
        el('input', {type: 'search', placeholder: 'Filter...', onChange: event => {
          console.log(event.target.value)
          this.setState({
            query: event.target.value.toLowerCase(),
            items: this.state.items
          })
        }})
      ),
      listitem({name: 'Temp Rules', desc: 'These get cleared when your browser restarts.'}, query),
      listitem({name: 'Local Rules', desc: 'These get saved, but only on this computer.'}, query),
      listitem({name: 'Synced Rules', desc: 'These get saved across all your computers.'}, query),
      el('div', {class: 'spacer'}),
      this.state.items.map(item => listitem(item, query))
    )
  }
}
