const util = require('util');
const EventEmitter = require('events');
const https = require('https');
const querystring = require('querystring');
const Stream = require('./stream');

function Crawler(requestOptions = {}) {
  const self = this;
  const stream = new Stream(60);
  const send = stream.send.bind(stream);
  const errorHandler = this.errorHandler.bind(this);
  const headers = requestOptions.headers;
  delete requestOptions.headers;
  let query;

  requestOptions = {
    host: 'api.github.com',
    path: '/events',
    headers: {
      'User-Agent': 'NotHub - http://nothub.org',
      ...headers,
    },
    ...requestOptions,
  };

  if (requestOptions.query) {
    query = querystring.stringify(requestOptions.query);
    requestOptions.path = [requestOptions.path, query].join('?');
    delete requestOptions.query;
  }

  const handleResponse = function (res) {
    let data = '';

    res.on('data', function (chunk) {
      data += chunk;
    });

    res.on('end', function () {
      const events = self.parseData(data) || [];
      events.forEach(send);
    });
  };

  this.fetch = function () {
    https.get(requestOptions, handleResponse).on('error', errorHandler);
  };

  stream.on('data-receive', function (error, data) {
    self.emit('receive', error, data);
  });
}

util.inherits(Crawler, EventEmitter);

Crawler.prototype.parseData = function (data) {
  let events;

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

Crawler.prototype.crawl = function (interval) {
  return setInterval(this.fetch, interval);
};

Crawler.prototype.errorHandler = function (error, data) {
  this.emit('error', error, data);
};

module.exports = Crawler;
