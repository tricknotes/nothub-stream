expect = require('expect.js')
nock = require('nock')
Crawler = require('../lib/crawler')

describe 'Crawler', ->
  crawler = null
  beforeEach ->
    crawler = new Crawler()
  afterEach ->
    nock.cleanAll()

  describe '#fetch()', ->
    it 'should emit "receive" when crawl succeed', (done) ->
      nock('https://api.github.com')
        .get('/events')
        .reply(200, [{crawl: 'success'}])
      crawler.on 'receive', (err, data) ->
        expect(data).to.eql({crawl: 'success'})
        done()
      crawler.fetch()

  describe '#parseData()', ->
    it 'should parse data', ->
      data = crawler.parseData('[{"number": 1}, {"number": 2}]')
      expect(data).to.have.length(2)
      expect(data[0]).to.eql({number: 2})
      expect(data[1]).to.eql({number: 1})

    it 'should emit "error" when JSON.parse faild', (done) ->
      crawler.on 'error', (err, data) ->
        expect(data).to.be('{')
        expect(err.message).to.be('Unexpected end of input')
        done()
      crawler.parseData('{')

    it 'should emit "error" when parsed data is not Array', (done) ->
      crawler.on 'error', (err, data) ->
        expect(data).to.be('{}')
        expect(err.message).to.be('Expected data format is Array')
        done()
      crawler.parseData('{}')
