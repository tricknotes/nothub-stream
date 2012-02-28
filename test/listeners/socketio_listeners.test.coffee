net = require('net')
http = require('http')
expect = require('expect.js')
nock = require('nock')
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
