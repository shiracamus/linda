http   = require 'http'
events = require 'eventemitter2'
url    = require 'url'
debug  = require('debug')('linda:io:socket-io')

module.exports = class SocketIOModule extends events.EventEmitter2
  constructor: ->

  attach: (@linda) ->
    @tuplespace = @linda.tuplespace.bind(@linda)
    return @

  listen: (opts = {io: null, server: null}) ->
    unless opts.io?
      throw new Error '"io" must be instance of Socket.IO'
    unless opts.server instanceof http.Server
      throw new Error '"server" must be instance of http.Server'
    @io = opts.io
    @server = opts.server

    @oldListeners = @server.listeners('request').splice(0)
    @server.removeAllListeners 'request'
    @server.on 'request', (req, res) =>  ## intercept requests
      _url = url.parse(decodeURI(req.url), true)
      if _url.pathname is "/linda/linda.js"
        debug "GET\t#{_url.pathname}"
        res.setHeader 'Content-Type', 'application/javascript'
        res.writeHead 200
        res.end @client_js_code
        return
      for listener in @oldListeners
        listener.call(@server, req, res)

    @io.sockets.on 'connection', (socket) =>
      cids = {}
      info = {
        from: (socket.handshake.headers['x-forwarded-for'] or
               socket.handshake.address?.address)
      }
      watch_cids = {}
      socket.on '__linda_write', (data) =>
        data.options?.from = info.from
        @tuplespace(data.tuplespace).write data.tuple, data.options
        debug "write\t#{JSON.stringify data} from #{info.from}"
        @linda.emit 'write', data

      socket.on '__linda_take', (data) =>
        cid = @tuplespace(data.tuplespace).option(data.options).take data.tuple, (err, tuple) ->
          cid = null
          socket.emit "__linda_take_#{data.id}", err, tuple
        cids[data.id] = cid
        debug "take\t#{JSON.stringify data} from #{info.from}"
        @linda.emit 'take', data
        socket.once 'disconnect', =>
          @tuplespace(data.tuplespace).cancel cid if cid

      socket.on '__linda_read', (data) =>
        cid = @tuplespace(data.tuplespace).option(data.options).read data.tuple, (err, tuple) ->
          cid = null
          socket.emit "__linda_read_#{data.id}", err, tuple
        cids[data.id] = cid
        debug "read\t#{JSON.stringify data} from #{info.from}"
        @linda.emit 'read', data
        socket.once 'disconnect', =>
          @tuplespace(data.tuplespace).cancel cid if cid

      watch_cids = {}
      socket.on '__linda_watch', (data) =>
        debug "watch\t#{JSON.stringify data} from #{info.from}"
        @linda.emit 'watch', data
        return if watch_cids[data.id]  # not watch if already watching
        watch_cids[data.id] = true
        cid = @tuplespace(data.tuplespace).watch data.tuple, (err, tuple) ->
          socket.emit "__linda_watch_#{data.id}", err, tuple
        cids[data.id] = cid
        socket.once 'disconnect', =>
          @tuplespace(data.tuplespace).cancel cid if cid

      socket.on '__linda_cancel', (data) =>
        debug "cancel\t#{JSON.stringify data} from #{info.from}"
        @linda.emit 'cancel', data
        @tuplespace(data.tuplespace).cancel cids[data.id]
        watch_cids[data.id] = false

    return @
