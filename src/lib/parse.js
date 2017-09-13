const logger = require('./logger.js')

function cookies(input) {
  let result = []
  input.split(/\s*;\s*/).forEach(crumb => {
    let index = crumb.indexOf('=')
    if(index === -1) {
      logger.error('Failed to parse cookie!', {
        input: input,
        crumb: crumb
      })
    }
    else {
      result.push({
        name:  crumb.slice(0, index),
        value: crumb.slice(index + 1)
      })
    }
  })

  return result
}

function rule(input) {
  let path = input.split('/')
  let host = path.shift().split('.').reverse()
  let glob = module.exports.glob

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
  cookies: cookies,
  glob:    '***',
  rule:    rule,
  url:     url
}
