'use strict';

const colorlogjs = require("colorlogjs");
const console = colorlogjs.start(__filename, {
  log_level:1,
  is_silent:false,
});
const {join} = require("path");
const {DirectoryCommander} = require(join(__dirname, "../src/libs/DirectoryCommander.js"));
const program = require("commander");
if(require.main !== module) {
  console.log("must call via CLI")
  process.exit(1);
}

function default_action(opts) {
  console.log("thin build", opts);
  let inst = new DirectoryCommander();
  console.log("handling the directory", _.isFunction(DirectoryCommander.prototype.handleResponse));  
  fs.readdir('.', DirectoryCommander.prototype.handleResponse);
}

program.version('1.5.1')
        .command("build")
        .action(default_action)



if(process.argv.length < 3) {
  program.help();
  process.exit()
}

program.parse(process.argv);
