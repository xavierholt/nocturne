module.exports.init = function() {
  const FILTER = {urls: ['<all_urls>']}

  browser.webRequest.onBeforeRequest.addListener(request => {
    let policy = nocturne.request.add(request)
    if(policy) return policy.onBeforeRequest(request)
  }, FILTER, ['blocking'])

  browser.webRequest.onBeforeSendHeaders.addListener(request => {
    let policy = nocturne.request.get(request)
    if(policy) return policy.onBeforeSendHeaders(request)
  }, FILTER, ['blocking', 'requestHeaders'])

  browser.webRequest.onSendHeaders.addListener(request => {
    let policy = nocturne.request.get(request)
    if(policy) return policy.onSendHeaders(request)
  }, FILTER, ['requestHeaders'])

  browser.webRequest.onHeadersReceived.addListener(request => {
    let policy = nocturne.request.get(request)
    if(policy) return policy.onHeadersReceived(request)
  }, FILTER, ['blocking', 'responseHeaders'])

  browser.webRequest.onCompleted.addListener(request => {
    nocturne.request.del(request)
  }, FILTER)

  browser.webRequest.onErrorOccurred.addListener(request => {
    nocturne.request.del(request)
  }, FILTER)
}
