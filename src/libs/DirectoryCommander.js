'use strict';
(async function() {



const _ = require("underscore");
const {join} = require("path");
const {pipeline,Transform,Readable,Duplex} = require("stream");
const {ReadWrap} = require("./ReadWrap")
const fs = require("fs");

if(require.main === module) {
  console.log("Library files not intended to invoked directly");
  process.exit(1);
}


class DirectoryCommander extends Readable {

  readable_generator_from_filepath(filepath) {
    return Readable.from(filelist_generator(filepath));
  }
  async awaitReaddir(dirPath) {
    console.log("filesStreambyFilepath checking directory", dirPath);
    let active = new ReadWrap(dirPath);
    return await active.readdir(dirPath);
  }

  readable_streams_from_filepath(filepath) {
  }
}

module.exports = {DirectoryCommander}


})();
