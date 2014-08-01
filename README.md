# engines

> Template engine enginesolidation library.

## Installation

```bash
$ npm install engines
```

## Supported template engines

- [atpl](https://github.com/soywiz/atpl.js)
- ~~[dust](https://github.com/akdubya/dustjs) [(website)](http://akdubya.github.com/dustjs/)~~
- [eco](https://github.com/sstephenson/eco)
- [ect](https://github.com/baryshev/ect) [(website)](http://ectjs.com/)
- [ejs](https://github.com/visionmedia/ejs)
- [haml](https://github.com/visionmedia/haml.js) [(website)](http://haml-lang.com/)
- [haml-coffee](https://github.com/9elements/haml-coffee) [(website)](http://haml-lang.com/)
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

All templates supported by this library may be rendered using the signature `(path[, context], callback)` as shown below, which is the same signature that Assemble supports, so any of these engines may be used within Assemble.

__NOTE__: All this example code uses `engines.handlebars` for the [Handlebars](handlebarsjs.com) template engine. Replace handlebars with whatever template engine you prefer. For example, use `engines.hogan` for hogan.js, `engines.jade` for jade, etc.

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

To enable caching pass `{ cache: true }`. Engines _may_ use this option to cache things reading the file contents, like compiled `Function`s etc. Engines which do _not_ support this may simply ignore it. All engines that **engines** implements I/O for will cache the file contents, this is ideal for production environments.

```js
var engines = require('engines');
engines.handlebars('templates/about.hbs', { title: 'About Us' }, function(err, html) {
  if (err) { throw err; }
  console.log(html);
});
```

## Assemble > 0.6 example

```js
var assemble = require('assemble')
    engines = require('engines');

// assign the handlebars engine to .hbs files
assemble.engine('hbs', engines.handlebars);

// assign the marked engine to .md files
assemble.engine('md', engines.marked);

// Run assemble
assemble.run()
  .src('templates/*.hbs')
  .src('content/*.md')
  .dest()

assemble.build();
```

## Running tests

  Install dev deps:

    $ npm install -d


## License

(The MIT License)

Copyright (c) 2014 Jon Schlinkert &lt;https://github.com/jonschlinkert&gt;
Copyright (c) 2011 TJ Holowaychuk &lt;tj@vision-media.ca&gt;

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
