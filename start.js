var NotHubStream = require('./')
  , Server = NotHubStream.Server
  , SocketIOListener = NotHubStream.Listeners.SocketIOListener
  , Crawler = NotHubStream.Crawler
  , streamConfig = require('./config/stream')
  , sioPort = streamConfig['socket.io'].port
  , server = new Server()
  , ioListener = new SocketIOListener(sioPort)
  , crawler = new Crawler({
    query: process.env['GITHUB_ACCESS_TOKEN']
  })

server.on('error', function(err, detail) {
  console.log('\033[31mServer error\033[39m: ', err);
});

ioListener.listen(server);

crawler.on('receive', function(err, data) {
  if (!err) server.send(data);
});

crawler.on('error', function(err, data) {
  console.log('\033[31mCrawler error\033[39m: ', err, data);
});

crawler.crawl(1000);
