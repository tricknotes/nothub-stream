expect = require('expect.js')
Server = require('../lib/server')

describe 'Server', ->
  server = null
  beforeEach ->
    server = new Server()

  describe '#connect()', ->
    it 'should connect client', ->
      server.connect 'test', null, ->
      expect(server.clientCount()).to.be(1)

    it 'should update query', ->
      server.connect 'test', {type: 'OK'}, ->
      expect(server.clients['test'].query).to.eql({type: 'OK'})

    it 'should not update query when query is empty', ->
      server.connect 'test', null, ->
      expect(server.clients['test']).to.be(undefined)

  describe '#disconnect()', ->
    it 'should disconnect client', ->
      server.connect 'test', null, ->
      server.disconnect 'test'
      expect(server.clientCount()).to.be(0)

    it 'should skip with unconnected client', ->
      server.disconnect 'unconnected'
      expect(server.clientCount()).to.be(0)

  describe '#updateSchema()', ->
    it 'should update query', ->
      server.connect 'test', null, ->
      server.updateSchema('test', {name: 'TEST'})
      expect(server.clients['test'].query).to.eql({name: 'TEST'})

  describe '#send()', ->
    it 'should send connected client', (done) ->
      server.connect 'test', {name: 'TEST'}, done
      server.send({name: 'TEST'})

    it 'should skip without query', (done) ->
      server.connect 'test', null, done
      server.send({type: 'NG'}) # skip
      server.updateSchema('test', {type: 'TEST'})
      server.send({type: 'TEST'}) # call listener
