const logger = require('./logger.js')

function cookie(input) {
  let index = input.indexOf('=')
  if(index > 0) return {
    name:  input.slice(0, index),
    value: input.slice(index + 1)
  }
}

function cookies(input) {
  let results = []
  input.split(/\s*;\s*/).forEach(crumb => {
    let result = cookie(crumb)
    if(result === undefined) {
      logger.error('Failed to parse cookie!', {
        input: input,
        crumb: crumb
      })
    }
    else {
      results.push(result)
    }
  })

  return results
}

function rule(input) {
  let path = input.split('/')
  let host = path.shift().split('.').reverse()

  if(path.length === 0) path.push('***')
  if(path[path.length-1] === '**') path[path.length-1] = '***'
  if(host[host.length-1] === '**') host[host.length-1] = '***'
  return [host, path]
}

function setCookie(input) {
  let flags  = input.split(/\s*;\s*/)
  let crumb  = flags.shift()
  let result = cookie(crumb)
  if(result === undefined) {
    logger.error('Failed to parse set-cookie!', {
      input: input,
      crumb: crumb
    })
  }
  else {
    result.flags = flags
  }

  return result
}

function url(input) {
  let host = input.hostname.split('.').reverse()
  let path = input.pathname.split('/').slice(1)
  return [host, path]
}

module.exports = {
  cookies:   cookies,
  rule:      rule,
  setCookie: setCookie,
  url:       url
}
