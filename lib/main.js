const STRIP = new Set([
  'cookie',
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
  console.log(request.url)
  let src = tabs[request.tabId]
  let dst = new URL(request.url)


  if(src === undefined) {
    // Seems to be a Firefox bug?
    if(request.tabId === -1 && request.originUrl) {
      console.warn('No TabID set - using Origin URL as source.')
      src = new URL(request.originUrl)
    }
    else {
      console.error('Could not find source URL!')
      // console.error(request)
    }
  }

  let nti = parse.url([src, dst])
  let act = myrules.get(nti)

  // Debugging stuff...
  // console.log(act.action + ' ' + src + ' -> ' + dst + ' (' + request.type + ')')

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
    return
  }
}

chrome.webRequest.onBeforeSendHeaders.addListener(
  intercept,
  {urls: ["<all_urls>"]},
  ["blocking", "requestHeaders"]
)
