https = require('https')
EventEmitter = require('events').EventEmitter
Stream = require('./stream')

class Crawler extends EventEmitter
  constructor: ->
    super()

    @stream = new Stream()
    @stream.on 'data-receive', (err, data) =>
      @emit('receive', err, data)

  fetch: =>
    https
      .get
        host: 'api.github.com'
        path: '/events'
        @handleResponse
      .on 'error', (e) =>
        @emit('error', e)

  handleResponse: (res) =>
    self = this
    data = ''
    res.on 'data', (chunk) ->
      data += chunk
    res.on 'end', ->
      events = self.parseData(data)
      for event in events
        self.stream.send(event)

  parseData: (data) ->
    try
      events = JSON.parse(data)
    catch e
      @emit('error', e, data)
      return
    unless Array.isArray(events)
      @emit('error', new Error('Expected data format is Array'), data)
      return
    events.reverse()

  crawl: (interval) ->
    setInterval(@fetch, interval)

module.exports = Crawler
