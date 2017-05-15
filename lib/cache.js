var tabs = {};

browser.tabs.onCreated.addListener(function(tab) {
  console.debug("Tab " + tab.id + " created: " + tab.url);
  tabs[tab.id] = new URL(tab.url);
});

browser.tabs.onRemoved.addListener(function(id, info) {
  console.debug("Tab " + id + " removed.");
  delete tabs[id];
});

browser.tabs.onUpdated.addListener(function(id, diff, tab) {
  if(!diff.hasOwnProperty("url")) return;
  console.debug("Tab " + tab.id + " updated: " + tab.url);
  tabs[tab.id] = new URL(tab.url);
});

browser.tabs.query({}).then(function(found) {
  console.log("Found " + found.length + " tabs!");
  for(tab of found) {
    console.debug("Tab " + tab.id + " discovered: " + tab.url);
    tabs[tab.id] = tabs[tab.id] || new URL(tab.url);
  }
}).catch(function(error) {
  console.log("Could not load existing tabs.")
});
