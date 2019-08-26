'use strict';
const {join} = require("path");
const {DirectoryCommander} = require(join(__dirname, "../src/libs/DirectoryCommander.js"));
const fs = require("fs");
const shell = require("shelljs");
const os = require("os");
const _ = require("underscore");
const {pipeline,Transform,Readable,Duplux,Writeable,finished} = require("stream");
const {ObjectToStringer} = require("../src/utils.js");

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

test('DirectoryCommander makes a readable', async function(done) {
  const tmp_prefix =  "DirectoryCommander-test-dir";
  let directoryCommander = new DirectoryCommander;
  let base_path = join(os.tmpdir(), tmp_prefix);
  let created_path = fs.mkdtempSync(base_path);
  console.log("folder is", created_path, "base_path", base_path);
  let tree = [{
    name:"alpha.html",
    contents:'<div>alpha auto-gen html</div>',
    encoding:'utf8'
  },{
    name:"beta.html",
    contents:'<div>beta auto-gen html</div>',
    encoding:'utf8'
  }];

  _.each(tree, function(meta) {
    console.debug("Setup test. Make files to read... name is", meta.name)
    let filePath = join(created_path, meta.name);
    fs.writeFileSync(filePath, meta.contents, {encoding: meta.encoding, flag:'w'});
  });
  // END setup... move this elsewhere once you can share variables.
  let contents = await directoryCommander.awaitReaddir(created_path);
  console.debug("directoryCommander", "contents", contents, created_path);
  expect(contents.length).toBe(tree.length);
  let _first_filename = _.first(contents);
  let _first_tree = _.first(tree);
  expect(_first_filename).toBe(_first_tree.name);

  // pipeline(
  //   directoryCommander.filesStreambyFilepath(created_path),
  //   new ObjectToStringer(),
  //   process.stderr,
  //   (err)=>{
  //     if(err) {
  //       console.error("ouch! error", err);
  //     }
  //     console.log("pipeline all done, read files.")
  //   }
  //   )
  


  delete_files(created_path, _.pluck(tree, 'name'), done);
  expect(directoryCommander).not.toBeNull();
});


