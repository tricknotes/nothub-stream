EventEmitter = require('events').EventEmitter
_ = require('underscore')

class Stream extends EventEmitter
  constructor: (@max) ->
    super()
    @setMaxListeners(0) # allow unlimited listeners

    @max = 40 unless _.isNumber(@max)
    @queue = []

  send: (data) ->
    for i in [0...(@queue.length)] when _.isEqual(@queue[i], data)
      return
    while @queue.length >= @max
      break unless @queue.shift()?
    @queue.push(data) if @max
    @emit('data-receive', null, data)

module.exports = Stream
