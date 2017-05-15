var ruleset = document.getElementById('rule-list')

function make(type, attrs) {
  var node = document.createElement(type);
  attrs = attrs || {};

  if(attrs['text']) {
    var text = document.createTextNode(attrs['text']);
    node.appendChild(text);
    delete attrs['text'];
  }

  for(key in attrs) {
    if(attrs.hasOwnProperty(key)) {
      node.setAttribute(key, attrs[key]);
    }
  }

  return node;
}

for(var i = 1; i < 4; ++i) {
  var tr = make('tr');

  var td = make('td');
  td.appendChild(make('input', {type: 'checkbox'}));
  tr.appendChild(td);

  var td = make('td');
  td.appendChild(make('input', {type: 'text', value: 'stuff'}));
  tr.appendChild(td);

  var td = make('td');
  td.appendChild(make('input', {type: 'text', value: 'stuff'}));
  tr.appendChild(td);

  var td = make('td');
  td.appendChild(make('input', {type: 'text', value: 'stuff'}));
  tr.appendChild(td);

  ruleset.appendChild(tr);
}
