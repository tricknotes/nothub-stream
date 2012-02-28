net = require('net')
expect = require('expect.js')
WebSocket = require('ws')

Server = require('../../lib/server')
WebSocketListener = require('../../lib/listeners/websocket_listener')

describe 'WebSocketListener', ->
  server = null
  listener = null
  port = 15000

  beforeEach ->
    server = new Server()
    listener = new WebSocketListener(port: ++port)

  afterEach ->
    listener.close()

  describe '#listen()', ->
    beforeEach ->
      listener.listen(server)

    it 'should listen port', (done) ->
      net.connect port, 'localhost', ->
        done()

    it 'should accept query', (done) ->
      listener.on 'query-update', (err, query) ->
        expect(query).to.eql({type: 'OK'})
        done()
      ws = new WebSocket('ws://localhost:'+port)
      ws.on 'open', ->
        ws.send(JSON.stringify({type: 'query', query: {type: 'OK'}}))

    it 'should emit "error" when unexpected type received', (done) ->
      listener.on 'error', (err, data) ->
        expect(err.message).to.contain('UNKNOWN')
        done()
      ws = new WebSocket('ws://localhost:'+port)
      ws.on 'open', ->
        ws.send(JSON.stringify({type: 'UNKNOWN'}))

    it 'should emit "error" when request parse failed', (done) ->
      listener.on 'error', (err, data) ->
        expect(err.message).to.contain('Unexpected end of input')
        done()
      ws = new WebSocket('ws://localhost:'+port)
      ws.on 'open', ->
        ws.send('{')

    it 'should remove listener when client disconnected', (done) ->
      ws = new WebSocket('ws://localhost:'+port)
      ws.on 'open', ->
        expect(server.clientCount()).to.be(1)
        ws.close()
      ws.on 'close', ->
        expect(server.clientCount()).to.be(0)
        done()
