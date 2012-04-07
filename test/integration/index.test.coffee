nock = require('nock')
expect = require('expect.js')
WebSocket = require('ws')
{Crawler, Server, Listeners: {WebSocketListener}} = require('../../')

describe 'NotHub Stream', ->
  crawler = null
  server = null
  listener = null
  port = 20000

  beforeEach ->
    crawler = new Crawler()
    server = new Server()
    listener = new WebSocketListener(port: ++port)

    listener.listen(server)
    crawler.on 'receive', (err, data) ->
      server.send(data)

    nock('https://api.github.com')
      .get('/events')
      .reply(200, [{type: 'OK'}])

  afterEach ->
    crawler.removeAllListeners()
    server.removeAllListeners()
    listener.close()

    nock.cleanAll()

  it 'should receive all data without query', (done) ->
    ws = new WebSocket('ws://localhost:'+port)
    ws.on 'open', ->
      ws.send(JSON.stringify({type: 'query'}))
      crawler.fetch()
    ws.on 'message', (data) ->
      expect(data).to.eql('{"type":"OK"}')
      done()

  it 'should receive data matched to own query', (done) ->
    ws = new WebSocket('ws://localhost:'+port)
    ws.on 'open', ->
      listener.once 'query-update', (err, query) ->
        expect(query).to.eql({type: 'NG'})
        crawler.fetch()
        listener.once 'query-update', (err, query) ->
          expect(query).to.eql({type: 'OK'})
          crawler.fetch()
        ws.send(JSON.stringify({type: 'query', query: {type: 'OK'}}))

      ws.send(JSON.stringify({type: 'query', query: {type: 'NG'}}))
    ws.on 'message', (data) ->
      expect(data).to.eql('{"type":"OK"}')
      done()

  it 'should receive data own interested', (done) ->
    ws1 = new WebSocket('ws://localhost:'+port)
    ws1.on 'open', ->
      ws1.send(JSON.stringify({type: 'query', query: {type: 'NG'}}))
      listener.once 'query-update', (err, query) ->
        ws2 = new WebSocket('ws://localhost:'+port)
        ws2.on 'open', ->
          ws2.send(JSON.stringify({type: 'query', query: {type: 'OK'}}))
          listener.once 'query-update', (err, query) ->
            crawler.fetch()
        ws2.on 'message', ->
          done()
    ws1.on 'message', ->
      throw new Error('This listener should not be called.')
