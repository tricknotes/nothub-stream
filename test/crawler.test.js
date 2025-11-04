const { expect } = require('chai');
const nock = require('nock');
const Crawler = require('../lib/crawler');

describe('Crawler', () => {
  let crawler = null;

  beforeEach(() => {
    crawler = new Crawler();
  });

  afterEach(() => {
    nock.cleanAll();
  });

  describe('constructor', () => {
    it('should accept costom host', (done) => {
      nock('https://example.com')
        .get('/events')
        .reply(200, [{}]);
      crawler = new Crawler({host: 'example.com'});
      crawler.on('receive', done);
      crawler.fetch();
    });

    it('should accept costom path', (done) => {
      nock('https://api.github.com')
        .get('/custom')
        .reply(200, [{}]);
      crawler = new Crawler({path: '/custom'});
      crawler.on('receive', done);
      crawler.fetch();
    });

    it('should accept original query', (done) => {
      nock('https://api.github.com')
        .get('/events?greet=hi')
        .reply(200, [{}]);
      crawler = new Crawler({query: {greet: 'hi'}});
      crawler.on('receive', done);
      crawler.fetch();
    });

    it('should accept costom header', (done) => {
      nock('https://api.github.com', {
        reqheaders: {
          'authorization': 'dummy',
          'user-agent': 'NotHub - https://nothub.org',
        }
      }).get('/events')
        .reply(200, [{}]);
      crawler = new Crawler({headers: {'Authorization': 'dummy'}});
      crawler.on('receive', done);
      crawler.fetch();
    });
  });

  describe('#fetch()', () => {
    it('should emit "receive" when crawl succeed', (done) => {
      nock('https://api.github.com')
        .get('/events')
        .reply(200, [{crawl: 'success'}]);
      crawler.on('receive', (error, data) => {
        expect(data).to.eql({crawl: 'success'});
        done();
      });
      crawler.fetch();
    });
  });

  describe('#parseData()', () => {
    it('should parse data', () => {
      const data = crawler.parseData('[{"number": 1}, {"number": 2}]');
      expect(data).to.have.length(2);
      expect(data[0]).to.eql({number: 2});
      expect(data[1]).to.eql({number: 1});
    });

    it('should emit "error" when JSON.parse faild', (done) => {
      crawler.on('error', (error, data) => {
        expect(data).to.eql('{');
        expect(error.message).to.match(/^Unexpected end of|^Expected property name/);
        done();
      });
      crawler.parseData('{');
    });

    it('should emit "error" when parsed data is not Array', (done) => {
      crawler.on('error', (error, data) => {
        expect(data).to.eql('{}');
        expect(error.message).to.eql('Expected data format is Array');
        done();
      });
      crawler.parseData('{}');
    });
  });
});
