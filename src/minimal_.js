'use strict';
/**
  minimal_.js
  minimal_

  Minimal Underscore Template Build System, version 0.0.1

  Not a complex, configurable or complete build system for underscore.js

  Transforms HTML templates, written for underscore.js template library, into JavaScript methods
  and writes to output file, such as js-dist/templates.js.

  Works with Chrome Extensions limited environment. Originally written to support
  JavaScript templating in Chrome Extensions and Browser Extensions

  requires: underscore.js, node v10

  Much like other configurable build systems, this 
  script concatenates files together. To improve speed,
  this scrpit keeps an intermediary step folder, processing HTML to JS into a js-dist-separate folder
  then watching this intermediary folder for changes, via fs.watch, for combining to templates.js

  ASCI Visualization

  .html --> .js -> |
  .html --> .js -> | (*.js) ---> templates.js
  .html --> .js -> |

  This has a few benefits, some drawbacks. 

  Benefit:
    Faster compile time for templates.js, don't have to recompile all files, just combine
    can link directly to final file during dev. for chrome exts this is helpful bc no server
    can link directly to individual "compiled" files (html->js)


  Drawback:
    Not a "standardize" build system
    Extending requires modifications to original
    documentation is very thin


  Usage, Building: 
      // debug prints values from qlog
      node minimal_.js --debug
      node minimal_.js --watch relative/path/from/this_script/folder
      node minimal_.js --distro relative/path/for/output/templates.js
      node minimal_.js --distro-separate relative/path/single/files

      In prod
      node minimal_.js --only-build

  Using with Yarn, Building:

    yarn run watch
    

  Can mix command line arguments with yarn commands
  
    yarn watch --debug

  Package.json:
    {
      "scripts": {
        "watch":"node scripts/minimal_.js --watch file/path/here --distro output/path/here"
      }
    }

  Usage, Implementation:
    Link to the final, js-dist/templates.js, from HTML template. 

    All files are translated to 
    the appropriately named `templates.method`. For example, the HTML template: `my_first_template.html`
    would be available as templates.my_first_template and used like `templates.my_first_template({...})

    This script setup avoids underscore 'with' template scoping and instead 
    declares {'variable':'data'}
    making all template variables descend from a data [Object Object]


  Other Thoughts:

    Uses some conventions from es2015 and later, such as let, 
    const arrow anonymous function declaration (syntax sugar)

    Skips promises and async/await to avoid 
    needing a build system for the build system. too meta

  Assumed Directory Structure:

    (project root)
    /
    - yarn.lock
    - package.json
    |
    --> /scripts/minimal_.js
    |
    --> /js-templates/*.html    
    |
    --> /js-dist/templates.js
    |
    --> /js-dist-separate/*.js

*/

var program = require('commander');
// PARSE CLI arguments into structure
program
  .version('0.0.5')
  .option('-r, --root [value]', 'Base path, if any, to use for all relative directories')
  .option('-w, --watch [value]', 'Watch this directory for changes to HTML')
  .option('-d, --distro [value]', 'Path to distro folder, templates.js')
  .option('-s, --distro-separate [value]', 'Single JS templates folder')
  .option('--debug', 'Debugging, default is false', 0)
  .option('--silent', 'Quiet output. Forcibly Overrides debug to false.')
  .option('--only-build', 'Do not watch, only build files. Overrides watch flag.')
  .parse(process.argv);



const monitor_path_str = program.watch || "js-templates";
const root_dir = program.root || null;
const separate_compiled_path_str = program.distroSeparate || "js-dist-separate";
const compiled_path_str = program.distro || "js-dist";
let default_underscore_template_config = {variable:'data'};

// external packages
const path = require('path');
const fs = require("fs");
const _ = require("underscore");

// paths on filesystem
// IMPROVE: be smarter, if abs path don't join
// GLOBALS!
const base_path = root_dir ? root_dir : path.join(__dirname, "../");
const monitor_path = _pathis(monitor_path_str, base_path);
const separate_compiled_path = _pathis(separate_compiled_path_str, base_path);
const compiled_path = _pathis(compiled_path_str, base_path);


function _pathis(_str, base_path) {
  return _str.startsWith("/") ? _str : path.join(base_path, _str);
}

// Quick, Sane, Logs
function qlog() {
  if(program.debug) {
    console.log.apply(console, arguments);  
  }
}

function on_file_write(err) {
  if(err) {
    qlog("Error on write", err);
  }
}

function js_file_filter(item) {
  let ext_type = path.extname(item);
  if(ext_type.indexOf("js") < 0) return false;
  return true;  
}

function html_file_filter(item) {
  let ext_type = path.extname(item);
  if(ext_type.indexOf("html") < 0) return false;
  return true;
}

function read_accumulate(_accum, total_cnt, on_complete=null) {
  let counter = total_cnt;
  return (item) => {
    let read_path = path.join(separate_compiled_path, "" + item);
    fs.readFile(read_path, 'utf8', (err, contents) => {
      if(err) { 
        qlog("Error", err); 
        return; 
      } 
      counter -= 1;
      _accum.push(contents);
      if(counter <= 0 && _.isFunction(on_complete)) {
        on_complete(_accum);
      } 
    });     
  }
}

function accumulator_completed(_accumulated) {
  qlog("accumulator_completed!", _accumulated.length);
  let out_str = '/** Auto generated */\n\r;var templates={};\n' + _accumulated.join("\n");
  fs.writeFile(path.join(compiled_path, "./", "templates.js"), out_str, on_file_write);
}

function on_js_directory_read(err, filenames) {
  if(err) return;
  let accumulater = [];
  

  let filtered = _.filter(filenames, js_file_filter);
  _.each(filtered, read_accumulate(accumulater, filtered.length, accumulator_completed));  
}

function monitor_and_compile_combined_js(event_type, filename) {
  return fs.readdir(separate_compiled_path, on_js_directory_read);
}

function convert_html_to_js(infile, outfile, variable_name) {
  return function(err, contents) {
    if(err) {
      qlog("ERROR!", err);
      return;
    }
    // the actual important part. turn HTML into JS
    let blob = _.template(contents, default_underscore_template_config).source;
    fs.writeFile(outfile, 'templates.' + variable_name + "=" + blob, on_file_write);
  }
}

function assemble_filepath(filename) {
  let data = {};
  data.filename = "" +filename;
  data.ext = path.parse(data.filename).ext;
  data.variable = data.filename.replace(data.ext, '');
  data.in = path.join(monitor_path, data.filename);
  data.out = path.join(separate_compiled_path, data.variable + ".js");
  return data;
}

function monitor_files_and_compile(event_type, filename) {
  let info = assemble_filepath(filename);
  if(event_type === 'change') {
    fs.readFile(info.in, 'utf8', convert_html_to_js(info.in, info.out, info.variable));
  }  
}

// MONSTER! gross, tear apart to be smaller.
// remove internal anon funcs
function on_html_directory_read(err, filenames) {
  let filtered = _.filter(filenames, html_file_filter);
  let counter = filtered.length;
  _.each(filtered, function(filename) {
    let info = assemble_filepath(filename);
    fs.readFile(info.in, 'utf8', (err, contents) => {
      // the actual important part. Turn HTML into JS. Compile. Convert. Transform.
      let blob;
      try {
         blob = _.template(contents, default_underscore_template_config).source;
      } catch(e) {
        console.log("ERROR: file", filename, "Message", e, "Filepath info", info);
        throw(e); // HALT! only important part..
      }
      
      fs.writeFile(info.out, 'templates.' + info.variable + "=" + blob, () => {
        counter -= 1;
        if(counter <= 0) {
          // now build the templates.js file, read single js files, accumulate and print
          fs.readdir(separate_compiled_path, (err, filenames) => {
            let filtered = _.filter(filenames, js_file_filter);
            _.each(filtered, read_accumulate([], filtered.length, accumulator_completed)); 
          });
        }
      });
    });     
  });
}

function process_and_build_all() {
  // read all files in monitor path
  return fs.readdir(monitor_path, on_html_directory_read);
}

function guarantee_paths_exist() {
  if (!fs.existsSync(monitor_path)){
    fs.mkdirSync(monitor_path);
  }  
  if (!fs.existsSync(compiled_path)){
    fs.mkdirSync(compiled_path);
  }
  if (!fs.existsSync(separate_compiled_path)){
    fs.mkdirSync(separate_compiled_path);
  }    
}

/**
  1. Watch input files
  2. Watch JS Separate files
*/
function main() {
  if(program.silent) {
    program.debug = false;
  }
  qlog(
    "Paths.",
    "\nMonitor:", monitor_path,
    "\nOutput:", compiled_path,
    "\nRoot path:", root_dir ? root_dir : "Unset",
    "\nSingle JS files:", separate_compiled_path,
    "\n"
  );
  guarantee_paths_exist();
  if(program.onlyBuild) {
    qlog("Will not watch files.");
    process_and_build_all();
  } else {
    fs.watch(monitor_path, { encoding: 'buffer' },  monitor_files_and_compile);
    fs.watch(separate_compiled_path, { encoding: 'buffer' },  monitor_and_compile_combined_js);    
  }
}

main();

