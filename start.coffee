NotHubStream = require('./')

server = new NotHubStream.Server()
server.on 'error', (err, detail) ->
  console.log('Server caught error: ', err)

stream_config = require('./config/stream')

io_listener = new NotHubStream.Listeners.SocketIOListener stream_config['socket.io'].port
io_listener.listen(server)

ws_listener = new NotHubStream.Listeners.WebSocketListener(stream_config.websocket)
ws_listener.on 'error', (err, data) ->
  console.log(['Unexpected request: ', err, data])
ws_listener.listen(server)

crawler = new NotHubStream.Crawler()
crawler.on 'receive', (err, data) ->
  server.send(data)
crawler.on 'error', (err, data) ->
  console.log('Unexpected error caught: ', e, data)
crawler.crawl(1000)
