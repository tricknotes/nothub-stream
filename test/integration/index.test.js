var nock = require('nock')
  , expect = require('chai').expect
  , io = require('socket.io-client')
  , NotHubStream = require('../../')
  , Crawler = NotHubStream.Crawler
  , Service = NotHubStream.Service
  , Sender = NotHubStream.Sender
  ;

describe('NotHub Stream', function() {
  var crawler = null
    , service = null
    , sender = null
    , port = 20000
    ;

  beforeEach(function(done) {
    crawler = new Crawler();
    service = new Service();
    sender = new Sender(++port, { log: false });
    sender.listen(service, done);
    crawler.on('receive', function(error, data) {
      service.send(data);
    });
    nock('https://api.github.com').get('/events').reply(200, [ { type: 'OK' } ]);
  });

  afterEach(function() {
    crawler.removeAllListeners();
    service.removeAllListeners();
    sender.close();
    nock.cleanAll();
  });

  it('should receive all data without query', function(done) {
    var socket = io.connect('http://localhost:' + port);
    socket.on('connect', function() {
      socket.emit('query', {});
      crawler.fetch();
    });
    socket.on('gh_event pushed', function(data) {
      expect(data).to.eql({ type: 'OK' });
      done();
    });
  });

  it('should receive data matched to own query', function(done) {
    var socket = io.connect('http://localhost:' + port);
    socket.on('connect', function() {
      sender.once('query-update', function(error, id, query) {
        expect(query).to.eql({ type: 'NG' });
        process.nextTick(function() {
          crawler.fetch();
        });
        sender.once('query-update', function(error, id, query) {
          expect(query).to.eql({ type: 'OK' });
          crawler.fetch();
        });
        socket.emit('query', { type: 'OK' } );
      });
      socket.emit('query', { type: 'NG' } );
    });
    socket.on('gh_event pushed', function(data) {
      expect(data).to.eql({ type: "OK" });
      done();
    });
  });

  it('should receive data own interested', function(done) {
    var socket1 = io.connect('http://localhost:' + port);
    var sender2 = new Sender(++port, { log: false });
    sender2.listen(service);
    var socket2 = io.connect('http://localhost:' + port);

    socket1.on('gh_event pushed', function() {
      throw new Error('This sender should not be called.');
    });
    socket2.on('gh_event pushed', function() {
      done();
    });

    var connected = (function() {
      var connetedClientCount = 0;

      return function(callback) {
        connetedClientCount += 1;
        if (connetedClientCount == 2) {
          callback();
        }
      };
    })();

    var startAssertion = function() {
      socket1.emit('query', { type: 'NG' });
      socket2.emit('query', { type: 'OK' });
      crawler.fetch();
    };

    socket1.on('connect', function() {
      connected(startAssertion);
    });
    socket2.on('connect', function() {
      connected(startAssertion);
    });
  });
});
