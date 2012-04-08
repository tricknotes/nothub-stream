(function() {
  var Crawler, EventEmitter, Stream, https,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  https = require('https');

  EventEmitter = require('events').EventEmitter;

  Stream = require('./stream');

  Crawler = (function(_super) {

    __extends(Crawler, _super);

    function Crawler() {
      this.handleResponse = __bind(this.handleResponse, this);
      this.fetch = __bind(this.fetch, this);
      var _this = this;
      Crawler.__super__.constructor.call(this);
      this.stream = new Stream();
      this.stream.on('data-receive', function(err, data) {
        return _this.emit('receive', err, data);
      });
    }

    Crawler.prototype.fetch = function() {
      var _this = this;
      return https.get({
        host: 'api.github.com',
        path: '/events'
      }, this.handleResponse).on('error', function(e) {
        return _this.emit('error', e);
      });
    };

    Crawler.prototype.handleResponse = function(res) {
      var data, self;
      self = this;
      data = '';
      res.on('data', function(chunk) {
        return data += chunk;
      });
      return res.on('end', function() {
        var event, events, _i, _len, _results;
        events = self.parseData(data) || [];
        _results = [];
        for (_i = 0, _len = events.length; _i < _len; _i++) {
          event = events[_i];
          _results.push(self.stream.send(event));
        }
        return _results;
      });
    };

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

    return Crawler;

  })(EventEmitter);

  module.exports = Crawler;

}).call(this);
