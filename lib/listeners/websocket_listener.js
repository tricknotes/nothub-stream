var util = require('util')
  , EventEmitter = require('events').EventEmitter
  , WSS = require('ws').Server

function WebSocketListener(config) {
  this.config = config;
}

util.inherits(WebSocketListener, EventEmitter);

WebSocketListener.prototype.listen = function(server, listener) {
  var self = this;
  this.wss = new WSS(this.config, listener);
  this.wss.on('connection', function(socket) {
    var sec_key = socket.upgradeReq.headers['sec-websocket-key'];
    server.connect(sec_key, null, function(err, data) {
      socket.send(JSON.stringify(data));
    });
    socket.on('message', function(data) {
      var parsed, query, type;
      try {
        parsed = JSON.parse(data);
        type = parsed.type;
        query = parsed.query;
      } catch (e) {
        self.emit('error', e, data);
        return;
      }
      switch (type) {
        case 'query':
          self.emit('query-update', null, query);
          server.updateSchema(sec_key, query);
          break;
        default:
          self.emit('error', new Error('Unsupported type: ' + type), data);
      }
    });
    socket.on('close', function() {
      server.disconnect(sec_key);
    });
  });
};

WebSocketListener.prototype.close = function() {
  this.wss.close();
};

module.exports = WebSocketListener;
