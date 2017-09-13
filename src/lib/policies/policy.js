// Class with listeners for the WebRequest lifecycle.
// https://developer.mozilla.org/en-US/Add-ons/WebExtensions/API/webRequest

module.exports = class Policy {
  onBeforeRequest(request) {
    // Cancel the request here.
  }

  onBeforeSendHeaders(request) {
    // Modify request headers here.
  }

  onSendHeaders(request) {
    // See the actual request headers here.
  }

  onHeadersReceived(request) {
    // Modify response headers here.
  }

  onAuthRequired(request) {
    // Provide credentials here.
    // See the actual response headers here...
    // ...if the server needs credentials.
  }

  onBeforeRedirect(request) {
    // See the actual response headers here...
    // ...if there was a server-side redirect.
  }

  onResponseStarted(request) {
    // See the actual response headers here...
    // ...if everything worked normally.
  }

  onCompleted(request) {
    // We're done.
  }

  onErrorOccurred(request) {
    // Oh nose!
  }
}
