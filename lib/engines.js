/*!
 * consolidate
 * Copyright(c) 2012 TJ Holowaychuk <tj@vision-media.ca>
 * MIT Licensed
 *
 * Engines which do not support caching of their file contents
 * should use the `read()` function defined in consolidate.js
 * On top of this, when an engine compiles to a `Function`,
 * these functions should either be cached within consolidate.js
 * or the engine itself via `options.cache`. This will allow
 * users and frameworks to pass `options.cache = true` for
 * `NODE_ENV=production`, however edit the file(s) without
 * re-loading the application in development.
 */


var engines = module.exports = {};


/**
 * Module dependencies.
 */

var fs = require('fs'),
  path = require('path'),
  join = path.join,
  extname = path.extname,
  dirname = path.dirname;

var readCache = {};

/**
 * Require cache.
 */

var cacheStore = {};

/**
 * Require cache.
 */

var requires = {};

/**
 * Clear the cache.
 *
 * @api public
 */

engines.clearCache = function() {
  cacheStore = {};
};

/**
 * Conditionally cache `compiled` template based
 * on the `options` filename and `.cache` boolean.
 *
 * @param {Object} options
 * @param {Function} compiled
 * @return {Function}
 * @api private
 */

function cache(options, compiled) {
  // cachable
  if (compiled && options.filename && options.cache) {
    delete readCache[options.filename];
    cacheStore[options.filename] = compiled;
    return compiled;
  }

  // check cache
  if (options.filename && options.cache) {
    return cacheStore[options.filename];
  }

  return compiled;
}

/**
 * Read `path` with `options`
 * When `options.cache`
 * is true the template string will be cached.
 *
 * @param {String} path
 * @param {String} options
 * @api private
 */

function read(path, options) {
  var str = readCache[path];
  var cached = options.cache && str && 'string' == typeof str;

  // cached (only if cached is a string and not a compiled template function)
  if (cached) {
    return str;
  }

  // read
  str = fs.readFileSync(path, 'utf8');

  // remove extraneous utf8 BOM marker
  str = str.replace(/^\uFEFF/, '');
  if (options.cache) {
    readCache[path] = str;
  }
  return str;
}

/**
 * Read `path` with `options`
 * When `options.cache`
 * is true the partial string will be cached.
 *
 * @param {String} path
 * @param {String} options
 * @api private
 */

function readPartials(path, options) {
  if (!options.partials) { return; }
  var partials = options.partials;
  var keys = Object.keys(partials);

  function next(index) {
    if (index == keys.length) {return cb(null);}
    var key = keys[index];
    var file = join(dirname(path), partials[key] + extname(path));
    options.partials[key] = read(file, options);
    next(++index);
  }
  next(0);
}

/**
 * fromStringRenderer
 */

function fromStringRenderer(name) {
  return function(path, options) {
    options.filename = path;
    readPartials(path, options);
    if (cache(options)) {
      return engines[name].render('', options);
    } else {
      var str = read(path, options);
      return engines[name].render(str, options);
    }
  };
}

function waitFor(fn) {
  var done = false;
  var rendered = '';
  var error = null;
  // create a callback to capture the rendered results
  function cb (err, str) {
    error = err;
    rendered = str;
  }
  // use all the arguments passed in
  var args = [].slice.call(arguments);
  // remove the first argument
  args.unshift();
  // add the callback as the last argument
  args.push(cb);
  // call the function
  fn.apply(fn, args);
  while(!done) {
    // wait until it returns;
  }
  if (error) {
    throw new Error(error);
  }
  return rendered;
}

/**
 * Jade support.
 */

engines.jade = function(path, options) {
  var engine = requires.jade;
  if (!engine) {
    try {
      engine = requires.jade = require('jade');
    } catch (err) {
      try {
        engine = requires.jade = require('then-jade');
      } catch (otherError) {
        throw err;
      }
    }
  }
  return engine.renderFile(path, options);
};

/**
 * Jade string support.
 */

engines.jade.render = function(str, options) {
  var engine = requires.jade;
  if (!engine) {
    try {
      engine = requires.jade = require('jade');
    } catch (err) {
      try {
        engine = requires.jade = require('then-jade');
      } catch (otherError) {
        throw err;
      }
    }
  }
  return engine.render(str, options);
};

/**
 * Dust support.
 */

engines.dust = fromStringRenderer('dust');

/**
 * Dust string support.
 */

engines.dust.render = function(str, options) {
  var engine = requires.dust;
  if (!engine) {
    try {
      engine = requires.dust = require('dust');
    } catch (err) {
      try {
        engine = requires.dust = require('dustjs-helpers');
      } catch (err) {
        engine = requires.dust = require('dustjs-linkedin');
      }
    }
  }

  var ext = 'dust';
  var views = '.';

  if (options) {
    if (options.ext) {ext = options.ext;}
    if (options.views) {views = options.views;}
    if (options.settings && options.settings.views) {views = options.settings.views;}
  }
  if (!options || (options && !options.cache)) {engine.cache = {};}

  engine.onLoad = function(path, callback) {
    if ('' === extname(path)) {path += '.' + ext;}
    if ('/' !== path[0]) {path = views + '/' + path;}
    var str = read(path, options);
    callback(null, str);
  };

  try {
    var tmpl = cache(options) || cache(options, engine.compileFn(str));
    return waitFor(tmpl, options);
  } catch (err) {
    throw err;
  }
};

/**
 * Swig support.
 */

engines.swig = fromStringRenderer('swig');

/**
 * Swig string support.
 */

engines.swig.render = function(str, options) {
  var engine = requires.swig || (requires.swig = require('swig'));
  try {
    if(options.cache === true) options.cache = 'memory';
    var tmpl = cache(options) || cache(options, engine.compile(str, options));
    return tmpl(options);
  } catch (err) {
    throw err;
  }
};

/**
 * Atpl support.
 */

engines.atpl = fromStringRenderer('atpl');

/**
 * Atpl string support.
 */

engines.atpl.render = function(str, options) {
  var engine = requires.atpl || (requires.atpl = require('atpl'));
  try {
    var tmpl = cache(options) || cache(options, engine.compile(str, options));
    return tmpl(options);
  } catch (err) {
    throw err;
  }
};

/**
 * Liquor support,
 */

engines.liquor = fromStringRenderer('liquor');

/**
 * Liquor string support.
 */

engines.liquor.render = function(str, options) {
  var engine = requires.liquor || (requires.liquor = require('liquor'));
  try {
    var tmpl = cache(options) || cache(options, engine.compile(str, options));
    tmpl(options);
  } catch (err) {
    throw err;
  }
};

/**
 * EJS support.
 */

engines.ejs = fromStringRenderer('ejs');

/**
 * EJS string support.
 */

engines.ejs.render = function(str, options) {
  var engine = requires.ejs || (requires.ejs = require('ejs'));
  try {
    var tmpl = cache(options) || cache(options, engine.compile(str, options));
    tmpl(options);
  } catch (err) {
    throw err;
  }
};

/**
 * Eco support.
 */

engines.eco = fromStringRenderer('eco');

/**
 * Eco string support.
 */

engines.eco.render = function(str, options) {
  var engine = requires.eco || (requires.eco = require('eco'));
  try {
    engine.render(str, options);
  } catch (err) {
    throw err;
  }
};

/**
 * Jazz support.
 */

engines.jazz = fromStringRenderer('jazz');

/**
 * Jazz string support.
 */

engines.jazz.render = function(str, options) {
  var engine = requires.jazz || (requires.jazz = require('jazz'));
  try {
    var tmpl = cache(options) || cache(options, engine.compile(str, options));
    return waitFor(tmpl.eval, options);
  } catch (err) {
    throw err;
  }
};

/**
 * JQTPL support.
 */

engines.jqtpl = fromStringRenderer('jqtpl');

/**
 * JQTPL string support.
 */

engines.jqtpl.render = function(str, options) {
  var engine = requires.jqtpl || (requires.jqtpl = require('jqtpl'));
  try {
    engine.template(str, str);
    engine.tmpl(str, options);
  } catch (err) {
    throw err;
  }
};

/**
 * Haml support.
 */

engines.haml = fromStringRenderer('haml');

/**
 * Haml string support.
 */

engines.haml.render = function(str, options) {
  var engine = requires.hamljs || (requires.hamljs = require('hamljs'));
  try {
    options.locals = options;
    engine.render(str, options).trimLeft();
  } catch (err) {
    throw err;
  }
};

/**
 * Whiskers support.
 */

engines.whiskers = function(path, options) {
  var engine = requires.whiskers || (requires.whiskers = require('whiskers'));
  return waitFor(engine.__express, path, options);
};

/**
 * Whiskers string support.
 */

engines.whiskers.render = function(str, options) {
  var engine = requires.whiskers || (requires.whiskers = require('whiskers'));
  try {
    engine.render(str, options);
  } catch (err) {
    throw err;
  }
};

/**
 * Coffee-HAML support.
 */

engines['haml-coffee'] = fromStringRenderer('haml-coffee');

/**
 * Coffee-HAML string support.
 */

engines['haml-coffee'].render = function(str, options) {
  var engine = requires.HAMLCoffee || (requires.HAMLCoffee = require('haml-coffee'));
  try {
    var tmpl = cache(options) || cache(options, engine.compile(str, options));
    tmpl(options);
  } catch (err) {
    throw err;
  }
};

/**
 * Hogan support.
 */

engines.hogan = fromStringRenderer('hogan');

/**
 * Hogan string support.
 */

engines.hogan.render = function(str, options) {
  var engine = requires.hogan || (requires.hogan = require('hogan.js'));
  try {
    var tmpl = cache(options) || cache(options, engine.compile(str, options));
    tmpl.render(options, options.partials);
  } catch (err) {
  }
};

/**
 * templayed.js support.
 */

engines.templayed = fromStringRenderer('templayed');

/**
 * templayed.js string support.
 */

engines.templayed.render = function(str, options) {
  var engine = requires.templayed || (requires.templayed = require('templayed'));
  try {
    var tmpl = cache(options) || cache(options, engine(str));
    tmpl(options);
  } catch (err) {
    throw err;
  }
};

/**
 * Handlebars support.
 */

engines.handlebars = fromStringRenderer('handlebars');

/**
 * Handlebars string support.
 */

engines.handlebars.render = function(str, options) {
  var engine = requires.handlebars || (requires.handlebars = require('handlebars'));
  try {
    for (var partial in options.partials) {
      engine.registerPartial(partial, options.partials[partial]);
    }
    for (var helper in options.helpers) {
      engine.registerHelper(helper, options.helpers[helper]);
    }
    var tmpl = cache(options) || cache(options, engine.compile(str, options));
    tmpl(options);
  } catch (err) {
    throw err;
  }
};

/**
 * Underscore support.
 */

engines.underscore = fromStringRenderer('underscore');

/**
 * Underscore string support.
 */

engines.underscore.render = function(str, options) {
  var engine = requires.underscore || (requires.underscore = require('underscore'));
  try {
    var tmpl = cache(options) || cache(options, engine.template(str, null, options));
    tmpl(options).replace(/\n$/, '');
  } catch (err) {
    throw err;
  }
};


/**
 * Lodash support.
 */

engines.lodash = fromStringRenderer('lodash');

/**
 * Lodash string support.
 */

engines.lodash.render = function(str, options) {
  var engine = requires.lodash || (requires.lodash = require('lodash'));
  try {
    var tmpl = cache(options) || cache(options, engine.template(str, null, options));
    tmpl(options).replace(/\n$/, '');
  } catch (err) {
    throw err;
  }
};


/**
 * QEJS support.
 */

engines.qejs = fromStringRenderer('qejs');

/**
 * QEJS string support.
 */

engines.qejs.render = function(str, options) {
  try {
    var engine = requires.qejs || (requires.qejs = require('qejs'));
    // wrap the promise with the waitFor and a callback
    return waitFor(function (cb) {
      engine.render(str, options).then(function(result) {
          cb(null, result);
      }, function(err) {
          cb(err);
      }).done();
    });
  } catch (err) {
    throw err;
  }
};


/**
 * Walrus support.
 */

engines.walrus = fromStringRenderer('walrus');

/**
 * Walrus string support.
 */

engines.walrus.render = function(str, options) {
  var engine = requires.walrus || (requires.walrus = require('walrus'));
  try {
    var tmpl = cache(options) || cache(options, engine.parse(str));
    tmpl.compile(options);
  } catch (err) {
    throw err;
  }
};

/**
 * Mustache support.
 */

engines.mustache = fromStringRenderer('mustache');

/**
 * Mustache string support.
 */

engines.mustache.render = function(str, options) {
  var engine = requires.mustache || (requires.mustache = require('mustache'));
  try {
    engine.to_html(str, options, options.partials);
  } catch (err) {
    throw err;
  }
};

/**
 * Just support.
 */

engines.just = function(path, options) {
  var engine = requires.just;
  if (!engine) {
    var JUST = require('just');
    engine = requires.just = new JUST();
  }
  engine.configure({ useCache: options.cache });
  engine.render(path, options, cb);
};

/**
 * Just string support.
 */

engines.just.render = function(str, options, cb) {
  var JUST = require('just');
  var engine = new JUST({ root: { page: str }});
  return waitFor(engine.render, 'page', options);
};

/**
 * ECT support.
 */

engines.ect = function(path, options) {
  var engine = requires.ect;
  if (!engine) {
    var ECT = require('ect');
    engine = requires.ect = new ECT();
  }
  engine.configure({ cache: options.cache });
  return waitFor(engine.render, path, options);
};

/**
 * ECT string support.
 */

engines.ect.render = function(str, options) {
  var ECT = require('ect');
  var engine = new ECT({ root: { page: str }});
  return waitFor(engine.render, 'page', options);
};

/**
 * mote support.
 */

engines.mote = fromStringRenderer('mote');

/**
 * mote string support.
 */

engines.mote.render = function(str, options) {
  var engine = requires.mote || (requires.mote = require('mote'));
  try {
    var tmpl = cache(options) || cache(options, engine.compile(str));
    tmpl(options);
  } catch (err) {
    throw err;
  }
};

/**
 * Toffee support.
 */

engines.toffee = function(path, options) {
  var toffee = requires.toffee || (requires.toffee = require('toffee'));
  return waitFor(toffee.__consolidate_engine_render, path, options);
};

/**
 * Toffee string support.
 */

engines.toffee.render = function(str, options) {
  var engine = requires.toffee || (requires.toffee = require('toffee'));
  try {
  	return waitFor(engine.str_render, str, options);
  } catch (err) {
    cb(err);
  }
};

/**
 * doT support.
 */

engines.dot = fromStringRenderer('dot');

/**
 * doT string support.
 */

engines.dot.render = function(str, options) {
  var engine = requires.dot || (requires.dot = require('dot'));
  try {
    var tmpl = cache(options) || cache(options, engine.compile(str, options && options._def));
    tmpl(options);
  } catch (err) {
    throw err;
  }
};

/**
 * Ractive support.
 */

engines.ractive = fromStringRenderer('ractive');

/**
 * Ractive string support.
 */

engines.ractive.render = function(str, options) {
  var engine = requires.ractive || (requires.ractive = require('ractive'));

  options.template = str;
  if (options.data === null || options.data === undefined)
  {
    options.data = options;
  }

  try {
    return new engine(options).renderHTML();
  } catch (err) {
    cb(err);
  }
};

/**
 * Nunjucks support.
 */

engines.nunjucks = fromStringRenderer('nunjucks');

/**
 * Nunjucks string support.
 */

engines.nunjucks.render = function(str, options) {
  var engine = requires.nunjucks || (requires.nunjucks = require('nunjucks'));
  return waitFor(engine.renderString, str, options);
};
