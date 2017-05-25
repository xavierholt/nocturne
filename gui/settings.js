let rule_edit = document.getElementById('rule-edit')
let rule_list = document.getElementById('rule-list')

function make(type, attrs) {
  let node = document.createElement(type)
  attrs = attrs || {}

  if(attrs.hasOwnProperty('text')) {
    let text = document.createTextNode(attrs['text'])
    node.appendChild(text)
    delete attrs['text']
  }

  for(key in attrs) {
    if(attrs.hasOwnProperty(key)) {
      node.setAttribute(key, attrs[key])
    }
  }

  return node
}

const HOST_SEGMENT = '(\\*\\*?|[a-z0-9]|[a-z0-9][a-z0-9-]*[a-z0-9])'
const HOST_PATTERN = HOST_SEGMENT + '(\\.' + HOST_SEGMENT + ')*'

const PATH_SEGMENT = '(\\*\\*?|[a-z0-9A-Z_-]+)'
const PATH_PATTERN = '(/' + PATH_SEGMENT + ')*'

const RULE_PATTERN = HOST_PATTERN + PATH_PATTERN

function grow(thead, rule, etc) {
  var tr = make('tr')

  var td = make('td')
  td.appendChild(make('input', {type: 'text', value: rule['src'], required: true, pattern: RULE_PATTERN}))
  tr.appendChild(td)

  var td = make('td')
  td.appendChild(make('input', {type: 'text', value: rule['dst'], required: true, pattern: RULE_PATTERN}))
  tr.appendChild(td)

  var td = make('td')
  td.appendChild(make('input', {type: 'text', value: rule['act'], required: true, pattern: 'allow|block|strip'}))
  tr.appendChild(td)

  var td = make('td')
  var rm = etc || make('a', {class: 'rm', href: '#', text: 'x'})
  td.appendChild(rm)
  tr.appendChild(td)

  thead.appendChild(tr)
}

function read(tr) {
  return {
    src: tr.children[0].children[0].value,
    dst: tr.children[1].children[0].value,
    act: tr.children[2].children[0].value
  }
}

function load() {
  browser.storage.local.get().then(function(items) {
    while(rule_list.firstChild) {
      rule_list.removeChild(rule_list.firstChild)
    }

    let rules = items['rules'] || []
    for(const rule of rules) {
      grow(rule_list, rule)
    }
  }).catch(function(error) {
    console.error('Error while loading rules:')
    console.error(error)
  })
}

function save() {
  let rules = []

  let trs = rule_list.children
  for(let i = 0; i < trs.length; ++i) {
    rules.push(read(trs.item(i)))
  }

  console.log(rules)
  browser.storage.local.set({
    rules: rules
  }).catch(function(error) {
    console.error('Error while saving rules:')
    console.error(error)
  })
}

grow(rule_edit, {
  src: '**.example.com',
  dst: '**.example.com',
  act: 'allow'
}, make('a', {
  class: 'mk',
  href:  '#',
  text:  '+'
}))

load()

rule_edit.addEventListener('click', function(event) {
  if(event.target.classList.contains('mk')) {
    grow(rule_list, read(rule_edit.children[0]))
  }
})

rule_list.addEventListener('click', function(event) {
  if(event.target.classList.contains('rm')) {
    rule_list.removeChild(event.target.parentNode.parentNode)
  }
})

document.getElementById('save').addEventListener('click', function(event) {
  event.preventDefault()
  save()
})

document.getElementById('load').addEventListener('click', function(event) {
  event.preventDefault()
  load()
})
