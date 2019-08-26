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
    let results;
    let awaited = null;
    let err = null;
    try {
      // {err, awaited} = await readdir(dirpath);
      results = await readdir(dirpath, opts);
      if(err) {
        console.error("ERROR", err);
        throw "Scan Directory ERROR";
      } 
    } catch(e) {
      console.error("ERROR", e);
      throw "UNKNOWN ERROR IN SCAN"
    }
    
    return results;

  }


  _read(byteSize) {
    console.log("this.queue", this.queue.length, this.queue);
    let candidate = this.queue.unshift();
    console.log("candidate",candidate)
    if(candidate) this.push(candidate);
    // return this.push(candidate || null)
    return this;
  }
}


module.exports = {
  ReadWrap
}
