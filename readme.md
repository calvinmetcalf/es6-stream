es6-stream
===

through streams with generators, inspired by [this comment](https://github.com/node-forward/roadmap/issues/1#issuecomment-58576015) by [@Qard](https://github.com/Qard).   Requries harmony flags.

api

```js

var splitStream = es6Stream(function * (read, write) {
    var chunk, i, len;
    while ((chunk = yield read())) {
      chunk = chunk.toString().split(' ');
      chunk = ;
      i = -1;
      len = chunk.length;
      while (++i < len) {
        yield write(chunk[i]);
      }
    }
  })
var upcaseStream = es6Stream(function* (read, write) {
  var bytes = 1024
  var chunk
  while ((chunk = yield read(bytes))) {
    yield write(chunk.toString().toUpperCase())
  }
})
```