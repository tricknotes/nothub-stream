var NotHubStream = require('./')
  , Server = NotHubStream.Server
  , SocketIOListener = NotHubStream.Listeners.SocketIOListener
  , WebSocketListener = NotHubStream.Listeners.WebSocketListener
  , Crawler = NotHubStream.Crawler
  , streamConfig = require('./config/stream')
  , sioPort = streamConfig['socket.io'].port
  , wsConfig = streamConfig['websocket']
  , server = new Server()
  , ioListener = new SocketIOListener(sioPort)
  , wsListener = new WebSocketListener(wsConfig)
  , crawler = new Crawler()

server.on('error', function(err, detail) {
  console.log('Server error: ', err);
});

ioListener.listen(server);

wsListener.on('error', function(err, data) {
  console.log(['Listener error: ', err, data]);
});

wsListener.listen(server);

crawler.on('receive', function(err, data) {
  if (!err) server.send(data);
});

crawler.on('error', function(err, data) {
  console.log('Crawler error: ', err, data);
});

crawler.crawl(1000);
