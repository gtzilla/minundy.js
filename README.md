
# minundy.js

minimal underscore.js templates build tool. Minimal Underscore Template Build System.

Transforms HTML templates, written for underscore.js template library, into JavaScript functions, compiled with `_.template('str',{variable:'data'})`
and writes to a single JavaScript object, output as JSON to file`templates.js`

Works with Chrome Extensions limited environment. Originally written to support
JavaScript templating in Chrome Extensions, Browser Extensions and embedded environments without server side processing.

requires: underscore.js, node v10

### Innerworking Details

Much like other configurable build systems, this 
script concatenates files together. To improve speed,
this script keeps an intermediary step folder, processing HTML to JS into a js-dist-separate folder
then watching this intermediary folder for changes, via fs.watch, for combining to templates.js. The base HTML folder is also monitored with fs.watch unless explicitly declared otherwise. See source file for more details.

Works with yarn, built for yarn.

Also works with npm and probably any other known build system in 2018

	yarn add https://github.com/gtzilla/minundy.js

Add shortcut command line methods to package.json -> scripts

	yarn watch --debug

## Usage, Single, Simple Watch and Build

	node minundy.js --watch path/html/to/watch  --distro path/dist/folder --distro-separate path/dist/single/file 

## Usage, Build Only

	node minundy.js --only-build --w path/html/to/watch  --distro path/dist/folder --distro-separate path/dist/single/file 

## Usage, Multiple Watch

	# combine files from multiple roots into single templates.js
	# WARN: this COULD overwrite files. Unique across folders isn't managed
	
	node minundy.js  --root /User/absolute/path --watch path/files/a --watch path/files/b --watch path/files/c --distro-separate path/single/files/built --distro path/js-distro


#### Debug

Add the `--debug` flag to emit logging statments.



## Distrubtion

This package is not yet listed in NPM / Yarn repository listing services.
