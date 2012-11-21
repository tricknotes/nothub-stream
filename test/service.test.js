var expect = require('chai').expect
  , Service = require('../lib/service')

describe('Service', function() {
  var service = null;

  beforeEach(function() {
    service = new Service();
  });

  describe('#connect()', function() {
    it('should connect client', function() {
      service.connect('test', null, function() {});
      expect(service.clientCount()).to.eql(1);
    });

    it('should update query', function() {
      service.connect('test', { type: 'OK' }, function() {});
      expect(service.clients['test'].query).to.eql({ type: 'OK' });
    });

    it('should not update query when query is empty', function() {
      service.connect('test', null, function() {});
      expect(service.clients['test']).to.eql(undefined);
    });
  });

  describe('#disconnect()', function() {
    it('should disconnect client', function() {
      service.connect('test', null, function() {});
      service.disconnect('test');
      expect(service.clientCount()).to.eql(0);
    });

    it('should skip with unconnected client', function() {
      service.disconnect('unconnected');
      expect(service.clientCount()).to.eql(0);
    });
  });

  describe('#updateSchema()', function() {
    it('should update query', function() {
      service.connect('test', null, function() {});
      service.updateSchema('test', { name: 'TEST' });
      expect(service.clients['test'].query).to.eql({ name: 'TEST' });
    });
  });

  describe('#send()', function() {
    it('should send connected client', function(done) {
      service.connect('test', { name: 'TEST' }, done);
      service.send({ name: 'TEST' });
    });

    it('should skip without query', function(done) {
      service.connect('test', null, done);
      service.send({ type: 'NG' });
      service.updateSchema('test', { type: 'TEST' });
      service.send({ type: 'TEST' });
    });
  });
});
