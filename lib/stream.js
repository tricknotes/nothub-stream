const util = require('util');
const EventEmitter = require('events').EventEmitter;

function Stream(max) {
  this.setMaxListeners(0);

  this.max = Number.isInteger(max) ? max : 40;
  this.queue = [];
}

util.inherits(Stream, EventEmitter);

Stream.prototype.send = function(data) {
  const queue = this.queue;
  const max = this.max;
  let contained;

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
