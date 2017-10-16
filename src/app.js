require('./app/tabs.js').init()
require('./app/requests.js').init()

// TODO: Determine our browser.extension.getURL('/') and treat it specially?
nocturne.request.rules.add('**', '**.google-analytics.com', new nocturne.Policy({request: 'block'}))
nocturne.request.rules.add('**',         '**.slashdot.org', new nocturne.Policy({scripts: 'block'}))
