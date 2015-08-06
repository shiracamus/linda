(function() {
  var SocketIOModule, debug, events, http, url,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  http = require('http');

  events = require('eventemitter2');

  url = require('url');

  debug = require('debug')('linda:io:socket-io');

  module.exports = SocketIOModule = (function(superClass) {
    extend(SocketIOModule, superClass);

    function SocketIOModule() {}

    SocketIOModule.prototype.attach = function(linda) {
      this.linda = linda;
      this.tuplespace = this.linda.tuplespace.bind(this.linda);
      return this;
    };

    SocketIOModule.prototype.listen = function(opts) {
      if (opts == null) {
        opts = {
          io: null,
          server: null
        };
      }
      if (opts.io == null) {
        throw new Error('"io" must be instance of Socket.IO');
      }
      if (!(opts.server instanceof http.Server)) {
        throw new Error('"server" must be instance of http.Server');
      }
      this.io = opts.io;
      this.server = opts.server;
      this.oldListeners = this.server.listeners('request').splice(0);
      this.server.removeAllListeners('request');
      this.server.on('request', (function(_this) {
        return function(req, res) {
          var _url, i, len, listener, ref, results;
          _url = url.parse(decodeURI(req.url), true);
          if (_url.pathname === "/linda/linda.js") {
            debug("GET\t" + _url.pathname);
            res.setHeader('Content-Type', 'application/javascript');
            res.writeHead(200);
            res.end(_this.client_js_code);
            return;
          }
          ref = _this.oldListeners;
          results = [];
          for (i = 0, len = ref.length; i < len; i++) {
            listener = ref[i];
            results.push(listener.call(_this.server, req, res));
          }
          return results;
        };
      })(this));
      this.io.sockets.on('connection', (function(_this) {
        return function(socket) {
          var cids, info, ref, watch_cids;
          cids = {};
          info = {
            from: socket.handshake.headers['x-forwarded-for'] || ((ref = socket.handshake.address) != null ? ref.address : void 0)
          };
          watch_cids = {};
          socket.on('__linda_write', function(data) {
            var ref1;
            if ((ref1 = data.options) != null) {
              ref1.from = info.from;
            }
            _this.tuplespace(data.tuplespace).write(data.tuple, data.options);
            debug("write\t" + (JSON.stringify(data)) + " from " + info.from);
            return _this.linda.emit('write', data);
          });
          socket.on('__linda_take', function(data) {
            var cid;
            cid = _this.tuplespace(data.tuplespace).option(data.options).take(data.tuple, function(err, tuple) {
              cid = null;
              return socket.emit("__linda_take_" + data.id, err, tuple);
            });
            cids[data.id] = cid;
            debug("take\t" + (JSON.stringify(data)) + " from " + info.from);
            _this.linda.emit('take', data);
            return socket.once('disconnect', function() {
              if (cid) {
                return _this.tuplespace(data.tuplespace).cancel(cid);
              }
            });
          });
          socket.on('__linda_read', function(data) {
            var cid;
            cid = _this.tuplespace(data.tuplespace).option(data.options).read(data.tuple, function(err, tuple) {
              cid = null;
              return socket.emit("__linda_read_" + data.id, err, tuple);
            });
            cids[data.id] = cid;
            debug("read\t" + (JSON.stringify(data)) + " from " + info.from);
            _this.linda.emit('read', data);
            return socket.once('disconnect', function() {
              if (cid) {
                return _this.tuplespace(data.tuplespace).cancel(cid);
              }
            });
          });
          watch_cids = {};
          socket.on('__linda_watch', function(data) {
            var cid;
            debug("watch\t" + (JSON.stringify(data)) + " from " + info.from);
            _this.linda.emit('watch', data);
            if (watch_cids[data.id]) {
              return;
            }
            watch_cids[data.id] = true;
            cid = _this.tuplespace(data.tuplespace).watch(data.tuple, function(err, tuple) {
              return socket.emit("__linda_watch_" + data.id, err, tuple);
            });
            cids[data.id] = cid;
            return socket.once('disconnect', function() {
              if (cid) {
                return _this.tuplespace(data.tuplespace).cancel(cid);
              }
            });
          });
          return socket.on('__linda_cancel', function(data) {
            debug("cancel\t" + (JSON.stringify(data)) + " from " + info.from);
            _this.linda.emit('cancel', data);
            _this.tuplespace(data.tuplespace).cancel(cids[data.id]);
            return watch_cids[data.id] = false;
          });
        };
      })(this));
      return this;
    };

    return SocketIOModule;

  })(events.EventEmitter2);

}).call(this);
