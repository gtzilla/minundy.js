'use strict';
(async function() {



const _ = require("underscore");
const {join} = require("path");
const {pipeline,Transform,Readable,Duplex} = require("stream");
const fs = require("fs");

if(require.main === module) {
  console.log("Library files not intended to invoked directly");
  process.exit(1);
}

async function* filelist_generator(filepath) {
  yield* ['foo', 'bar', 'patty', 'cake']
}



class DirectoryCommander extends Object {


  dirListAsReadable(currentRStream) {
    return function(err, contents) {
      console.log("contents", contents);
      currentRStream.push(...contents);
      currentRStream.push(null);
    }
  }

  readable_generator_from_filepath(filepath) {
    return Readable.from(filelist_generator(filepath));
  }
  readable_filelist_from_filepath(filepath) {
    console.log("same scope", this);
    let active = new Readable;
    active._read = function(byteSize) {
      
    }
    fs.readdir(filepath, (err, contents)=>{
      // this.dirListAsReadable(active);
      active.push(...contents);
      active.push(null);
      active.resume();
    });
    
    return active;
    // return fs.readdir(filepath, this.handle_readdir)
  }
  readable_streams_from_filepath(filepath) {
  }
}

// class DirectoryCommander extends Duplex {
//   // _transform(chunk, enc, next) {
//   //   next(null, chunk);
//   // }

//   // _final(next) {
//   //   next(null);
//   // }
//   // handleResponse(callback) {

//   //   return function(err, files) {
//   //     let _streams = _.chain(files).map(function(file) {
//   //       console.log("file", file);
//   //       return fs.createReadStream(file);
//   //     }).map(function(readStream) {
//   //       // this is the read stream for the file


//   //     }).value();
//   //   }
//   // }
// }
module.exports = {DirectoryCommander}


})();
