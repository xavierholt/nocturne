var tabs = {}

chrome.tabs.onCreated.addListener(function(tab) {
  console.debug("Tab " + tab.id + " created: " + tab.url)
  tabs[tab.id] = new URL(tab.url)
})

chrome.tabs.onRemoved.addListener(function(id, info) {
  console.debug("Tab " + id + " removed.")
  delete tabs[id]
})

chrome.tabs.onUpdated.addListener(function(id, diff, tab) {
  if(!diff.hasOwnProperty("url")) return
  console.debug("Tab " + tab.id + " updated: " + tab.url)
  tabs[tab.id] = new URL(tab.url)
})

chrome.tabs.query({}, function(found) {
  for(const tab of found) {
    console.debug("Tab " + tab.id + " discovered: " + tab.url)
    tabs[tab.id] = tabs[tab.id] || new URL(tab.url)
  }
})