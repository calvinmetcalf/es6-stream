var co = require('co');
var Duplex = require('readable-stream').PassThrough;
var Promise = require('bluebird');
var duplexer = require('duplexer');

module.exports = exports = generatorStream;
exports.write = writeStream;
exports.read = readStream;
function writeStream (stream) {
  var writeMore = true;
  var error = false;
  function onWrite() {
     if (error) {
      return Promise.reject(error);
    } else if (writeMore === true) {
      return Promise.resolve(true);
    }
    return new Promise(function (fullfill, reject) {
      stream.once('drain', function () {
        writeMore = true;
        fullfill();
      })
    });
  }
  function writeToStream(data, encoding) {
    return new Promise(function (fullfill, reject) {
      writeMore = stream.write(data, encoding, function (err, resp) {
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
  return write;
}
function readStream (stream) {
  var readable = false;
  var done = false;
  var error = false;
  function onend() {
    done = true;
    readable = false;
    stream.emit('readable');
  }
  stream.on('end', onend);
  stream.on('close', onend);
  function onerr(e) {
    done = true;
    readable = false;
    error = e;
  }
  stream.on('error', onerr);
  function onReadable() {
    if (error) {
      return Promise.reject(error);
    } else if (readable === true) {
      return Promise.resolve(true);
    } else if (done) {
      return Promise.resolve(null);
    }
    return new Promise(function (fullfill, reject) {
      stream.once('readable', function () {
        readable = true;
        fullfill();
      })
    });
  }
  function readFromStream(size) {
    if (done) {
      return null;
    }
    var result = stream.read(size);
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
  return read;
}
function generatorStream(fun, opts) {
  opts = opts || {};
  var input = new Duplex(opts);
  var output = new Duplex(opts);
  

  
  co(fun)(readStream(input), writeStream(output), function (err) {
    if (err) {
      output.emit('error', err);
    } else {
      output.end();
    }
  });
  return duplexer(input, output);
}