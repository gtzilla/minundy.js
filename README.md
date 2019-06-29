
# minundy.js

minimal underscore.js templates build tool. Minimal Underscore Template Build System.

Transforms HTML templates, written for underscore.js template library, into JavaScript functions, compiled with `_.template('str',{variable:'data'})`
and writes to a single JavaScript object, output as JSON to file`templates.js`

## Dependencies

Minimal dependencies. Primarily, underscore.js, which has the template engine. The second dependency is the Command Line Utility `commanderjs`. 


## Works With

Works with yarn, built for yarn.

Works with The command line. Perfect for static HTML sites, servers without the ability to run nodejs as well as any place implementing underscore templates.

requires: underscore.js, node v10


### Innerworking Details

Much like other configurable build systems, this 
script concatenates files together. To improve speed,
this script keeps an intermediary step folder, processing HTML to JS into a js-dist-separate folder
then watching this intermediary folder for changes, via fs.watch, for combining into templates.js. 



## Yarn

Also works with npm and probably any other known build system in 2018/2019

	yarn add --flat https://github.com/gtzilla/minundy.js

## Usage, Single, Simple Watch and Build

```
	node minundy.js --watch path/html/to/watch  --distro path/dist/folder
```

## Usage, Set intermediary folder location

```
node minundy.js --watch path/html/to/watch  --distro path/dist/folder --distro-separate path/dist/single/file 
```

## Usage, Build Only

	node minundy.js just-build --w path/html/to/watch  --distro path/dist/folder --distro-separate path/dist/single/file 

## Usage, Multiple Watch

	# combine files from multiple roots into single templates.js
	# WARN: this COULD overwrite files. Unique across folders isn't managed
	
	node node_modules/minundy.js/src/minundy.js watch  --root /User/absolute/path --watch path/files/a --watch path/files/b --watch path/files/c --distro-separate path/single/files/built --distro path/js-distro


## Usage, Relative from Current Working Directy (CWD)

```
	node node_modules/minundy.js/src/minundy.js watch --watch path/files/templates_v1 --watch path/files/templates_v2 --watch path/files/templates_v3 --distro some-dist/path/files/templates
```


#### Debug

Add the `--debug` flag to emit logging statments. Set `--debug 5` to 
get all messages, including `console.debug`



## Distrubtion

This package is not yet listed in NPM / Yarn repository listing services.


You can add / install to your project directly through the github repos.

```
yarn add --flat https://github.com/gtzilla/minundy.js

```