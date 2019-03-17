const net = require('net');
const { expect } = require('chai');
const io = require('socket.io-client');
const Service = require('../lib/service');
const Sender = require('../lib/sender');

describe('Sender', () => {
  let service = null;
  let sender = null;
  let port = 13000;

  beforeEach(() => {
    service = new Service();
    sender = new Sender(++port, {log: false});
  });

  afterEach(() => {
    sender.close();
  });

  describe('#listen()', () => {
    beforeEach(() => {
      sender.listen(service);
    });

    it('should listen port', (done) => {
      net.connect(port, () => {
        done();
      });
    });

    it('should accept query', (done) => {
      const socket = io.connect('http://localhost:' + port);

      sender.on('query-update', (error, id, query) => {
        expect(query).to.eql({type: 'OK'});
        done();
      });
      socket.emit('query', {type: 'OK'});
    });

    it('should emit "pong" when "ping" received', (done) => {
      const socket = io.connect('http://localhost:' + port);

      socket.on('pong', (data) => {
        expect(data).to.eql('hi');
        done();
      });
      socket.emit('ping', 'hi');
    });

    it('should remove sender when client disconnected', (done) => {
      const socket = io.connect('http://localhost:' + port);

      socket.on('connect', () => {
        expect(service.clientCount()).to.eql(1);
        socket.disconnect();
      });
      sender.on('disconnect', () => {
        expect(service.clientCount()).to.eql(0);
        done();
      });
    });
  });

  describe('#listen() with callback', () => {
    it('should run callback when socket listened', (done) => {
      sender.listen(service, done);
    });
  });
});
