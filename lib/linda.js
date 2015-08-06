(function() {
  var Client, Linda, SocketIOModule, Tuple, TupleSpace, debug, events, fs, http, path, request, socketio, url,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  http = require('http');

  path = require('path');

  url = require('url');

  fs = require('fs');

  request = require('request');

  events = require('eventemitter2');

  socketio = require('socket.io');

  debug = require('debug')('linda');

  TupleSpace = require(path.join(__dirname, 'tuplespace'));

  Tuple = require(path.join(__dirname, 'tuple'));

  Client = require(path.join(__dirname, 'linda-client'));

  SocketIOModule = require(path.join(__dirname, 'io/socket-io'));

  module.exports.TupleSpace = TupleSpace;

  module.exports.Tuple = Tuple;

  module.exports.Client = Client;

  Linda = (function(superClass) {
    extend(Linda, superClass);

    function Linda() {
      this.spaces = {};
      fs.readFile(path.join(__dirname, 'linda-client.js'), (function(_this) {
        return function(err, data) {
          if (err) {
            throw new Error("client js load error");
          }
          return _this.client_js_code = data;
        };
      })(this));
      setInterval((function(_this) {
        return function() {
          var name, ref, space;
          debug("TupleSpace\tcheck expire");
          ref = _this.spaces;
          for (name in ref) {
            space = ref[name];
            if (space != null) {
              space.check_expire();
            }
          }
          return debug("TupleSpace\tcheck expire done");
        };
      })(this), 60 * 3 * 1000);
    }

    Linda.prototype.tuplespace = function(name) {
      return this.spaces[name] || (this.spaces[name] = new TupleSpace(name));
    };

    Linda.prototype.attach = function(io) {
      this.io = io;
      this.io.attach(this);
      return this;
    };

    Linda.prototype.listen = function() {
      if (this.io == null) {
        this.attach(new SocketIOModule());
      }
      return this.io.listen(arguments[0]);
    };

    return Linda;

  })(events.EventEmitter2);

  module.exports.Server = new Linda;

}).call(this);
