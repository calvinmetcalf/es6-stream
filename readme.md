es6-stream
===

through streams with generators, inspired by [this comment](https://github.com/node-forward/roadmap/issues/1#issuecomment-58576015) by [@Qard](https://github.com/Qard).   Requries harmony flags.

```bash
npm install es6-stream;
```

api

```js

var splitStream = es6Stream(function * (read, write) {
    var chunk, i, len;
    while ((chunk = yield read())) {
      chunk = chunk.toString().split(' ');
      i = -1;
      len = chunk.length;
      while (++i < len) {
        yield write(chunk[i]);
      }
    }\
  })
var upcaseStream = es6Stream(function* (read, write) {
  var bytes = 1024
  var chunk
  while ((chunk = yield read(bytes))) {
    yield write(chunk.toString().toUpperCase())
  }
})
```

or use it for readable and writable streams

```js
co(function *() {
	var read = es6Stream.read(readableStream);
	while ((chunk = yield read())) {
		//do something with chunk;
	}
});

co(function *() {
	var write = es6Stream.write(writableStream);
	var i = -1;
	var len = stuff.length;
	while (++i < len) {
		yield write(stuff[i]);
	}
});
```