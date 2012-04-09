var expect = require('expect.js')
  , Server = require('../lib/server')

describe('Server', function() {
  var server = null;

  beforeEach(function() {
    server = new Server();
  });

  describe('#connect()', function() {
    it('should connect client', function() {
      server.connect('test', null, function() {});
      expect(server.clientCount()).to.be(1);
    });

    it('should update query', function() {
      server.connect('test', { type: 'OK' }, function() {});
      expect(server.clients['test'].query).to.eql({ type: 'OK' });
    });

    it('should not update query when query is empty', function() {
      server.connect('test', null, function() {});
      expect(server.clients['test']).to.be(undefined);
    });
  });

  describe('#disconnect()', function() {
    it('should disconnect client', function() {
      server.connect('test', null, function() {});
      server.disconnect('test');
      expect(server.clientCount()).to.be(0);
    });

    it('should skip with unconnected client', function() {
      server.disconnect('unconnected');
      expect(server.clientCount()).to.be(0);
    });
  });

  describe('#updateSchema()', function() {
    it('should update query', function() {
      server.connect('test', null, function() {});
      server.updateSchema('test', { name: 'TEST' });
      expect(server.clients['test'].query).to.eql({ name: 'TEST' });
    });
  });

  describe('#send()', function() {
    it('should send connected client', function(done) {
      server.connect('test', { name: 'TEST' }, done);
      server.send({ name: 'TEST' });
    });

    it('should skip without query', function(done) {
      server.connect('test', null, done);
      server.send({ type: 'NG' });
      server.updateSchema('test', { type: 'TEST' });
      server.send({ type: 'TEST' });
    });
  });
});
