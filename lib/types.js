// Possible Values of the "WebRequest.type" Field
// https://developer.mozilla.org/en-US/Add-ons/WebExtensions/API/webRequest/ResourceType
// "beacon"
// "csp_report"
// "font"
// "image"
// "imageset"
// "main_frame"
// "media"
// "object"
// "ping"
// "script"
// "stylesheet"
// "sub_frame"
// "web_manifest"
// "websocket"
// "xbl"
// "xml_dtd"
// "xmlhttprequest"
// "xslt"
// "other"

var types = {
  default:    "check",
  beacon:     "block",
  main_frame: "allow",
  ping:       "block"
}
