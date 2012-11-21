var util = require('util')
  , EventEmitter = require('events').EventEmitter
  , sio = require('socket.io')

function SocketIOListener(port, config) {
  this.port = port;
  this.config = config;
}

util.inherits(SocketIOListener, EventEmitter);

SocketIOListener.prototype.listen = function(service, listener) {
  var self = this;
  this.io = sio.listen(this.port, this.config, listener);
  this.io.sockets.on('connection', function(socket) {
    socket.on('ping', function(data) {
      socket.emit('pong', data);
    });
    service.connect(socket.id, null, function(err, data) {
      socket.emit('gh_event pushed', data);
    });
    socket.on('query', function(query) {
      self.emit('query-update', null, socket.id, query);
      service.updateSchema(socket.id, query);
    });
    socket.on('disconnect', function() {
      service.disconnect(socket.id);
      self.emit('disconnect', null, socket.id);
    });
  });
};

SocketIOListener.prototype.close = function() {
  this.io.server.close();
};

module.exports = SocketIOListener;
