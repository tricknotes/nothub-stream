var expect = require('chai').expect
  , nock = require('nock')
  , Crawler = require('../lib/crawler')

describe('Crawler', function() {
  var crawler = null;

  beforeEach(function() {
    crawler = new Crawler();
  });

  afterEach(function() {
    nock.cleanAll();
  });

  describe('#fetch()', function() {
    it('should emit "receive" when crawl succeed', function(done) {
      nock('https://api.github.com')
        .get('/events')
        .reply(200, [{ crawl: 'success' }]);
      crawler.on('receive', function(err, data) {
        expect(data).to.eql({ crawl: 'success' });
        done();
      });
      crawler.fetch();
    });
  });

  describe('#parseData()', function() {
    it('should parse data', function() {
      var data = crawler.parseData('[{"number": 1}, {"number": 2}]');
      expect(data).to.have.length(2);
      expect(data[0]).to.eql({ number: 2 });
      expect(data[1]).to.eql({ number: 1 });
    });

    it('should emit "error" when JSON.parse faild', function(done) {
      crawler.on('error', function(err, data) {
        expect(data).to.eql('{');
        expect(err.message).to.eql('Unexpected end of input');
        done();
      });
      crawler.parseData('{');
    });

    it('should emit "error" when parsed data is not Array', function(done) {
      crawler.on('error', function(err, data) {
        expect(data).to.eql('{}');
        expect(err.message).to.eql('Expected data format is Array');
        done();
      });
      crawler.parseData('{}');
    });
  });
});
