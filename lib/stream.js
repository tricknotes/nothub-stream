(function() {
  var EventEmitter, Stream, _,
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  EventEmitter = require('events').EventEmitter;

  _ = require('underscore');

  Stream = (function(_super) {

    __extends(Stream, _super);

    function Stream(max) {
      this.max = max;
      Stream.__super__.constructor.call(this);
      this.setMaxListeners(0);
      if (!_.isNumber(this.max)) this.max = 40;
      this.queue = [];
    }

    Stream.prototype.send = function(data) {
      var i, _ref;
      for (i = 0, _ref = this.queue.length; 0 <= _ref ? i < _ref : i > _ref; 0 <= _ref ? i++ : i--) {
        if (_.isEqual(this.queue[i], data)) return;
      }
      while (this.queue.length >= this.max) {
        if (this.queue.shift() == null) break;
      }
      if (this.max) this.queue.push(data);
      return this.emit('data-receive', null, data);
    };

    return Stream;

  })(EventEmitter);

  module.exports = Stream;

}).call(this);
