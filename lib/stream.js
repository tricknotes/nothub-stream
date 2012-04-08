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
  var i, length;
  if (this.max !== 0) {
    for (i = 0, length = this.queue.length; i < length; i++) {
      if (_.isEqual(this.queue[i], data)) {
        return;
      }
    }
    while (this.queue.length >= this.max) {
      if (!this.queue.shift()) {
        break;
      }
    }
    this.queue.push(data);
  }
  this.emit('data-receive', null, data);
};

module.exports = Stream;
