NotHubStream = require('./')
{Crawler} = require('github-events-crawler')

server = new NotHubStream.Server()
server.on 'error', (err, detail) ->
  console.log('Server caught error: ', err)

stream_config = require('./config/stream')

io_listener = new NotHubStream.Listeners.SocketIOListener(stream_config['socket.io'].port)
io_listener.listen(server)

ws_listener = new NotHubStream.Listeners.WebSocketListener(stream_config.websocket)
ws_listener.on 'error', (err, data) ->
  console.log(['Unexpected request: ', err, data])
ws_listener.listen(server)

crawler = new Crawler()
crawler.on 'event', (data) ->
  server.send(data)
crawler.start()
