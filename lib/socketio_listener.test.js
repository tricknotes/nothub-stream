var net = require('net')
  , http = require('http')
  , expect = require('chai').expect
  , nock = require('nock')
  , io = require('socket.io-client')
  , Server = require('../../lib/server')
  , SocketIOListener = require('../lib/socketio_listener')

describe('SocketIOListener', function() {
  var server = null
    , listener = null
    , port = 13000

  beforeEach(function() {
    server = new Server();
    listener = new SocketIOListener(++port, { log: false });
  });

  afterEach(function() {
    listener.close();
  });

  describe('#listen()', function() {
    beforeEach(function() {
      listener.listen(server);
    });

    it('should listen port', function(done) {
      net.connect(port, function() {
        done();
      });
    });

    it('should accept query', function(done) {
      var socket = io.connect('http://localhost:' + port);
      listener.on('query-update', function(err, id, query) {
        expect(query).to.eql({ type: 'OK' });
        done();
      });
      socket.emit('query', { type: 'OK' });
    });

    it('should emit "pong" when "ping" received', function(done) {
      var socket = io.connect('http://localhost:' + port);
      socket.on('pong', function(data) {
        expect(data).to.eql('hi');
        done();
      });
      socket.emit('ping', 'hi');
    });

    it('should remove listener when client disconnected', function(done) {
      var socket = io.connect('http://localhost:' + port);
      socket.on('connect', function() {
        expect(server.clientCount()).to.eql(1);
        socket.disconnect();
      });
      listener.on('disconnect', function() {
        expect(server.clientCount()).to.eql(0);
        done();
      });
    });
  });

  describe('#listen() with callback', function() {
    it('should run callback when socket listened', function(done) {
      listener.listen(server, done);
    });
  });
});
