let assert = require('assert')
let URL    = require('url').URL
let parse  = require('../lib/parse.js')

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

    it('should concatenate multiple parses', function() {
      let src = 'www.example.com'
      let dst = 'api.example.com'
      assert.deepEqual(parse.rule([src, dst]), [
        ['com', 'example', 'www'],
        ['***'],
        ['com', 'example', 'api'],
        ['***']
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

    it('should concatenate multiple parses', function() {
      let src = new URL('https://www.example.com')
      let dst = new URL('https://api.example.com')
      assert.deepEqual(parse.url([src, dst]), [
        ['com', 'example', 'www'],
        [''],
        ['com', 'example', 'api'],
        ['']
      ])
    })
  })
})
