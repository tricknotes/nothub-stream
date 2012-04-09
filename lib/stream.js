var util = require('util')
  , EventEmitter = require('events').EventEmitter
  , _ = require('underscore')

function Stream(max) {
  this.max = _.isNumber(max) ? max : 40;
  this.setMaxListeners(0);
  this.queue = [];
}

util.inherits(Stream, EventEmitter);

Stream.prototype.send = function(data) {
  var queue = this.queue
    , max = this.max
    , i
    , length

  if (max !== 0) {
    for (i = 0, length = queue.length; i < length; i++) {
      if (_.isEqual(queue[i], data)) {
        return;
      }
    }
    while (queue.length >= max) {
      if (!queue.shift()) {
        break;
      }
    }
    queue.push(data);
  }
  this.emit('data-receive', null, data);
};

module.exports = Stream;
