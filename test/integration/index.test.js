const nock = require('nock');
const expect = require('chai').expect;
const io = require('socket.io-client');
const NotHubStream = require('../../');
const Crawler = NotHubStream.Crawler;
const Service = NotHubStream.Service;
const Sender = NotHubStream.Sender;

describe('NotHub Stream', function() {
  let crawler = null;
  let service = null;
  let sender = null;
  let port = 20000;

  function fetchAsync(crawler) {
    setTimeout(crawler.fetch.bind(crawler), 5); // `setImmediate` is too fast to be expected.
  }

  function stubEventsAPI() {
    nock('https://api.github.com')
      .get('/events')
      .reply(200, [{type: 'OK'}]);
  }

  beforeEach(function(done) {
    crawler = new Crawler();
    service = new Service();
    sender = new Sender(++port, {log: false});
    sender.listen(service, done);
    crawler.on('receive', function(error, data) {
      service.send(data);
    });
    stubEventsAPI();
  });

  afterEach(function() {
    crawler.removeAllListeners();
    service.removeAllListeners();
    sender.close();
    nock.cleanAll();
  });

  it('should receive all data without query', function(done) {
    const socket = io.connect('http://localhost:' + port);

    socket.on('connect', function() {
      socket.emit('query', {});
      fetchAsync(crawler);
    });
    socket.on('gh_event pushed', function(data) {
      expect(data).to.eql({type: 'OK'});
      done();
    });
  });

  it('should receive data matched to own query', function(done) {
    const socket = io.connect('http://localhost:' + port);

    socket.on('connect', function() {
      sender.once('query-update', function(error, id, query) {
        expect(query).to.eql({type: 'NG'});
        fetchAsync(crawler);

        sender.once('query-update', function(error, id, query) {
          expect(query).to.eql({type: 'OK'});
          stubEventsAPI();
          fetchAsync(crawler);
        });
        socket.emit('query', {type: 'OK'});
      });
      socket.emit('query', {type: 'NG'});
    });
    socket.on('gh_event pushed', function(data) {
      expect(data).to.eql({type: 'OK'});
      done();
    });
  });

  it('should receive data own interested', function(done) {
    const socket1 = io.connect('http://localhost:' + port);
    const sender2 = new Sender(++port, {log: false});

    sender2.listen(service);

    const socket2 = io.connect('http://localhost:' + port);

    socket1.on('gh_event pushed', function() {
      throw new Error('This sender should not be called.');
    });
    socket2.on('gh_event pushed', function() {
      done();
    });

    const connected = (function() {
      let connetedClientCount = 0;

      return function(callback) {
        connetedClientCount += 1;
        if (connetedClientCount == 2) {
          callback();
        }
      };
    })();

    const startAssertion = function() {
      socket1.emit('query', {type: 'NG'});
      socket2.emit('query', {type: 'OK'});

      fetchAsync(crawler);
    };

    socket1.on('connect', function() {
      connected(startAssertion);
    });
    socket2.on('connect', function() {
      connected(startAssertion);
    });
  });
});
