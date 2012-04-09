(function() {
  var EventEmitter, WSS, WebSocketListener,
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  EventEmitter = require('events').EventEmitter;

  WSS = require('ws').Server;

  WebSocketListener = (function(_super) {

    __extends(WebSocketListener, _super);

    function WebSocketListener(config) {
      this.config = config;
      WebSocketListener.__super__.constructor.call(this);
    }

    WebSocketListener.prototype.listen = function(server) {
      var self;
      this.wss = new WSS(this.config);
      self = this;
      return this.wss.on('connection', function(socket) {
        var sec_key;
        sec_key = socket.upgradeReq.headers['sec-websocket-key'];
        server.connect(sec_key, null, function(err, data) {
          return socket.send(JSON.stringify(data));
        });
        socket.on('message', function(data) {
          var query, type, _ref;
          try {
            _ref = JSON.parse(data), type = _ref.type, query = _ref.query;
          } catch (e) {
            self.emit('error', e, data);
            return;
          }
          switch (type) {
            case 'query':
              self.emit('query-update', null, query);
              return server.updateSchema(sec_key, query);
            default:
              return self.emit('error', new Error('Unsupported type: ' + type), data);
          }
        });
        return socket.on('close', function() {
          return server.disconnect(sec_key);
        });
      });
    };

    WebSocketListener.prototype.close = function() {
      return this.wss.close();
    };

    return WebSocketListener;

  })(EventEmitter);

  module.exports = WebSocketListener;

}).call(this);
