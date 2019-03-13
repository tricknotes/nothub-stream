const expect = require('chai').expect;
const Stream = require('../lib/stream');

describe('Stream', function() {
  let stream = null;

  describe('#send()', function() {
    beforeEach(function() {
      stream = new Stream();
    });

    it('should send data to client', function(done) {
      stream.on('data-receive', function(error, data) {
        expect(data).to.eql({type: 'OK'});
        done();
      });
      stream.send({type: 'OK'});
    });

    it('should remove duplicated data', function(done) {
      stream.on('data-receive', done);
      for (let i = 1; i <= 2; i++) {
        stream.send({type: 'OK'});
      }
    });
  });

  describe('check duplicated count', function() {
    it('should be default 40', function() {
      stream = new Stream();
      stream.send({id: 0, message: 'GOOD'});
      let i = 0;
      stream.on('data-receive', function() {
        i += 1;
      });
      for (let count = 1; count < 40; count++) {
        stream.send({id: count, count: count});
      }
      expect(i).to.eql(39);
      stream.send({id: 0, message: 'GOOD'});
      expect(i).to.eql(39);
      stream.send({id: 41, count: 40});
      stream.send({id: 0, message: 'GOOD'});
      expect(i).to.eql(41);
    });

    it('should be set when stream initialized', function(done) {
      stream = new Stream(1);
      stream.send({id: 1, greeting: 'hi'});
      stream.send({id: 2, greeting: 'Good night'});
      stream.on('data-receive', done);
      stream.send({id: 3, greeting: 'hi'});
    });

    it('should be skip deplication check when 0', function(done) {
      stream = new Stream(0);
      stream.send({greeting: 'hi'});
      stream.on('data-receive', done);
      stream.send({greeting: 'hi'});
    });
  });
});
