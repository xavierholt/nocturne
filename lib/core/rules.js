var rules = {};

function getRule(domain) {
  var hash = rules;
  var rule = 'allow';
  var cmps = domain.split(".");

  for(var i = cmps.length - 1; hash && i >= 0; --i) {
    var c = cmps[i];
    rule  = hash.rule || rule;
    hash  = hash[c];
  }

  return rule;
}

function setRule(domain, rule) {
  var hash = rules;
  var cmps = domain.split(".");

  for(var i = cmps.length - 1; i >= 0; --i) {
    var c   = cmps[i];
    hash[c] = hash[c] || {};
    hash    = hash[c];
  }

  hash.rule = rule;
}

setRule("doubleclick.net", "block");
setRule("quantserve.com",  "block");
