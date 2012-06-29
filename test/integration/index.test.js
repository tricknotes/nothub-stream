var nock = require('nock')
  , expect = require('chai').expect
  , WebSocket = require('ws')
  , NotHubStream = require('../../')
  , Crawler = NotHubStream.Crawler
  , Server = NotHubStream.Server
  , WebSocketListener = NotHubStream.Listeners.WebSocketListener

describe('NotHub Stream', function() {
  var crawler = null
    , server = null
    , listener = null
    , port = 20000

  beforeEach(function(done) {
    crawler = new Crawler();
    server = new Server();
    listener = new WebSocketListener({ port: ++port });
    listener.listen(server, done);
    crawler.on('receive', function(err, data) {
      server.send(data);
    });
    nock('https://api.github.com').get('/events').reply(200, [ { type: 'OK' } ]);
  });

  afterEach(function() {
    crawler.removeAllListeners();
    server.removeAllListeners();
    listener.close();
    nock.cleanAll();
  });

  it('should receive all data without query', function(done) {
    var ws = new WebSocket('ws://localhost:' + port);
    ws.on('open', function() {
      ws.send(JSON.stringify({ type: 'query' }));
      process.nextTick(function() {
        crawler.fetch();
      });
    });
    ws.on('message', function(data) {
      expect(data).to.eql('{"type":"OK"}');
      done();
    });
  });

  it('should receive data matched to own query', function(done) {
    var ws = new WebSocket('ws://localhost:' + port);
    ws.on('open', function() {
      listener.once('query-update', function(err, query) {
        expect(query).to.eql({ type: 'NG' });
        process.nextTick(function() {
          crawler.fetch();
        });
        listener.once('query-update', function(err, query) {
          expect(query).to.eql({ type: 'OK' });
          crawler.fetch();
        });
        ws.send(JSON.stringify({ type: 'query', query: { type: 'OK' } }));
      });
      ws.send(JSON.stringify({ type: 'query', query: { type: 'NG' } }));
    });
    ws.on('message', function(data) {
      expect(data).to.eql('{"type":"OK"}');
      done();
    });
  });

  it('should receive data own interested', function(done) {
    var ws1 = new WebSocket('ws://localhost:' + port);
    ws1.on('open', function() {
      ws1.send(JSON.stringify({ type: 'query', query: { type: 'NG' } }));
      listener.once('query-update', function(err, query) {
        var ws2 = new WebSocket('ws://localhost:' + port);
        ws2.on('open', function() {
          ws2.send(JSON.stringify({ type: 'query', query: { type: 'OK' } }));
          listener.once('query-update', function(err, query) {
            crawler.fetch();
          });
        });
        ws2.on('message', function() {
          done();
        });
      });
    });
    ws1.on('message', function() {
      throw new Error('This listener should not be called.');
    });
  });
});
