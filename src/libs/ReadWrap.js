'use strict';


const {join} = require("path");
const _ = require("underscore");
const fs = require("fs");
const {Readable,pipeline,finished,Transform} = require("stream");
const util = require("util");
const readdir = util.promisify(fs.readdir);

class ReadWrap extends Readable {
  constructor(basepath, opts={}) {
    super(opts);
    this.queue = [];
    this.basepath = basepath;
  }
  async readdir(dirpath, opts) {
    let local_queue = this.queue;
    let awaited = null;
    try {
      awaited = await readdir(dirpath, opts);
    } catch(e) {
      console.error("ERROR", e);
      throw "UNKNOWN ERROR IN SCAN"
    }
    return awaited;
  }
  _read(byteSize) {
    let candidate = this.queue.unshift();
    if(candidate) this.push(candidate);
    return this;
  }
}

module.exports = {
  ReadWrap
}
