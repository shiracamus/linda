http    = require 'http'
path    = require 'path'
url     = require 'url'
fs      = require 'fs'
request = require 'request'
events  = require 'eventemitter2'
socketio = require 'socket.io'
debug = require('debug')('linda')

TupleSpace = require path.join(__dirname, 'tuplespace')
Tuple = require path.join(__dirname, 'tuple')
Client = require path.join(__dirname, 'linda-client')
SocketIOModule = require path.join(__dirname, 'io/socket-io')

module.exports.TupleSpace = TupleSpace
module.exports.Tuple = Tuple
module.exports.Client = Client

class Linda extends events.EventEmitter2
  constructor: ->
    @spaces = {}

    fs.readFile path.join(__dirname, 'linda-client.js'),
    (err, data) =>
      throw new Error "client js load error" if err
      @client_js_code = data

    setInterval =>
      debug "TupleSpace\tcheck expire"
      for name, space of @spaces
        if space?
          space.check_expire()
      debug "TupleSpace\tcheck expire done"
    , 60*3*1000 # 3min

  tuplespace: (name) ->
    return @spaces[name] or
           @spaces[name] = new TupleSpace(name)

  attach: (@io) ->
    @io.attach @
    return @

  listen: ->
    unless @io?
      # set default IO module
      @attach(new SocketIOModule())
    @io.listen arguments[0]

module.exports.Server = new Linda
