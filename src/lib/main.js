const STRIP = new Set([
  // 'cookie',
  'referer',
  'user-agent'
])

function ruleset(defs) {
  let rs = new RuleSet()
  for(const def of defs) {
    rs.add(parse.rule([def[0], def[1]]), def[2])
  }

  return rs
}

let myrules = ruleset([
  ['**',            '**',            {action: 'strip'}],
  ['**.google.com', '**.google.com', {action: 'allow'}],
  ['**',            '**.evil.com',   {action: 'block'}]
])

function intercept(request) {
  if(request.tabId > 0) {
    //TODO: Potential race condition!
    var src = tabs.get(request.tabId)
  }
  else if(request.originUrl) {
    // Workaround for #1 - no TabID for Firefox favicon GETs:
    console.warn('No TabID set - using Origin URL as source.')
    src = new URL(request.originUrl)
  }
  else {
    console.error('Could not determine source URL!')
    console.error(request)
    //TODO: Now what?
  }

  let dst = new URL(request.url)
  let nti = parse.url([src, dst])
  let act = myrules.get(nti)

  // Debugging stuff...
  console.log(act.action + ' ' + request.type + ' ' + src + ' -> ' + dst)

  switch(act.action) {
  case 'block':
    return {cancel: true}
  case 'allow':
    return
  case 'strip':
    return {requestHeaders: request.requestHeaders.filter(function(header) {
      return !STRIP.has(header.name.toLowerCase())
    })}
  default:
    console.error('Unknown action "' + act.action + '"!')
    //TODO: This is equivalent to allow...
    return
  }
}

function log_request(request) {
  if(request.requestHeaders) {
    request.headers = request.requestHeaders.map(header => {
      header.name + ': ' + header.value
    })
  }

  // if(request.requestBody && request.requestBody.raw) {
  //   let decoder = new TextDecoder('utf-8')
  //   request.body = request.requestBody.raw.map(item => {
  //     return decoder.decode(item.bytes)
  //   })
  // }

  console.log(request)
}

// browser.webRequest.onBeforeRequest.addListener(
//   log_request,
//   {urls: ['<all_urls>']},
//   ['requestBody']
// )

// browser.webRequest.onSendHeaders.addListener(
//   log_request,
//   {urls: ['<all_urls>']},
//   ['requestHeaders']
// )

browser.webRequest.onBeforeSendHeaders.addListener(
  intercept,
  {urls: ['<all_urls>']},
  ['blocking', 'requestHeaders']
)