var actions = {
  allow: function(request) {
    return;
  },

  block: function(request) {
    return {cancel: true}
  },

  check: function(request) {
    var url = new URL(request.url);
    return getRule(url.hostname);
  },

  strip: function(request) {
    return;
  }
}

function filter(request) {
  var src = tabs[request.tabId];
  var dst = new URL(request.url);
  // console.log(new URL(request.url));
  // console.log(src.host + " -> " + dst.host);

  var action = types[request.type] || types["default"];
  if(action === "check") action = actions.check(request);
  console.log(action + ": " + src.host + " -> " + dst.host + " (" + request.type + ")");
  return actions[action].call(this, request);
}

browser.webRequest.onBeforeSendHeaders.addListener(
  filter,
  {urls: ["<all_urls>"]},
  ["blocking", "requestHeaders"]
);
