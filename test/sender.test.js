const net = require('net');
const expect = require('chai').expect;
const io = require('socket.io-client');
const Service = require('../lib/service');
const Sender = require('../lib/sender');

describe('Sender', function() {
  let service = null;
  let sender = null;
  let port = 13000;

  beforeEach(function() {
    service = new Service();
    sender = new Sender(++port, {log: false});
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
      const socket = io.connect('http://localhost:' + port);

      sender.on('query-update', function(error, id, query) {
        expect(query).to.eql({type: 'OK'});
        done();
      });
      socket.emit('query', {type: 'OK'});
    });

    it('should emit "pong" when "ping" received', function(done) {
      const socket = io.connect('http://localhost:' + port);

      socket.on('pong', function(data) {
        expect(data).to.eql('hi');
        done();
      });
      socket.emit('ping', 'hi');
    });

    it('should remove sender when client disconnected', function(done) {
      const socket = io.connect('http://localhost:' + port);

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
