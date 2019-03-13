const { expect } = require('chai');
const Stream = require('../lib/stream');

describe('Stream', () => {
  let stream = null;

  describe('#send()', () => {
    beforeEach(() => {
      stream = new Stream();
    });

    it('should send data to client', (done) => {
      stream.on('data-receive', (error, data) => {
        expect(data).to.eql({type: 'OK'});
        done();
      });
      stream.send({type: 'OK'});
    });

    it('should remove duplicated data', (done) => {
      stream.on('data-receive', done);
      for (let i = 1; i <= 2; i++) {
        stream.send({type: 'OK'});
      }
    });
  });

  describe('check duplicated count', () => {
    it('should be default 40', () => {
      stream = new Stream();
      stream.send({id: 0, message: 'GOOD'});
      let i = 0;
      stream.on('data-receive', () => {
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

    it('should be set when stream initialized', (done) => {
      stream = new Stream(1);
      stream.send({id: 1, greeting: 'hi'});
      stream.send({id: 2, greeting: 'Good night'});
      stream.on('data-receive', done);
      stream.send({id: 3, greeting: 'hi'});
    });

    it('should be skip deplication check when 0', (done) => {
      stream = new Stream(0);
      stream.send({greeting: 'hi'});
      stream.on('data-receive', done);
      stream.send({greeting: 'hi'});
    });
  });
});
