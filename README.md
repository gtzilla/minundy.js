

## Install with Yarn

Works with yarn, npm and probably* any other known build system in 2018/2019

	yarn add --flat minundy.js

\* Unknown and unlisted build systems are Untested

# minundy.js

The current version is 1.0.2

minimal underscore.js templates build tool. Minimal Underscore Template Build System.

Transforms HTML templates, written for underscore.js template library, into JavaScript functions, compiled with `_.template('str',{variable:'data'})`
and writes to a single JavaScript object, output as JSON to file`templates.js`

## Dependencies

Minimal dependencies. Primarily, underscore.js, which has the template engine. The second dependency is the Command Line Utility `commanderjs`. logdebug.js, which powers logging has been split out
away from this project. This may change.


## Works With

Works with yarn, built for yarn.

Works with The command line. Perfect for static HTML sites, servers without the ability to run nodejs as well as any place implementing underscore templates.

requires: underscore.js, node v10


### Innerworking Details

Much like other configurable build systems, this 
script concatenates files together. To improve speed,
this script keeps an intermediary step folder, processing HTML to JS into a `js-dist-separate` folder
then watching this intermediary folder for changes, via fs.watch, for combining into templates.js. As of version 1.0.1 minundy.js uses a temporary system folder for this step unless explicitly specified, such as `--distro-separate <location/path/here>`  


## Usage, Single, Simple Watch and Build

```
	node node_modules/minundy.js/src/minundy.js watch --infolder path/html/to/watch  --distro path/dist/folder
```

## Usage, Set intermediary folder location

If you experience an error regarding distro-separate (or just have a preference), you can use a known path by supplying `--distro-separate <location>` on the command line. 

```
node node_modules/minundy.js/src/minundy.js watch --infolder path/html/to/watch  --distro path/dist/folder --distro-separate path/dist/single/file 
```

## Usage, Build Only

	node minundy.js just-build --w path/html/to/watch  --distro path/dist/folder --distro-separate path/dist/single/file 

## Usage, Multiple Watch

	# combine files from multiple roots into single templates.js
	# WARN: this COULD overwrite files. Unique across folders isn't managed
	
	node node_modules/minundy.js/src/minundy.js watch  --root /User/absolute/path --infolder path/files/a --infolder path/files/b --infolder path/files/c --distro-separate path/single/files/built --distro path/js-distro


## Usage, Relative from Current Working Directy (CWD)

```
	node node_modules/minundy.js/src/minundy.js watch --infolder path/files/templates_v1 --infolder path/files/templates_v2 --infolder path/files/templates_v3 --distro some-dist/path/files/templates
```


#### Debug

Add the `--debug <Number>` flag to emit logging statments. Set `--debug 5` to 
get all messages, including `console.debug`

## Features

+ Common root with `--root <location>` flag
+ `---distro-separate` is a temporary system folder as default configuration. Eases setup burden
+ Action specific commands `watch` & `just-build`
+ Builds only deltas during `watch`. Improves build speed.
+ `--silent` flag
+ Debugging flag `--debug` is a numerical level, which provide greater granularity
+ Relative to CWD at execution time, not script location
+ Renamed `--watch` to `--infolder` 
+ Automatic absolute path checking and preservation `--distro /var/app/location --infolder some/relative/location` 
+ logging verbosity support via `logdebug.js`

## Distrubtion via yarn, npm and Github

```
	yarn add --flat minundy.js
```

```
	npm install minundy.js
```

```
yarn add --flat https://github.com/gtzilla/minundy.js

```

### Target Specific Commit or Release in Github

Target release 1.0.1, which is commit `cf972ab89bac3f69fb29a01648055db64ef2a29d`

```
yarn add --flat https://github.com/gtzilla/minundy.js/archive/cf972ab89bac3f69fb29a01648055db64ef2a29d.tar.gz
```


##### Tips on Usage


Add a scripts section to your package.json. I prefer `yarn watch` for monitoring 
HTML / JS during development. Replace below PATHs with your own paths.

```
"scripts":{
	"watch":"node node_modules/minundy.js/src/minundy.js watch --debug 6 --infolder server_path/to_static/js-view-templates/ 
	--distro server_path/to_static-dist/js-view-templates/"
}
```

By default, I provoke the most verbose response with `--debug 6`, but if I need less screen output, I can always `yarn watch --silent` to suppress all logging.

