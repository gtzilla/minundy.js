
# minimal_.js

minimal underscore.js templates build tool.

Minimal Underscore Template Build System, version 0.0.1

Not a complex, configurable or complete build system for underscore.js

Transforms HTML templates, written for underscore.js template library, into JavaScript functions, compiled with `_.template('str',{variable:'data'})`
and writes to output file`templates.js`

Works with Chrome Extensions limited environment. Originally written to support
JavaScript templating in Chrome Extensions and Browser Extensions

requires: underscore.js, node v10

Much like other configurable build systems, this 
script concatenates files together. To improve speed,
this script keeps an intermediary step folder, processing HTML to JS into a js-dist-separate folder
then watching this intermediary folder for changes, via fs.watch, for combining to templates.js. The base HTML folder is also monitored with fs.watch unless explicitly declared otherwise. See source file for more details.

Works with yarn.

	yarn add https://github.com/gtzilla/minimal_.js

Add shortcut command line methods to package.json -> scripts

	yarn watch --debug




minimal_.js uses an absolute path, based on the location of miminal_.js (fix me). Variations are untested. For example, a `package.json` declaration could look like.

```
  "scripts": {
    "watch": "node node_modules/minimal_.js/src/minimal_.js --watch ../../js-templates/ --distro ../../js-dist/ --distro-separate ../../js-dist-separate/"
  }
```


## Usage, Watch

	node minimal_.js --watch path/html/to/watch  --distro path/dist/folder --distro-separate path/dist/single/file 

## Usage, Build

	node minimal_.js --only-build --w path/html/to/watch  --distro path/dist/folder --distro-separate path/dist/single/file 

## Debug

Add the `--debug` flag to emit logging statments.
