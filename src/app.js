// Hook up all our tab event handlers...
browser.tabs.onCreated.addListener(tabs.handlers.onCreated)
browser.tabs.onRemoved.addListener(tabs.handlers.onRemoved)
browser.tabs.onUpdated.addListener(tabs.handlers.onUpdated)

// ...figure out what tabs are already open...
browser.tabs.query({}).then(function(tabs) {
  for(const tab of tabs) {
    if(nocturne.tab.cache.has(tab.id)) {
      nocturne.logger.warn('Found pre-cached tab!', tab)
    }
    else {
      nocturne.tab.handlers.onCreated(tab)
    }
  }
}).catch(function(error) {
  nocturne.logger.error('Error querying open tabs!', error)
})

// ...and then start listening for requests!
function attach(name, flags) {
  browser.webRequest[name].addListener(
    nocturne.request.handlers[name],
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
