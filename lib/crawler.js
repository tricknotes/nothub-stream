var util = require('util')
  , EventEmitter = require('events').EventEmitter
  , https = require('https')
  , Stream = require('./stream')

function Crawler() {
  var self = this
    , stream = new Stream()
    , handleResponse;

  handleResponse = function(res) {
    var data = '';
    res.on('data', function(chunk) {
      return data += chunk;
    });
    return res.on('end', function() {
      var events = self.parseData(data) || []
        , i
        , length
      for (i = 0, length = events.length; i < length; i++) {
        stream.send(events[i]);
      }
    });
  };

  this.fetch = function() {
    https.get({
        host: 'api.github.com'
      , path: '/events'
    }, handleResponse).on('error', function(e) {
      return self.emit('error', e);
    });
  };

  stream.on('data-receive', function(err, data) {
    return self.emit('receive', err, data);
  });
}

util.inherits(Crawler, EventEmitter);

Crawler.prototype.parseData = function(data) {
  var events;
  try {
    events = JSON.parse(data);
  } catch (e) {
    this.emit('error', e, data);
    return;
  }
  if (!Array.isArray(events)) {
    this.emit('error', new Error('Expected data format is Array'), data);
    return;
  }
  return events.reverse();
};

Crawler.prototype.crawl = function(interval) {
  return setInterval(this.fetch, interval);
};

module.exports = Crawler;
