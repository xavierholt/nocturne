let parse = {};

parse.rule = function(input, glob = '***') {
  if(Array.isArray(input)) {
    let result = []
    for(const url of input) {
      let temp = parse.rule(url, glob)
      result = result.concat(temp)
    }

    return result
  }

  let path = input.split('/')
  let host = path.shift().split('.').reverse()
  if(path.length === 0) path[0] = glob
  if(path[path.length-1] === '**') path[path.length-1] = glob
  if(host[host.length-1] === '**') host[host.length-1] = glob
  return [host, path]
}

parse.url = function(input) {
  if(Array.isArray(input)) {
    let result = []
    for(const url of input) {
      let temp = parse.url(url)
      result = result.concat(temp)
    }

    return result
  }

  let host = input.hostname.split('.').reverse()
  let path = input.pathname.split('/')
  path.shift()
  return [host, path]
}

if(module) {
  module.exports = parse;
}
