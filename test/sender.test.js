var net = require('net')
  , http = require('http')
  , expect = require('chai').expect
  , nock = require('nock')
  , io = require('socket.io-client')
  , Service = require('../lib/service')
  , Sender = require('../lib/sender')
  ;

describe('Sender', function() {
  var service = null
    , sender = null
    , port = 13000
    ;

  beforeEach(function() {
    service = new Service();
    sender = new Sender(++port, { log: false });
  });

  afterEach(function() {
    sender.close();
  });

  describe('#listen()', function() {
    beforeEach(function() {
      sender.listen(service);
    });

    it('should listen port', function(done) {
      net.connect(port, function() {
        done();
      });
    });

    it('should accept query', function(done) {
      var socket = io.connect('http://localhost:' + port);
      sender.on('query-update', function(error, id, query) {
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

    it('should remove sender when client disconnected', function(done) {
      var socket = io.connect('http://localhost:' + port);
      socket.on('connect', function() {
        expect(service.clientCount()).to.eql(1);
        socket.disconnect();
      });
      sender.on('disconnect', function() {
        expect(service.clientCount()).to.eql(0);
        done();
      });
    });
  });

  describe('#listen() with callback', function() {
    it('should run callback when socket listened', function(done) {
      sender.listen(service, done);
    });
  });
});
