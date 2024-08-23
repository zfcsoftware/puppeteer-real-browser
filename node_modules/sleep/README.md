[![Build Status](https://travis-ci.org/erikdubbelboer/node-sleep.png?branch=master)](https://travis-ci.org/erikdubbelboer/node-sleep)
[![Build status](https://ci.appveyor.com/api/projects/status/09kubqqykjaxdrab?svg=true)](https://ci.appveyor.com/project/erikdubbelboer/node-sleep)
[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2Ferikdubbelboer%2Fnode-sleep.svg?type=shield)](https://app.fossa.io/projects/git%2Bgithub.com%2Ferikdubbelboer%2Fnode-sleep?ref=badge_shield)

sleep
=====

Add [`sleep()`][1], `msleep()` and [`usleep()`][2] to Node.js, via a C++ binding.

This is mainly useful for debugging.

Note that because this is a C++ module, it will need to be built on the system you are going to use it on.

These calls will block execution of all JavaScript by halting Node.js' event loop!
==================================================================================

Alternative
-----------

When using nodejs `9.3` or higher it's better to use [Atomics.wait](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Atomics/wait) which doesn't require compiling this C++
module.
The `sleep` and `msleep` functions can be implemented like this:
```js
function msleep(n) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, n);
}
function sleep(n) {
  msleep(n*1000);
}
```
If you require `usleep` this module is still required.

Usage
-----

    var sleep = require('sleep');

* `sleep.sleep(n)`: sleep for `n` seconds
* `sleep.msleep(n)`: sleep for `n` miliseconds
* `sleep.usleep(n)`: sleep for `n` microseconds (1 second is 1000000 microseconds)


[1]: http://linux.die.net/man/3/sleep
[2]: http://linux.die.net/man/3/usleep


## License
[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2Ferikdubbelboer%2Fnode-sleep.svg?type=large)](https://app.fossa.io/projects/git%2Bgithub.com%2Ferikdubbelboer%2Fnode-sleep?ref=badge_large)
