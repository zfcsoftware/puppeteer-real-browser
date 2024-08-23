var sleep = require('./build/Release/node_sleep.node');

sleep.sleep = function(seconds) {
  if (seconds < 0 || seconds % 1 != 0) {
    throw new Exception('Expected number of seconds');
  }
  sleep.usleep(seconds * 1000000);
}


sleep.msleep = function(miliseconds) {
  if (miliseconds < 1 || miliseconds % 1 != 0) {
    throw new Exception('Expected number of miliseconds');
  }
  sleep.usleep(miliseconds * 1000);
}

module.exports = sleep;

