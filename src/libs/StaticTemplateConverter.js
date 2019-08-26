'use strict';

const {finished,pipeline,Transform,Readable} = require("stream");

class StaticTemplateConverter extends Transform {
  constructor(files, curr_file, opts={}) {
    super(opts||{});
    this.accumulate = [];
  }
  _transform(chunk, enc, next) {
    
    this.accumulate.push(chunk);
    next(null, chunk);
  }
  _flush(next) {
    let converted_to_js = _.template(this.accumulate.join("")).source;
    next(converted_to_js);
  }
  _final(next) {
    next(null);
  }
}

