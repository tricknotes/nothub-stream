(function() {
  var EventEmitter, SocketIOListener, sio,
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  EventEmitter = require('events').EventEmitter;

  sio = require('socket.io');

  SocketIOListener = (function(_super) {

    __extends(SocketIOListener, _super);

    function SocketIOListener(port, config) {
      this.port = port;
      this.config = config;
    }

    SocketIOListener.prototype.listen = function(server) {
      var self;
      this.io = sio.listen(this.port, this.config);
      self = this;
      return this.io.sockets.on('connection', function(socket) {
        socket.on('ping', function(data) {
          return socket.emit('pong', data);
        });
        server.connect(socket.id, null, function(err, data) {
          return socket.emit('gh_event pushed', data);
        });
        socket.on('query', function(query) {
          self.emit('query-update', null, socket.id, query);
          return server.updateSchema(socket.id, query);
        });
        return socket.on('disconnect', function() {
          server.disconnect(socket.id);
          return self.emit('disconnect', null, socket.id);
        });
      });
    };

    SocketIOListener.prototype.close = function() {
      return this.io.server.close();
    };

    return SocketIOListener;

  })(EventEmitter);

  module.exports = SocketIOListener;

}).call(this);
