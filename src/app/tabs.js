module.exports.init = function() {
  browser.tabs.onCreated.addListener(tab => {
    nocturne.tab.set(tab.id, tab.url)
  })

  browser.tabs.onRemoved.addListener((id, info) => {
    nocturne.tab.del(id)
  })

  browser.tabs.onUpdated.addListener((id, diff, tab) => {
    if(diff.hasOwnProperty('url')) nocturne.tab.set(tab.id, tab.url)
  })

  // Not enough metadata to tell if it's a tab transition or not:
  // browser.webNavigation.onBeforeNavigate.addListener(details => {
  //   console.log(`Tab ${details.tabId} navigation started.`, details)
  // })

  // Might be enough, but the timing's still not prefect:
  browser.webNavigation.onCommitted.addListener(details => {
    if(details.transition_type === 'auto_subframe') return
    console.log(`Tab ${details.tabId} navigation committed.`, details)
  })

  // And figure out what tabs are already open!
  browser.tabs.query({}).then(tabs => {
    for(const tab of tabs) {
      if(nocturne.tab.cache.has(tab.id)) {
        nocturne.logger.warn('Found pre-cached tab!', tab)
      }
      else {
        nocturne.tab.set(tab.id, tab.url)
      }
    }
  }).catch(error => {
    nocturne.logger.error('Error querying open tabs!', error)
  })
}
