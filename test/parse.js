const assert = require('assert')
const parse  = require('../src/lib/parse.js')

describe('parse', function() {
  describe('#cookie()', function() {
    it('should parse single cookies', function() {
      let cookies = parse.cookies('hi=there')
      assert.deepEqual(cookies, [
        {name: 'hi', value: 'there'}
      ])
    })

    it('should parse multiple cookies', function() {
      let cookies = parse.cookies('hi=there; im=okay;are=you ; bye=now')
      assert.deepEqual(cookies, [
        {name: 'hi',  value: 'there'},
        {name: 'im',  value: 'okay'},
        {name: 'are', value: 'you'},
        {name: 'bye', value: 'now'}
      ])
    })

    it('should ignore invalid cookies', function() {
      let cookies = assert.logs('error', function() {
        return parse.cookies('hi=there; bwahahahahahaha; bye=now')
      })

      assert.deepEqual(cookies, [
        {name: 'hi',  value: 'there'},
        {name: 'bye', value: 'now'}
      ])
    })
  })

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

    it('should return an empty string for the root path', function() {
      let url = 'www.example.com/'
      assert.deepEqual(parse.rule(url), [
        ['com', 'example', 'www'],
        ['']
      ])
    })

    it('should expand terminal **s', function() {
      let url = '**.example.com/path/to/**'
      assert.deepEqual(parse.rule(url), [
        ['com', 'example', '***'],
        ['path', 'to', '***']
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

  describe('#setCookie()', function() {
    it('should be tested', function() {
      assert.equal('TODO', true)
    })

    it('should parse set-cookie headers', function() {
      let cookie = parse.setCookie('name=spartacus')
      assert.strictEqual(cookie.name,  'name')
      assert.strictEqual(cookie.value, 'spartacus')
    })

    it('should reject cookies with no assignment', function() {
      assert.logs('error', function() {
        let cookie = parse.setCookie('sid saw six sick sheep')
        assert.strictEqual(cookie, undefined)
      })
    })

    it('should reject cookies with no initial assignment', function() {
      assert.logs('error', function() {
        let cookie = parse.setCookie('steins;gate=awesome')
        assert.strictEqual(cookie, undefined)
      })
    })

    it('should leave cookie metadata attached to the result', function() {
      let cookie = parse.setCookie('favorite=macaroon; Path=/;Secure; HttpOnly')
      assert.deepEqual(cookie, {
        name:  'favorite',
        flags: ['Path=/', 'Secure', 'HttpOnly'],
        value: 'macaroon'
      })
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
