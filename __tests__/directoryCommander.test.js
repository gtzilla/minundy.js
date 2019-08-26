'use strict';
const {join} = require("path");
const {DirectoryCommander} = require(join(__dirname, "../src/libs/DirectoryCommander.js"));
const fs = require("fs");
const shell = require("shelljs");
const os = require("os");
const _ = require("underscore");
const {pipeline,Transform,Readable,Duplux,Writeable,finished} = require("stream");

function initializeTmpFolderWithFiles(tmp_prefix=null) {

}

function delete_files(folder, names, done) {
    let total = names.length;
    _.each(names, function(name) {
      let deletable_path = join(folder,name);
      if(fs.existsSync(deletable_path)) {
        fs.unlink(join(folder,name), (err)=>{
          if(err) {
            console.error("ERROR on unlink", err);
            return;
          }
          total -= 1;
          if(total <= 0) {
            fs.rmdir(folder, done);
          }
        });
      }
      
    });
}


test('DirectoryCommander makes a readable', function(done) {
  const tmp_prefix =  "DirectoryCommander-test-dir";
  let directoryCommander = new DirectoryCommander;

  let base_path = join(os.tmpdir(), tmp_prefix)
  console.log("base_path", base_path)
  let finalized_path;
  let created_path = fs.mkdtempSync(base_path);
  console.log("folder is", created_path);
  let tree = [{
    name:"alpha.html",
    contents:'<div>alpha auto-gen html</div>',
    encoding:'utf8'
  },{
    name:"beta.html",
    contents:'<div>beta auto-gen html</div>',
    encoding:'utf8'
  }];

  pipeline(
    directoryCommander.readable_filelist_from_filepath(created_path),
    process.stdout,
    (err)=>{
      if(err) {
        console.error("ouch! error", err);
      }
      console.log("pipeline all done, read files.")
    }
    )
  

  _.each(tree, function(meta) {
    fs.writeFileSync(join(created_path, meta.name), meta.contents, meta.encoding);
  });

  delete_files(created_path, _.pluck(tree, 'name'), done);
  expect(directoryCommander).not.toBeNull();
});


