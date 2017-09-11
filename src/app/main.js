const requests = require('../lib/requests.js')
const tabs     = require('../lib/tabs.js')

// Hook up all our tab event handlers...
browser.tabs.onCreated.addListener(tabs.handlers.onCreated)
browser.tabs.onRemoved.addListener(tabs.handlers.onRemoved)
browser.tabs.onUpdated.addListener(tabs.handlers.onUpdated)

// ...figure out what tabs are already open...
browser.tabs.query({}).then(function(found) {
  for(const tab of found) {
    if(tabs.cache.has(tab.id)) continue
    tabs.handlers.onCreated(tab)
  }
}).catch(function(error) {
  console.error('Error querying open tabs!')
  console.error(error)
})

// ...and then start listening for requests!
function attach(name, flags) {
  browser.webRequest[name].addListener(
    requests.handlers[name],
    {urls: ['<all_urls>']},
    flags
  )
}

attach('onBeforeRequest',     ['blocking'])
attach('onBeforeSendHeaders', ['blocking', 'requestHeaders'])
attach('onSendHeaders',       ['requestHeaders'])
attach('onHeadersReceived',   ['blocking', 'responseHeaders'])
attach('onCompleted',         [])
attach('onErrorOccurred',     [])
