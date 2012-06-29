var net = require('net')
  , expect = require('expect.js')
  , WebSocket = require('ws')
  , Server = require('../../lib/server')
  , WebSocketListener = require('../../lib/listeners/websocket_listener')

describe('WebSocketListener', function() {
  var server = null
    , listener = null
    , port = 15000

  beforeEach(function() {
    server = new Server();
    listener = new WebSocketListener({ port: ++port });
  });

  afterEach(function() {
    listener.close();
  });

  describe('#listen()', function() {
    beforeEach(function(done) {
      listener.listen(server, done);
    });

    it('should listen port', function(done) {
      net.connect(port, 'localhost', function() {
        done();
      });
    });

    it('should accept query', function(done) {
      var ws = new WebSocket('ws://localhost:' + port);
      listener.on('query-update', function(err, query) {
        expect(query).to.eql({ type: 'OK' });
        done();
      });
      ws.on('open', function() {
        ws.send(JSON.stringify({ type: 'query', query: { type: 'OK' } }));
      });
    });

    it('should emit "error" when unexpected type received', function(done) {
      var ws = new WebSocket('ws://localhost:' + port);
      listener.on('error', function(err, data) {
        expect(err.message).to.contain('UNKNOWN');
        done();
      });
      ws.on('open', function() {
        ws.send(JSON.stringify({ type: 'UNKNOWN' }));
      });
    });
    it('should emit "error" when request parse failed', function(done) {
      var ws = new WebSocket('ws://localhost:' + port);
      listener.on('error', function(err, data) {
        expect(err.message).to.contain('Unexpected end of input');
        done();
      });
      ws.on('open', function() {
        ws.send('{');
      });
    });

    it('should remove listener when client disconnected', function(done) {
      var ws = new WebSocket('ws://localhost:' + port);
      ws.on('open', function() {
        expect(server.clientCount()).to.be(1);
        ws.close();
      });
      ws.on('close', function() {
        expect(server.clientCount()).to.be(0);
        done();
      });
    });
  });
});
