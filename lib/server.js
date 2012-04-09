var util = require('util')
  , EventEmitter = require('events').EventEmitter
  , Stream = require('./stream')
  , JsonMatcher = require('./json_matcher')

function Server() {
  this.setMaxListeners(0);
  this.stream = new Stream();
  this.clients = {};
  this.listeners = {};
}

util.inherits(Server, EventEmitter);

Server.prototype.connect = function(clientId, query, listener) {
  var self = this;
  if (query) {
    this.updateSchema(clientId, query);
  }
  this.listeners[clientId] = function(err, data) {
    var matcher;
    if (err) {
      self.emit('error', err, data);
      return;
    }
    if ((matcher = self.clients[clientId]) && matcher.match(data)) {
      listener(null, data);
    }
  };
  this.stream.on('data-receive', this.listeners[clientId]);
};

Server.prototype.disconnect = function(clientId) {
  delete this.clients[clientId];
  if (this.listeners[clientId]) {
    this.stream.removeListener('data-receive', this.listeners[clientId]);
    delete this.listeners[clientId];
  }
};

Server.prototype.updateSchema = function(clientId, query) {
  this.clients[clientId] = new JsonMatcher(query);
};

Server.prototype.clientCount = function() {
  return this.stream.listeners('data-receive').length || 0;
};

Server.prototype.send = function(data) {
  this.stream.send(data);
};

module.exports = Server;
