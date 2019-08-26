'use strict';


const {join} = require("path");
const {DirectoryCommander} = require(join(__dirname, "../src/libs/DirectoryCommander.js"));
const {ParseCommander} = require(join(__dirname, "../src/libs/ParseCommander.js"));
const {PluginCommander} = require(join(__dirname, "../src/libs/PluginCommander.js"));
const {finished,pipeline,Transform,Readable} = require("stream");


test('something needs to be written here', function(done) {
  expect(true).toBe(true);
  done();
});