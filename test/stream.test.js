var expect = require('chai').expect
  , Stream = require('../lib/stream')

describe('Stream', function() {
  var stream = null;

  describe('#send()', function() {
    beforeEach(function() {
      stream = new Stream;
    });

    it('should send data to client', function(done) {
      stream.on('data-receive', function(err, data) {
        expect(data).to.eql({ type: 'OK' });
        done();
      });
      stream.send({ type: 'OK' });
    });

    it('should remove duplicated data', function(done) {
      var i;
      stream.on('data-receive', done);
      for (i = 1; i <= 2; i++) {
        stream.send({ type: 'OK' });
      }
    });
  });

  describe('check duplicated count', function() {
    it('should be default 40', function() {
      var count, i;
      stream = new Stream;
      stream.send({ message: 'GOOD' });
      i = 0;
      stream.on('data-receive', function() {
        i += 1;
      });
      for (count = 1; count < 40; count++) {
        stream.send({ count: count });
      }
      expect(i).to.eql(39);
      stream.send({ message: 'GOOD' });
      expect(i).to.eql(39);
      stream.send({ count: 40 });
      stream.send({ message: 'GOOD' });
      expect(i).to.eql(41);
    });

    it('should be set when stream initialized', function(done) {
      stream = new Stream(1);
      stream.send({ greeting: 'hi' });
      stream.send({ greeting: 'Good night' });
      stream.on('data-receive', done);
      stream.send({ greeting: 'hi' });
    });

    it('should be skip deplication check when 0', function(done) {
      stream = new Stream(0);
      stream.send({ greeting: 'hi' });
      stream.on('data-receive', done);
      stream.send({ greeting: 'hi' });
    });
  });
});
