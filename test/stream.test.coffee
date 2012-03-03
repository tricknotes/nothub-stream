expect = require('expect.js')
Stream = require('../lib/stream')

describe 'Stream', ->
  stream = null

  describe '#send()', ->
    beforeEach ->
      stream = new Stream

    it 'should send data to client', (done) ->
      stream.on 'data-receive', (err, data) ->
        expect(data).to.eql({type: 'OK'})
        done()
      stream.send({type: 'OK'})

    it 'should remove duplicated data', (done) ->
      stream.on 'data-receive', done
      for i in [1..2]
        stream.send({type: 'OK'})

  describe 'check duplicated count', ->
    it 'should be default 40', ->
      stream = new Stream
      stream.send({message: 'GOOD'})
      i = 0
      stream.on 'data-receive', ->
        i += 1
      for count in [1...40]
        stream.send({count})
      expect(i).to.be(39)

      stream.send({message: 'GOOD'})
      expect(i).to.be(39)

      stream.send({count: 40})

      stream.send({message: 'GOOD'})
      expect(i).to.be(41)

    it 'should be set when stream initialized', (done) ->
      stream = new Stream(1)
      stream.send({greeting: 'hi'})
      stream.send({greeting: 'Good night'})
      stream.on 'data-receive', done
      stream.send({greeting: 'hi'})

    it 'should be skip deplication check when 0', (done) ->
      stream = new Stream(0)
      stream.send({greeting: 'hi'})
      stream.on 'data-receive', done
      stream.send({greeting: 'hi'})
