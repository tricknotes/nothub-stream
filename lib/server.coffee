EventEmitter = require('events').EventEmitter
JsonMatcher = require('./json_matcher')
Stream = require('./stream')

class Server extends EventEmitter
  constructor: ->
    super()
    @setMaxListeners(0) # allow unlimited listeners

    @stream = new Stream()
    @clients = {}
    @listeners = {}

  connect: (client_id, query, listener) ->
    @updateSchema(client_id, query) if query
    @listeners[client_id] = (err, data) =>
      if err
        @emit('error', err, data)
        return
      if @clients[client_id]?.match(data)
        listener(null, data)
    @stream.on 'data-receive', @listeners[client_id]

  disconnect: (client_id) ->
    delete @clients[client_id]
    if @listeners[client_id]
      @stream.removeListener 'data-receive', @listeners[client_id]
      delete @listeners[client_id]

  updateSchema: (client_id, query) ->
    @clients[client_id] = new JsonMatcher(query)

  clientCount: ->
    @stream.listeners('data-receive').length || 0

  send: (data) ->
    @stream.send(data)

module.exports = Server
