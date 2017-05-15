var tostrip = {
  // "cookie":     true,
  "referer":    true,
  "user-agent": true
};

var actions = {
  allow: function(request) {
    return;
  },

  block: function(request) {
    return {cancel: true}
  },

  check: function(request) {
    var url = new URL(request.url);
    return rules.get(url.hostname);
  },

  strip: function(request) {
    var h = request.requestHeaders.filter(function(header) {
      return !tostrip[header.name.toLowerCase()];
    });

    h.push({name: "User-Agent", value: 'Curl 7.0'});
    // h.push({name: "DNT", value: '0'});
    // var dst = new URL(request.url);
    // return {requestHeaders: [{name: "Host", value: dst.hostname}]};
    return {requestHeaders: h};
  }
};

function parse(request) {
  // console.log("Tab source: " + request.tabId);
  var url = tabs[request.tabId];

  request.nocturne = {
    src: (url)? url.host.split('.') : [],
    dst: new URL(request.url).host.split('.')
  }
}

function display(request) {
  parse(request);
  console.log(
    (request.nocturne.src || "[unknown]").join(".") +
    " -> " +
    (request.nocturne.dst || "[unknown]").join(".") +
    " (" +
    request.type +
    ")"
  );

  var h = request.requestHeaders;
  for(var i = 0; i < h.length; ++i) {
    console.log(" - " + h[i].name + ": " + h[i].value);
  }
}

function filter(request) {
  display(request);
  // var src, dst = parse(request);
  // var rule = rules.get(src, dst);
  // // console.log(new URL(request.url));
  // // console.log(src.host + " -> " + dst.host);

  // // var action = types[request.type] || types["default"];
  // // if(action === "check") action = actions.check(request);
  // console.log(src.host + " -> " + dst.host + " (" + request.type + ")");
  // return actions[action].call(this, request);
}

browser.webRequest.onBeforeSendHeaders.addListener(
  filter,
  {urls: ["<all_urls>"]},
  ["blocking", "requestHeaders"]
);

// browser.webRequest.onBeforeSendHeaders.addListener(
//   display,
//   {urls: ["<all_urls>"]},
//   ["requestHeaders"]
// );

