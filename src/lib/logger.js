const levels = {
  debug: 10,
  log:   20,
  warn:  30,
  error: 40
}

function generate(level) {
  return function(message, details) {
    if(module.exports.level <= levels[level]) {
      module.exports.backend[level](message, details)
    }
  }
}

module.exports = {
  error: generate('error'),
  warn:  generate('warn'),
  log:   generate('log'),
  debug: generate('debug'),

  backend: console,
  levels:  levels,
  level:   20
}
