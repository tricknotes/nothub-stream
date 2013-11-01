var util         = require('util'),
    EventEmitter = require('events').EventEmitter,
    _            = require('underscore');

function Stream(max) {
  this.setMaxListeners(0);

  this.max   = _.isNumber(max) ? max : 40;
  this.queue = [];
}

util.inherits(Stream, EventEmitter);

Stream.prototype.send = function(data) {
  var queue = this.queue,
      max   = this.max,
      contained;

  if (max !== 0) {
    contained = _(queue).any(function(containedData) {
      return containedData.id === data.id; // Depend on data format from api.github.com.
    });

    if (contained) {
      return;
    }

    queue.push(data);
    queue.splice(0, queue.length - max);
  }

  this.emit('data-receive', null, data);
};

module.exports = Stream;
