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

Server.prototype.connect = function(client_id, query, listener) {
  var self = this;
  if (query) {
    this.updateSchema(client_id, query);
  }
  this.listeners[client_id] = function(err, data) {
    var matcher;
    if (err) {
      self.emit('error', err, data);
      return;
    }
    if ((matcher = self.clients[client_id]) && matcher.match(data)) {
      listener(null, data);
    }
  };
  this.stream.on('data-receive', this.listeners[client_id]);
};

Server.prototype.disconnect = function(client_id) {
  delete this.clients[client_id];
  if (this.listeners[client_id]) {
    this.stream.removeListener('data-receive', this.listeners[client_id]);
    delete this.listeners[client_id];
  }
};

Server.prototype.updateSchema = function(client_id, query) {
  this.clients[client_id] = new JsonMatcher(query);
};

Server.prototype.clientCount = function() {
  return this.stream.listeners('data-receive').length || 0;
};

Server.prototype.send = function(data) {
  this.stream.send(data);
};

module.exports = Server;
