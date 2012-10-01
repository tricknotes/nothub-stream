var util = require('util')
  , EventEmitter = require('events').EventEmitter
  , https = require('https')
  , Stream = require('./stream')

function Crawler(requestOptions) {
  var self = this
    , stream = new Stream()
    , handleResponse
    , errorHandler;

  requestOptions = requestOptions || {
      host: 'api.github.com'
    , path: '/events'
  };

  handleResponse = function(res) {
    var data = '';
    res.on('data', function(chunk) {
      data += chunk;
    });
    res.on('end', function() {
      var events = self.parseData(data) || []
        , i
        , length
      for (i = 0, length = events.length; i < length; i++) {
        stream.send(events[i]);
      }
    });
  };

  errorHandler = this.errorHandler.bind(this);

  this.fetch = function() {
    https.get(requestOptions, handleResponse).on('error', errorHandler);
  };

  stream.on('data-receive', function(err, data) {
    self.emit('receive', err, data);
  });
}

util.inherits(Crawler, EventEmitter);

Crawler.prototype.parseData = function(data) {
  var events;
  try {
    events = JSON.parse(data);
  } catch (e) {
    this.errorHandler(e, data);
    return;
  }
  if (!Array.isArray(events)) {
    this.errorHandler(new Error('Expected data format is Array'), data);
    return;
  }
  return events.reverse();
};

Crawler.prototype.crawl = function(interval) {
  return setInterval(this.fetch, interval);
};

Crawler.prototype.errorHandler = function(error, data) {
  this.emit('error', error, data);
};

module.exports = Crawler;
