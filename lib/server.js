(function() {
  var EventEmitter, JsonMatcher, Server, Stream,
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  EventEmitter = require('events').EventEmitter;

  JsonMatcher = require('./json_matcher');

  Stream = require('./stream');

  Server = (function(_super) {

    __extends(Server, _super);

    function Server() {
      Server.__super__.constructor.call(this);
      this.setMaxListeners(0);
      this.stream = new Stream();
      this.clients = {};
      this.listeners = {};
    }

    Server.prototype.connect = function(client_id, query, listener) {
      var _this = this;
      if (query) this.updateSchema(client_id, query);
      this.listeners[client_id] = function(err, data) {
        var _ref;
        if (err) {
          _this.emit('error', err, data);
          return;
        }
        if ((_ref = _this.clients[client_id]) != null ? _ref.match(data) : void 0) {
          return listener(null, data);
        }
      };
      return this.stream.on('data-receive', this.listeners[client_id]);
    };

    Server.prototype.disconnect = function(client_id) {
      delete this.clients[client_id];
      if (this.listeners[client_id]) {
        this.stream.removeListener('data-receive', this.listeners[client_id]);
        return delete this.listeners[client_id];
      }
    };

    Server.prototype.updateSchema = function(client_id, query) {
      return this.clients[client_id] = new JsonMatcher(query);
    };

    Server.prototype.clientCount = function() {
      return this.stream.listeners('data-receive').length || 0;
    };

    Server.prototype.send = function(data) {
      return this.stream.send(data);
    };

    return Server;

  })(EventEmitter);

  module.exports = Server;

}).call(this);
