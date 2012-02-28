EventEmitter = require('events').EventEmitter
WSS = require('ws').Server

class WebSocketListener extends EventEmitter
  constructor: (@config) ->
    super()

  listen: (server) ->
    @wss = new WSS(@config)
    self = this
    @wss.on 'connection', (socket) ->
      sec_key = socket.upgradeReq.headers['sec-websocket-key']

      server.connect sec_key, null, (err, data) ->
        socket.send(JSON.stringify(data))

      socket.on 'message', (data) ->
        try
          {type, query} = JSON.parse(data)
        catch e
          self.emit('error', e, data)
          return

        switch type
          when 'query'
            self.emit('query-update', null, query)
            server.updateSchema(sec_key, query)
          else
            self.emit('error', new Error('Unsupported type: ' + type), data)

      socket.on 'close', ->
        server.disconnect(sec_key)

  close: ->
    @wss.close()

module.exports = WebSocketListener
