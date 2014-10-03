# engines

> Template engine library with fast, synchronous rendering, based on consolidate.

## Installation

```bash
$ npm install engines
```

## Supported template engines

Engines with strikethroughs are not yet supported or need to be updated. Pull requests to update them are welcome.

- ~~[atpl](https://github.com/soywiz/atpl.js)~~
- ~~[dust](https://github.com/akdubya/dustjs) [(website)](http://akdubya.github.com/dustjs/)~~
- [eco](https://github.com/sstephenson/eco)
- [ect](https://github.com/baryshev/ect) [(website)](http://ectjs.com/)
- [ejs](https://github.com/visionmedia/ejs)
- [haml](https://github.com/visionmedia/haml.js) [(website)](http://haml-lang.com/)
- [haml-coffee](https://github.com/netzpirat/haml-coffee/) [(website)](http://haml-coffee-online.herokuapp.com//)
- [handlebars](https://github.com/wycats/handlebars.js/) [(website)](http://handlebarsjs.com/)
- [hogan](https://github.com/twitter/hogan.js) [(website)](http://twitter.github.com/hogan.js/)
- [jade](https://github.com/visionmedia/jade) [(website)](http://jade-lang.com/)
- [jazz](https://github.com/shinetech/jazz)
- [jqtpl](https://github.com/kof/node-jqtpl) [(website)](http://api.jquery.com/category/plugins/templates/)
- ~~[JUST](https://github.com/baryshev/just)~~
- [liquor](https://github.com/chjj/liquor)
- [lodash](https://github.com/bestiejs/lodash) [(website)](http://lodash.com/)
- [mustache](https://github.com/janl/mustache.js)
- ~~[QEJS](https://github.com/jepso/QEJS)~~
- [ractive](https://github.com/Rich-Harris/Ractive)
- [swig](https://github.com/paularmstrong/swig) [(website)](http://paularmstrong.github.com/swig/)
- [templayed](http://archan937.github.com/templayed.js/)
- [toffee](https://github.com/malgorithms/toffee)
- [underscore](https://github.com/documentcloud/underscore) [(website)](http://documentcloud.github.com/underscore/)
- [walrus](https://github.com/jeremyruppel/walrus) [(website)](http://documentup.com/jeremyruppel/walrus/)
- [whiskers](https://github.com/gsf/whiskers.js)

__NOTE__: you must still install the engines you wish to use, add them to your package.json dependencies.

## API

All templates supported by this library may be rendered using the signature `(path[, context], callback)` as shown below, which is the same signature that Assemble and express support, so any of these engines may be used within Assemble or express.

__NOTE__: All of the examples use `engines.handlebars` for the [Handlebars](handlebarsjs.com) template engine. Replace handlebars with whatever template engine you prefer. For example, use `engines.hogan` for hogan.js, `engines.jade` for jade, etc.

Run `console.log(engines)` for the full list of identifiers.

Examples:

```js
var engines = require('engines');
engines.handlebars('templates/about.hbs', { title: 'About Us' }, function(err, html) {
  if (err) { throw err; }
  console.log(html);
});
```

Or without options / local variables:

```js
var engines = require('engines');
engines.handlebars('templates/about.hbs', function(err, html) {
  if (err) { throw err; }
  console.log(html);
});
```

To dynamically pass the engine, use the subscript operator and a variable:

```js
var engines = require('engines');
var name = 'handlebars';

engines[name]('templates/about.hbs', { title: 'About Us' }, function(err, html) {
  if (err) { throw err; }
  console.log(html);
});
```

## Caching

To enable caching pass `{ cache: true }`. Engines _may_ use this option to cache things reading the file contents, like compiled `Function`s etc. Engines which do _not_ support this may simply ignore it. All engines that **engines** implements I/O for will cache the file contents, as this is ideal for production environments.

```js
var engines = require('engines');
engines.handlebars('templates/about.hbs', { title: 'About Us' }, function(err, html) {
  if (err) { throw err; }
  console.log(html);
});
```

## Assemble v0.6.x example

Run `npm install assemble/assemble#v0.6.0`, then in your `assemblefile.js`, add the following:

```js
var assemble = require('assemble');
var engines = require('..');

assemble.engine('hbs', engines.handlebars);

assemble.task('default', function() {
  assemble.src('docs/*.hbs')
    .pipe(assemble.dest('dist'));
});
```

## Running tests

Install dev dependencies:

```bash
npm install -d && mocha
```

## License

Copyright (c) 2014 Jon Schlinkert, contributors.
Copyright (c) 2011 TJ Holowaychuk &lt;tj@vision-media.ca&gt;

Released under the [MIT license](./LICENSE-MIT).
