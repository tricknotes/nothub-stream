var util = require('util')
  , EventEmitter = require('events').EventEmitter
  , https = require('https')
  , querystring = require('querystring')
  , _ = require('underscore')
  , Stream = require('./stream')
  ;

function Crawler(requestOptions) {
  var self = this
    , stream = new Stream()
    , send = stream.send.bind(stream)
    , errorHandler = this.errorHandler.bind(this)
    , query
    , handleResponse
    ;

  requestOptions = _({
      host: 'api.github.com'
    , path: '/events'
  }).extend(requestOptions);

  if (requestOptions.query) {
    query = querystring.stringify(requestOptions.query);
    _(requestOptions).extend({path: [requestOptions.path, query].join('?')});
    delete requestOptions.query;
  }

  handleResponse = function(res) {
    var data = '';
    res.on('data', function(chunk) {
      data += chunk;
    });
    res.on('end', function() {
      var events = self.parseData(data) || [];
      _(events).each(send);
    });
  };

  this.fetch = function() {
    https.get(requestOptions, handleResponse).on('error', errorHandler);
  };

  stream.on('data-receive', function(error, data) {
    self.emit('receive', error, data);
  });
}

util.inherits(Crawler, EventEmitter);

Crawler.prototype.parseData = function(data) {
  var events;
  try {
    events = JSON.parse(data);
  } catch (error) {
    this.errorHandler(error, data);
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
