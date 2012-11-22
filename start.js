var NotHubStream = require('./')
  , Service = NotHubStream.Service
  , Sender = NotHubStream.Sender
  , Crawler = NotHubStream.Crawler
  , config = require('./config/stream')
  , service = new Service()
  , sender = new Sender(config.port)
  , crawler = new Crawler({
    query: {
      access_token: process.env['GITHUB_ACCESS_TOKEN']
    }
  })

service.on('error', function(error, detail) {
  console.log('\033[31mService error\033[39m: ', error);
});

sender.listen(service);

crawler.on('receive', function(error, data) {
  if (!error) service.send(data);
});

crawler.on('error', function(error, data) {
  console.log('\033[31mCrawler error\033[39m: ', error, data);
});

crawler.crawl(1000);
