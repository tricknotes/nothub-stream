const { expect } = require('chai');
const Service = require('../lib/service');

describe('Service', () => {
  const clientId = 'test';
  let service = null;

  beforeEach(() => {
    service = new Service();
  });

  describe('#connect()', () => {
    it('should connect client', () => {
      service.connect(clientId, null, () => {});
      expect(service.clientCount()).to.eql(1);
    });

    it('should update query', () => {
      service.connect(clientId, {type: 'OK'}, () => {});
      expect(service.clients[clientId].query).to.eql({type: 'OK'});
    });

    it('should not update query when query is empty', () => {
      service.connect(clientId, null, () => {});
      expect(service.clients[clientId]).to.eql(undefined);
    });
  });

  describe('#disconnect()', () => {
    it('should disconnect client', () => {
      service.connect(clientId, null, () => {});
      service.disconnect(clientId);
      expect(service.clientCount()).to.eql(0);
    });

    it('should skip with unconnected client', () => {
      service.disconnect('unconnected');
      expect(service.clientCount()).to.eql(0);
    });
  });

  describe('#updateSchema()', () => {
    it('should update query', () => {
      service.connect(clientId, null, () => {});
      service.updateSchema(clientId, {name: 'TEST'});
      expect(service.clients[clientId].query).to.eql({name: 'TEST'});
    });
  });

  describe('#send()', () => {
    it('should send connected client', (done) => {
      service.connect(clientId, {id: 1, name: 'TEST'}, done);
      service.send({id: 1, name: 'TEST'});
    });

    it('should skip without query', (done) => {
      service.connect(clientId, null, done);
      service.send({id: 1, type: 'NG'});
      service.updateSchema(clientId, {type: 'TEST'});
      service.send({id: 2, type: 'TEST'});
    });
  });
});
