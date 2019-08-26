

const {join} = require("path");
const {DirectoryCommander} = require(join(__dirname, "../src/libs/DirectoryCommander.js"));
const {ParseCommander} = require(join(__dirname, "../src/libs/ParseCommander.js"));
const {PluginCommander} = require(join(__dirname, "../src/libs/PluginCommander.js"));
const {finished,pipeline,Transform,Readable} = require("stream");


let pipe_commands = [];
pipe_commands.push(new DirectoryCommander);


test('something needs to be written here', function(done) {
  expect(true).toBe(true);
  done();
});
