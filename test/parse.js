const assert = require('assert')
const URL    = require('url').URL
const parse  = require('../src/lib/parse.js')

describe('parse', function() {
  describe('#rule()', function() {
    it('should do what you expect', function() {
      let url = 'www.example.com/path/to/file.txt'
      assert.deepEqual(parse.rule(url), [
        ['com', 'example', 'www'],
        ['path', 'to', 'file.txt']
      ])
    })

    it('should assume a default path of ***', function() {
      let url = 'www.example.com'
      assert.deepEqual(parse.rule(url), [
        ['com', 'example', 'www'],
        ['***']
      ])
    })

    it('should expand terminal **s', function() {
      let url = '**.example.com/path/to/**'
      assert.deepEqual(parse.rule(url), [
        ['com', 'example', '***'],
        ['path', 'to', '***']
      ])
    })

    it('should expand terminal **s to arbitrary strings', function() {
      // This isn't a "production" feature, but it's very useful for testing.
      let url = '**.example.com/path/to/**'
      assert.deepEqual(parse.rule(url, 'cats'), [
        ['com', 'example', 'cats'],
        ['path', 'to', 'cats']
      ])
    })

    it('should not expand inner **s', function() {
      let url = 'www.**.com/path/**/file.txt'
      assert.deepEqual(parse.rule(url), [
        ['com', '**', 'www'],
        ['path', '**', 'file.txt']
      ])
    })
  })

  describe('#url()', function() {
    it('should do what you expect', function() {
      let url = new URL('https://www.example.com/path/to/file.txt')
      assert.deepEqual(parse.url(url), [
        ['com', 'example', 'www'],
        ['path', 'to', 'file.txt']
      ])
    })

    it('should return an empty string for the root path', function() {
      let url = new URL('https://www.example.com')
      assert.deepEqual(parse.url(url), [
        ['com', 'example', 'www'],
        ['']
      ])
    })
  })
})
