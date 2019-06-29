'use strict';
/**
  author: gtzilla
  copyright: gregory tomlinson 2019
  License: MIT
  
  minundy.js
  minundy.js -> min-und-y-> minimal underscore templates compilation package

  # Minimal Underscore Template Build System, minundy

  Not a complex, configurable or complete build system for underscore.js. The minimal.

  Transforms HTML templates, written for underscore.js template library, into JavaScript methods
  and writes to output file, such as js-dist/templates.js.

  turns __NAME__.html into `templates.__NAME__({})`
  
  Uses 'data' internally for templates. Requires: underscore.js, node v10+

  Much like other configurable build systems, this 
  script concatenates files together. To improve speed,
  this scrpit keeps an intermediary step folder, processing HTML to JS into a `js-dist-separate/` 
  folder, which could be a temporary system folder. 
  Then, watching this intermediary folder for changes, via fs.watch, which lets deltas be tracked and updated. 

  On file change and rename, all JS files
  in `--distro-separate` are built and combined into templates.js

  ## ASCI Visualization. Watch folder --> temp folder / distro separate --> single templates.js

  .html --> .js -> |
  .html --> .js -> | (*.js) ---> templates.js
  .html --> .js -> |

  Package.json:
    {
      "scripts": {
        "watch":"node scripts/minundy.js watch --infolder file/path/here --distro output/path/here"
      }
    }

  Usage, Implementation:

  ```
    <script src="js-dist/templates.js"></script>
  ```
*/
const program = require('commander');
const path = require('path');
const os = require("os");
const fs = require("fs");
const _ = require("underscore");
const path_abs_regexp = /^\//;
const console = require("logdebug.js");
const infolder_text = 'Input directory to serve as for changes to HTML. ' 
                        + 'Can accept multiple --infolder. Paths are relative to CWD';
let default_underscore_template_config = {variable:'data'};

function collect_watchable_dirs(filepath, memo) {
  memo.push(filepath);
  return _.flatten(memo);
}

function generate_temp_dir(tmp_prefix='minundy_js-') {
  let temp_dir = fs.mkdtempSync(path.join(os.tmpdir(), tmp_prefix), function(err, folder) {
    if(err) {
      console.error("ERROR with temp directory, while watching", err);
      throw "Failed TEMP DIR";
    }
  });
  return temp_dir; 
}
// always generate a temp dir path
const TEMP_PATH_ABS = generate_temp_dir();

/**
  Enable a command line API.
*/
program
  .version('1.0.1');

program  
  .option('-r, --root <value>', 'Base path, if any, to use for all relative directories', null)
  .option('-f, --infolder <value>', infolder_text, collect_watchable_dirs, [])
  .option('-d, --distro <value>', 'Path to distro folder, templates.js, Relative to CWD', null)
  .option('--debug [opt_value]', 'Debugging, default is false. Full debug = --debug 5', parse_debug_param, 1)
  .option('--silent', 'Quiet output. Forcibly Overrides debug to false.')
  .option('-A, --disallow_prepopulate', 'Disallow the prepopulation step at init.');

program.command("just-build")
        .action(action_just_build);

program.command("watch")
        .option('-s, --distro-separate [value]', 
                  'Single JS templates folder. Relative to CWD. Templates are written here, then combined.', null)
        .action(action_watch_and_compile);

function parse_silent_param(silent_str, default_val) {
  if(silent_str === undefined) {
    return default_val;
  }
  return !!(silent_str);
}

function parse_debug_param(debug_str) {
  return parseInt(debug_str, 10);
}

function on_file_write(err) {
  if(err) {
    console.error("Error on write", err);
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

function write_combined_templates_file(output_path, multi_template_list) {
  console.debug("write_combined_templates_file!", multi_template_list.length, output_path);
  let templates_contents = '/** Auto generated */\n\r;var templates={};\n' + 
                            multi_template_list.join("\n")+ "\n\r";
  fs.writeFile(path.join(output_path, "templates.js"), templates_contents, on_file_write);
}

function camelCase(str) {
  // transform some-value into someValue
  let splits = str.split("-");
  return _.reduce(splits, function(memo, word) {
    return memo + word[0].toUpperCase() + word.slice(1);
  }) || "";
}

// do not include the extension when calling
function js_safe_filename(str) {
  return camelCase(str).replace(/[\.+\(\)\/\*\\]+/, '_');
}

function fs_watch_handler(cmd, file_path, _cwd) {
  return function(event_type, filename) {
    if(event_type !== 'change' && event_type !== 'rename') {
      console.debug("Event not change or rename", event_type);
      return;
    }
    let currfile = path.join(file_path, filename),
        _parsed = path.parse(currfile), 
        abs_path_outdir = null, abs_path_outfile;
    console.debug("fs_watch_handler()\n", currfile, "\nevent\n", event_type+":", filename);
    if(cmd.distroSeparate) {
      abs_path_outdir = build_abs_path(cmd.distroSeparate, cmd, _cwd);
    } else {
      abs_path_outdir = TEMP_PATH_ABS;
    }
    let out_name = js_safe_filename(_parsed.name);
    abs_path_outfile = path.join(abs_path_outdir, out_name + ".js");
    console.debug("Writes output\n", abs_path_outfile);
    return fs.readFile(currfile, 'utf8', function(err, contents) {
      if(err) {
        console.error("ERROR!", err);
        return;
      }        
      // the actual important part. Turn HTML into JS. Compile. Convert. Transform.
      let blob;
      try {
         blob = _.template(contents, default_underscore_template_config).source;
      } catch(e) {
        console.error("ERROR: file", filename, "Message", e, "Filepath info");
        throw(e); // HALT! Pointless to continue.
      } 
      console.debug("Read Path\n", currfile,
                    "\nRead Contents\n", contents, 
                    "\nWrite Path\n", abs_path_outfile, 
                    "\nWrites", blob);
      fs.writeFile(abs_path_outfile, 
                    build_single_template_js_str(_parsed.name, blob),
                    on_file_write);      
    }); 
  }
}

function fs_watch_compiled_separate_handler(cmd, temp_file_path, _cwd) {
  return function(event_type, filename) {
    console.log("fs_watch_compiled_separate_handler", event_type);
    if(event_type !== 'change' && event_type !== 'rename') {
      console.error("Event not change", event_type, temp_file_path);
      return;
    }

    let currfile = path.join(temp_file_path, filename);
    console.debug(filename, 
                  "Changed or renamed. File Path\n", 
                  temp_file_path);
    fs.readdir(temp_file_path, function(err, dir_files) {
      if(err) {
        console.error("Error with temp dir directory read. ", err);
        return;
      }

      console.log("1st 10 directory listing", dir_files.slice(0,10));
      if(!cmd.disallow_prepopulate) {
        let filtered = _.filter(dir_files, js_file_filter);
        populate_converted_html(filtered, cmd, temp_file_path, _cwd);  
      }
    });
  }
}

/**
  Leverage delta only changes for fs.watch events
  build all files
*/
function populate_converted_html(html_files_arr, cmd, file_path, _cwd) {
    let counter = html_files_arr.length;
    let file_contents_arr = [];
    if(!cmd.parent.distro) {
      throw "--distro <folder> required for this step."
    }
    console.log("populate_converted_html()", html_files_arr.length, html_files_arr.slice(0,3));
    return _.chain(html_files_arr).map(function(filename) {
      return path.join(file_path, filename);
    }).map(function(abs_path_html_file) {
      fs.readFile(abs_path_html_file, 'utf8', function(err, contents) {
        counter -= 1;
        if(err) {
          console.error("ERROR: cannot read file", err, abs_path_html_file);
          return;
        }
        file_contents_arr.push(contents);
        if(counter <= 0) {
          let abs_out_path = build_abs_path(cmd.parent.distro, cmd, _cwd);
          guarantee_paths_exist(abs_out_path);
          console.debug("cmd.parent.distro", cmd.parent.distro, abs_out_path);
          write_combined_templates_file(abs_out_path, file_contents_arr);
        }
      });
    }).value();
}

function guarantee_paths_exist(filesystem_path) { 
  if (!fs.existsSync(filesystem_path)){
    fs.mkdirSync(filesystem_path, { recursive: true });
  }
}

/**
  version 1.0.1 
*/
function action_just_build(cmd) {
  console.set_debug(cmd.parent.debug);
  console.set_silent(cmd.parent.silent);
  console.log("action_just_build()", "cmd.parent.debug", cmd.parent.debug);
  if(cmd.parent.silent) {
    console.log("Was silenced!");
  }
  let _cwd = process.cwd(), 
      html_files_contents = [],
      total_count = 0;
  console.debug("Only Build. Will not WATCH.", "CWD directory", _cwd, cmd.parent.infolder||cmd.raw);
  return _.chain(cmd.parent.infolder||cmd.raw).map(function(file_path) {
    return build_abs_path(file_path, cmd, _cwd);
  }).each(function(abs_watch_html_path) {
    fs.readdir(abs_watch_html_path, function(err, dir_files) {
      if(err) {
        return;
      }
      dir_files = _.filter(dir_files, html_file_filter);
      total_count += dir_files.length;
      _.chain(dir_files).map(function(filename) {
        return path.join(abs_watch_html_path, filename);
      }).each(function(abs_file_path) {
        let _parsed = path.parse(abs_file_path);
        fs.readFile(abs_file_path, 'utf8', function(err, contents) {
          total_count -= 1;
          if(err) { console.error("ERROR", err);return; }
          // need this to be transformed into the template file
          let blob;
          try {
             blob = _.template(contents, default_underscore_template_config).source;
          } catch(e) {
            console.error("ERROR: file", filename, "Message", e, "Filepath info");
            throw(e); // HALT! Pointless to continue.
          }
          html_files_contents.push(build_single_template_js_str(_parsed.name, blob));
          if(total_count <= 0) {
            console.debug("html_files_contents.length", html_files_contents.length, html_files_contents);
            let abs_out_path = build_abs_path(cmd.parent.distro, cmd, _cwd);
            guarantee_paths_exist(abs_out_path);
            write_combined_templates_file(abs_out_path, html_files_contents);
          }
        });
      }).value();
    });
  }).value();
}

// version 1
function build_abs_path(file_path, cmd, _cwd) {
  if(path_abs_regexp.test(file_path)) {
    return file_path;
  }
  if(cmd.parent.root) {
    return path.join(cmd.parent.root, file_path);
  } else {
    return path.join(_cwd, file_path);
  }  
}

function action_watch_and_compile(cmd) {
  console.set_debug(cmd.parent.debug);
  console.set_silent(cmd.parent.silent);
  let _cwd = process.cwd();
  let abs_path_dist_sep = null, abs_path_dist = null;
  console.debug("action_watch_and_compile", "unmolested path", cmd.parent.infolder);
  if(cmd.distroSeparate) {
    console.log("using dist sep %s", cmd.distroSeparate)
    abs_path_dist_sep = build_abs_path(cmd.distroSeparate, cmd, _cwd);
    guarantee_paths_exist(abs_path_dist_sep);
  } else {
    console.debug("No --distro-separate. Using temp dir", TEMP_PATH_ABS);
    abs_path_dist_sep = TEMP_PATH_ABS;
  }

  if(cmd.parent.distro) {
    console.log("cmd.parent.distro", cmd.parent.distro);
    abs_path_dist = build_abs_path(cmd.parent.distro, cmd, _cwd);
    guarantee_paths_exist(abs_path_dist);
  }

  let abs_paths = _.chain(cmd.parent.infolder).map(function(file_path) {
    return build_abs_path(file_path, cmd, _cwd);
  }).each(function(file_path) {
    // this is the file path of teh watchable directory
    fs.readdir(file_path, function(err, filenames) {
      let abs_path_outdir = cmd.distroSeparate ? build_abs_path(cmd.distroSeparate, cmd, _cwd) : TEMP_PATH_ABS;
      let abs_html_file_paths = _.chain(filenames).map(function(filename) {
        return path.join(file_path, filename);
      }).each(function(html_file) {
        fs.readFile(html_file, 'utf8', function(err, contents) {
          let blob;
          try {
             blob = _.template(contents, default_underscore_template_config).source;
          } catch(e) {
            console.error("ERROR: file", html_file, "Message", e);
            throw(e); // HALT! Pointless to continue.
          }

          let _parsed = path.parse(html_file);
          let out_name = js_safe_filename(_parsed.name);
          let abs_outfile = path.join(abs_path_outdir, out_name + ".js");
          console.debug("Writing files into", abs_outfile, "raw distro folder", cmd.distroSeparate);
          if(out_name !== _parsed.name) {
            console.warn("ALERT: Different name after sanitizing.\n", out_name, "was", _parsed.name);
          }          
          fs.writeFile(abs_outfile, build_single_template_js_str(_parsed.name,blob), on_file_write);
        });
      }).value()
    });
  }).each(function(file_path) {
    // add the delta listener
    fs.watch(file_path, {
      encoding:'utf8'
    }, fs_watch_handler(cmd, file_path, _cwd));
  }).value();
  console.debug("Absolute paths\n", abs_paths, "\nwatched.", "\nWrite to folder\n", abs_path_dist_sep);
  fs.watch(abs_path_dist_sep, {
    encoding:'utf8'
  }, fs_watch_compiled_separate_handler(cmd, abs_path_dist_sep, _cwd));
}

function build_single_template_js_str(name, contents) {
  let safe_name = js_safe_filename(name);
  return 'templates.' + safe_name + "=" + contents;
}

function init() {
  if(require.main === module) {
    program.parse(process.argv);
  }
}

init();

