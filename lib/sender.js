var util = require('util'),
  EventEmitter = require('events').EventEmitter,
  sio = require('socket.io');

function Sender(port, config) {
  this.port = port;
  this.config = config;
}

util.inherits(Sender, EventEmitter);

Sender.prototype.listen = function(service, listener) {
  var self = this;

  this.io = sio.listen(this.port, this.config, listener);

  this.io.sockets.on('connection', function(socket) {
    socket.on('ping', function(data) {
      socket.emit('pong', data);
    });

    service.connect(socket.id, null, function(error, data) {
      // TODO Rename next version (avoid using 'gh_event')
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

Sender.prototype.close = function() {
  this.io.server.close();
};

module.exports = Sender;
