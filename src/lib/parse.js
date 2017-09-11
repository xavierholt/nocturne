function rule(input, glob = '***') {
  let path = input.split('/')
  let host = path.shift().split('.').reverse()
  if(path.length === 0) path.push(glob)
  if(path[path.length-1] === '**') path[path.length-1] = glob
  if(host[host.length-1] === '**') host[host.length-1] = glob
  return [host, path]
}

function url(input) {
  let host = input.hostname.split('.').reverse()
  let path = input.pathname.split('/').slice(1)
  return [host, path]
}

module.exports = {
  rule: rule,
  url:  url
}
