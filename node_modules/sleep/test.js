/* globals describe, it */
var sleep = require('./');
var assert = require('assert');
var child_process = require('child_process');

function assertApproxEqual(val1, val2) {
  // We require accuracy to the nearest N millisecond.
  // Windows Sleep is not super accurate (depends on scheduling policy) so use a high value.
  var epsilon = 100;
  var diff = val1 - val2;
  if (diff > epsilon) {
    assert.fail('wait was too long: ' + diff + ' > ' + epsilon);
  } else if (diff < -epsilon) {
    assert.fail('wait was too long: ' + diff + ' < ' + -epsilon);
  }
}

describe('sleep', function () {
  it('works for normal input', function () {
    var sleepTime = 1;
    var start = new Date();
    sleep.sleep(sleepTime);
    var end = new Date();
    assertApproxEqual(end - start, sleepTime * 1000);
  });

  it('works for zero', function () {
    var sleepTime = 0;
    var start = new Date();
    sleep.sleep(sleepTime);
    var end = new Date();
    assertApproxEqual(end - start, sleepTime * 1000);
  });

  it('does not allow negative numbers', function () {
    assert.throws(function () {
      sleep.sleep(-1);
    });
  });

  it('works with child_process', function () {
    var sleepTime = 1;
    child_process.exec('echo', function (err, stdout, stderr) { });
    var start = new Date();
    sleep.sleep(sleepTime);
    var end = new Date();
    assertApproxEqual(end - start, sleepTime * 1000);
  });
});

describe('usleep', function () {
  it('works for values smaller than a second', function () {
    var sleepTime = 250;
    var start = new Date();
    sleep.usleep(sleepTime);
    var end = new Date();
    assertApproxEqual(end - start, sleepTime / 1000);
  });

  it('works for values larger than a second', function () {
    this.timeout(4000); // necessary for mocha to not complain
    var sleepTime = 3000000;
    var start = new Date();
    sleep.usleep(sleepTime);
    var end = new Date();
    assertApproxEqual(end - start, sleepTime / 1000);
  });

  it('does not allow negative numbers', function () {
    assert.throws(function () {
      sleep.usleep(-100);
    });
  });
});

describe('msleep', function () {
  it('works for normal input', function() {
    var sleepTime = 1;
    var start = new Date();
    sleep.msleep(sleepTime);
    var end = new Date();
    assertApproxEqual(end - start, sleepTime);
  });

  it('does not allow negative numbers', function () {
    assert.throws(function () {
      sleep.msleep(-100);
    });
  });

  it('does not allow decimal numbers', function () {
    assert.throws(function () {
      sleep.msleep(1.5);
    });
  });
});
