http = require 'http'
url  = require 'url'
http = require 'http'

module.exports = class TestServer

  constructor: ->
    @app = http.createServer (req, res) ->
      _url = url.parse(decodeURI(req.url), true)
      if _url.pathname == '/'
        res.writeHead 200
        res.end 'linda test server'

    @io = require('socket.io').listen(@app)
    @io.set 'log level', 2

    @linda = require('../').Server.listen(io: @io, server: @app)

  listen: (@port) ->
    @app.listen(@port)
    return @

  close: ->
    @app.close()
    return @
