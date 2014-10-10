var co = require('co');
var Duplex = require('readable-stream').PassThrough;
var Promise = require('bluebird');
var duplexer = require('duplexer');

module.exports = generatorStream;
function generatorStream(fun, opts) {
  opts = opts || {};
  var input = new Duplex(opts);
  var output = new Duplex(opts);
  var writeMore = true;
  var error = false;
  function onWrite() {
     if (error) {
      return Promise.reject(error);
    } else if (writeMore === true) {
      return Promise.resolve(true);
    }
    return new Promise(function (fullfill, reject) {
      output.once('drain', function () {
        writeMore = true;
        fullfill();
      })
    });
  }
  function writeToStream(data, encoding) {
    return new Promise(function (fullfill, reject) {
      writeMore = output.write(data, encoding, function (err, resp) {
        if (err) {
          reject(err);
        } else {
          fullfill(resp);
        }
      });
    })
  }

  function write(data, encoding) {
    return onWrite().then(function() {
      return writeToStream(data, encoding);
    });
  }

  var readable = false;
  var done = false;
  function onend() {
    done = true;
    readable = false;
    input.emit('readable');
  }
  input.on('end', onend);
  input.on('close', onend);
  function onerr(e) {
    done = true;
    readable = false;
    error = e;
  }
  input.on('error', onerr);
  output.on('error', onerr);
  function onReadable() {
    if (error) {
      return Promise.reject(error);
    } else if (readable === true) {
      return Promise.resolve(true);
    } else if (done) {
      return Promise.resolve(null);
    }
    return new Promise(function (fullfill, reject) {
      input.once('readable', function () {
        readable = true;
        fullfill();
      })
    });
  }
  function readFromStream(size) {
    if (done) {
      return null;
    }
    var result = input.read(size);
    if (result === null) {
      readable = false;
      return onReadable().then(function () {
        return readFromStream(size);
      });
    }
    return Promise.resolve(result);
  }
  function read(size) {
    return onReadable().then(function () {
      return readFromStream(size);
    });
  }
  co(fun)(read, write, function (err) {
    if (err) {
      output.emit('error', err);
    } else {
      output.end();
    }
  });
  return duplexer(input, output);
}