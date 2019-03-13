var util         = require('util'),
    EventEmitter = require('events').EventEmitter;

function Stream(max) {
  this.setMaxListeners(0);

  this.max   = Number.isInteger(max) ? max : 40;
  this.queue = [];
}

util.inherits(Stream, EventEmitter);

Stream.prototype.send = function(data) {
  var queue = this.queue,
      max   = this.max,
      contained;

  if (max !== 0) {
    contained = queue.some((containedData) => containedData.id === data.id); // Depends on data format from api.github.com.

    if (contained) {
      return;
    }

    queue.push(data);
    queue.splice(0, queue.length - max);
  }

  this.emit('data-receive', null, data);
};

module.exports = Stream;
