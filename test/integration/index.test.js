const nock = require('nock');
const {expect} = require('chai');
const io = require('socket.io-client');
const {Crawler, Service, Sender} = require('../../');

describe('NotHub Stream', () => {
  let crawler = null;
  let service = null;
  let sender = null;
  let port = 20000;

  const fetchAsync = (crawler) => {
    setTimeout(crawler.fetch.bind(crawler), 5); // `setImmediate` is too fast to be expected.
  };

  const stubEventsAPI = () => {
    nock('https://api.github.com')
      .get('/events')
      .reply(200, [{type: 'OK'}]);
  };

  beforeEach((done) => {
    crawler = new Crawler();
    service = new Service();
    sender = new Sender(++port, {log: false});
    sender.listen(service, done);
    crawler.on('receive', (error, data) => {
      service.send(data);
    });
    stubEventsAPI();
  });

  afterEach(() => {
    crawler.removeAllListeners();
    service.removeAllListeners();
    sender.close();
    nock.cleanAll();
  });

  it('should receive all data without query', (done) => {
    const socket = io.connect('http://localhost:' + port);

    socket.on('connect', () => {
      socket.emit('query', {});
      fetchAsync(crawler);
    });
    socket.on('gh_event pushed', (data) => {
      expect(data).to.eql({type: 'OK'});
      done();
    });
  });

  it('should receive data matched to own query', (done) => {
    const socket = io.connect('http://localhost:' + port);

    socket.on('connect', () => {
      sender.once('query-update', (error, id, query) => {
        expect(query).to.eql({type: 'NG'});
        fetchAsync(crawler);

        sender.once('query-update', (error, id, query) => {
          expect(query).to.eql({type: 'OK'});
          stubEventsAPI();
          fetchAsync(crawler);
        });
        socket.emit('query', {type: 'OK'});
      });
      socket.emit('query', {type: 'NG'});
    });
    socket.on('gh_event pushed', (data) => {
      expect(data).to.eql({type: 'OK'});
      done();
    });
  });

  it('should receive data own interested', (done) => {
    const socket1 = io.connect('http://localhost:' + port);
    const sender2 = new Sender(++port, {log: false});

    sender2.listen(service);

    const socket2 = io.connect('http://localhost:' + port);

    socket1.on('gh_event pushed', () => {
      throw new Error('This sender should not be called.');
    });
    socket2.on('gh_event pushed', () => {
      done();
    });

    const connected = (() => {
      let connetedClientCount = 0;

      return (callback) => {
        connetedClientCount += 1;
        if (connetedClientCount == 2) {
          callback();
        }
      };
    })();

    const startAssertion = () => {
      socket1.emit('query', {type: 'NG'});
      socket2.emit('query', {type: 'OK'});

      fetchAsync(crawler);
    };

    socket1.on('connect', () => {
      connected(startAssertion);
    });
    socket2.on('connect', () => {
      connected(startAssertion);
    });
  });
});
