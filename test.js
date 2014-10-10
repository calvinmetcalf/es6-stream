var test = require('tape');
var es6Stream = require('./');
var fs = require('fs');
test('split stream', function (t) {
  var count = 0;
  fs.createReadStream('./text.txt').pipe(es6Stream(function * (read, write) {
    var chunk, i, len;
    while ((chunk = yield read())) {
      chunk = chunk.toString().split(' ');
      i = -1;
      len = chunk.length;
      while (++i < len) {
        yield write(chunk[i]);
      }
    }
  })).on('data', function (d) {
    count++;
  }).on("end", function () {
    t.equals(count, 52, 'called correct number of times');
    t.end();
  }).on('error', function (e) {
    t.ok(false, e.stack);
    t.end();
  });
});