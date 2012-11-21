var util = require('util')
  , EventEmitter = require('events').EventEmitter
  , sio = require('socket.io')

function SocketIOListener(port, config) {
  this.port = port;
  this.config = config;
}

util.inherits(SocketIOListener, EventEmitter);

SocketIOListener.prototype.listen = function(server, listener) {
  var self = this;
  this.io = sio.listen(this.port, this.config, listener);
  this.io.sockets.on('connection', function(socket) {
    socket.on('ping', function(data) {
      socket.emit('pong', data);
    });
    server.connect(socket.id, null, function(err, data) {
      socket.emit('gh_event pushed', data);
    });
    socket.on('query', function(query) {
      self.emit('query-update', null, socket.id, query);
      server.updateSchema(socket.id, query);
    });
    socket.on('disconnect', function() {
      server.disconnect(socket.id);
      self.emit('disconnect', null, socket.id);
    });
  });
};

SocketIOListener.prototype.close = function() {
  this.io.server.close();
};

module.exports = SocketIOListener;
