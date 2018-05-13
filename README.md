
# minimal_.js

minimal underscore.js templates build tool.

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
