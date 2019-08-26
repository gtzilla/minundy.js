
const _ = require("underscore");
const {pipeline,finished,Transform,Readable} = require("stream");


class ObjectToStringer extends Transform {
  constructor(opts={}) {
    opts = opts || {}
    opts.objectMode = false;
    opts.readableObjectMode = true;
    opts.writableObjectMode = false;
    super(opts);
    console.log("ObjectToStringer", opts);
  }
  _transform(chunk, enc, next) {
    console.log("Transformer got", enc);
    next(null, JSON.stringify(chunk));
  }
  _final(next) {
    next(null);
  }
}

module.exports = {
  ObjectToStringer
}

