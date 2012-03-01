net = require('net')
http = require('http')
expect = require('expect.js')
nock = require('nock')
io = require('socket.io-client')

Server = require('../../lib/server')
SocketIOListener = require('../../lib/listeners/socketio_listener')

describe 'SocketIOListener', ->
  server = null
  listener = null
  port = 13000

  beforeEach ->
    server = new Server()
    listener = new SocketIOListener ++port, (io) ->
      io.set('log level', 1)

  afterEach ->
    listener.close()

  describe '#listen()', ->
    beforeEach ->
      listener.listen(server)

    it 'should listen port', (done) ->
      net.connect port, ->
        done()

    it 'should accept query', (done) ->
      listener.on 'query-update', (err, id, query) ->
        expect(query).to.eql({type: 'OK'})
        done()
      socket = io.connect('http://localhost:'+port)
      socket.emit('query', {type: 'OK'})

    it 'should emit "pong" when "ping" received', (done) ->
      socket = io.connect('http://localhost:'+port)
      socket.on 'pong', (data) ->
        expect(data).to.be('hi')
        done()
      socket.emit('ping', 'hi')

    it 'should remove listener when client disconnected', (done) ->
      socket = io.connect('http://localhost:'+port)
      socket.on 'connect', ->
        expect(server.clientCount()).to.be(1)
        socket.disconnect()

      listener.on 'disconnect', ->
        expect(server.clientCount()).to.be(0)
        done()
