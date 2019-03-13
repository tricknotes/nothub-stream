var util = require('util'),
  EventEmitter = require('events').EventEmitter,
  Stream = require('./stream'),
  JsonMatcher = require('./json_matcher');

function Service() {
  this.setMaxListeners(0);

  this.stream = new Stream();
  this.clients = Object.create(null);
  this.listeners = Object.create(null);
}

util.inherits(Service, EventEmitter);

Service.prototype.connect = function(clientId, query, listener) {
  var self = this;

  if (query) {
    this.updateSchema(clientId, query);
  }

  this.listeners[clientId] = function(error, data) {
    var matcher;
    if (error) {
      self.emit('error', error, data);
      return;
    }
    if ((matcher = self.clients[clientId]) && matcher.match(data)) {
      listener(null, data);
    }
  };

  this.stream.on('data-receive', this.listeners[clientId]);
};

Service.prototype.disconnect = function(clientId) {
  delete this.clients[clientId];

  if (this.listeners[clientId]) {
    this.stream.removeListener('data-receive', this.listeners[clientId]);
    delete this.listeners[clientId];
  }
};

Service.prototype.updateSchema = function(clientId, query) {
  this.clients[clientId] = new JsonMatcher(query);
};

Service.prototype.clientCount = function() {
  return this.stream.listeners('data-receive').length || 0;
};

Service.prototype.send = function(data) {
  this.stream.send(data);
};

module.exports = Service;
