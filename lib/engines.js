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


var engines = modules.exports = {};


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
 * Read `path` with `options` with
 * callback `(err, str)`. When `options.cache`
 * is true the template string will be cached.
 *
 * @param {String} options
 * @param {Function} cb
 * @api private
 */

function read(path, options, cb) {
  var str = readCache[path];
  var cached = options.cache && str && 'string' == typeof str;

  // cached (only if cached is a string and not a compiled template function)
  if (cached) {
    return cb(null, str);
  }

  // read
  fs.readFile(path, 'utf8', function(err, str) {
    if (err) {
      return cb(err);
    }
    // remove extraneous utf8 BOM marker
    str = str.replace(/^\uFEFF/, '');
    if (options.cache) {
      readCache[path] = str;
    }
    cb(null, str);
  });
}

/**
 * Read `path` with `options` with
 * callback `(err, str)`. When `options.cache`
 * is true the partial string will be cached.
 *
 * @param {String} options
 * @param {Function} cb
 * @api private
 */

function readPartials(path, options, cb) {
  if (!options.partials) {return cb();}
  var partials = options.partials;
  var keys = Object.keys(partials);

  function next(index) {
    if (index == keys.length) {return cb(null);}
    var key = keys[index];
    var file = join(dirname(path), partials[key] + extname(path));
    read(file, options, function(err, str) {
      if (err) {return cb(err);}
      options.partials[key] = str;
      next(++index);
    });
  }

  next(0);
}

/**
 * fromStringRenderer
 */

function fromStringRenderer(name) {
  return function(path, options, cb) {
    options.filename = path;
    readPartials(path, options, function(err) {
      if (err) {
        return cb(err);
      }
      if (cache(options)) {
        engines[name].render('', options, cb);
      } else {
        read(path, options, function(err, str) {
          if (err) {
            return cb(err);
          }
          engines[name].render(str, options, cb);
        });
      }
    });
  };
}

/**
 * Jade support.
 */

engines.jade = function(path, options, cb) {
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
  engine.renderFile(path, options, cb);
};

/**
 * Jade string support.
 */

engines.jade.render = function(str, options, cb) {
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
  engine.render(str, options, cb);
};

/**
 * Dust support.
 */

engines.dust = fromStringRenderer('dust');

/**
 * Dust string support.
 */

engines.dust.render = function(str, options, cb) {
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
    if ('' == extname(path)) {path += '.' + ext;}
    if ('/' !== path[0]) path = {views + '/' + path;}
    read(path, options, callback);
  };

  try {
    var tmpl = cache(options) || cache(options, engine.compilecb(str));
    tmpl(options, cb);
  } catch (err) {
    cb(err);
  }
};

/**
 * Swig support.
 */

engines.swig = fromStringRenderer('swig');

/**
 * Swig string support.
 */

engines.swig.render = function(str, options, cb) {
  var engine = requires.swig || (requires.swig = require('swig'));
  try {
    if(options.cache === true) options.cache = 'memory';
    var tmpl = cache(options) || cache(options, engine.compile(str, options));
    cb(null, tmpl(options));
  } catch (err) {
    cb(err);
  }
};

/**
 * Atpl support.
 */

engines.atpl = fromStringRenderer('atpl');

/**
 * Atpl string support.
 */

engines.atpl.render = function(str, options, cb) {
  var engine = requires.atpl || (requires.atpl = require('atpl'));
  try {
    var tmpl = cache(options) || cache(options, engine.compile(str, options));
    cb(null, tmpl(options));
  } catch (err) {
    cb(err);
  }
};

/**
 * Liquor support,
 */

engines.liquor = fromStringRenderer('liquor');

/**
 * Liquor string support.
 */

engines.liquor.render = function(str, options, cb) {
  var engine = requires.liquor || (requires.liquor = require('liquor'));
  try {
    var tmpl = cache(options) || cache(options, engine.compile(str, options));
    cb(null, tmpl(options));
  } catch (err) {
    cb(err);
  }
};

/**
 * EJS support.
 */

engines.ejs = fromStringRenderer('ejs');

/**
 * EJS string support.
 */

engines.ejs.render = function(str, options, cb) {
  var engine = requires.ejs || (requires.ejs = require('ejs'));
  try {
    var tmpl = cache(options) || cache(options, engine.compile(str, options));
    cb(null, tmpl(options));
  } catch (err) {
    cb(err);
  }
};

/**
 * Eco support.
 */

engines.eco = fromStringRenderer('eco');

/**
 * Eco string support.
 */

engines.eco.render = function(str, options, cb) {
  var engine = requires.eco || (requires.eco = require('eco'));
  try {
    cb(null, engine.render(str, options));
  } catch (err) {
    cb(err);
  }
};

/**
 * Jazz support.
 */

engines.jazz = fromStringRenderer('jazz');

/**
 * Jazz string support.
 */

engines.jazz.render = function(str, options, cb) {
  var engine = requires.jazz || (requires.jazz = require('jazz'));
  try {
    var tmpl = cache(options) || cache(options, engine.compile(str, options));
    tmpl.eval(options, function(str) {
      cb(null, str);
    });
  } catch (err) {
    cb(err);
  }
};

/**
 * JQTPL support.
 */

engines.jqtpl = fromStringRenderer('jqtpl');

/**
 * JQTPL string support.
 */

engines.jqtpl.render = function(str, options, cb) {
  var engine = requires.jqtpl || (requires.jqtpl = require('jqtpl'));
  try {
    engine.template(str, str);
    cb(null, engine.tmpl(str, options));
  } catch (err) {
    cb(err);
  }
};

/**
 * Haml support.
 */

engines.haml = fromStringRenderer('haml');

/**
 * Haml string support.
 */

engines.haml.render = function(str, options, cb) {
  var engine = requires.hamljs || (requires.hamljs = require('hamljs'));
  try {
    options.locals = options;
    cb(null, engine.render(str, options).trimLeft());
  } catch (err) {
    cb(err);
  }
};

/**
 * Whiskers support.
 */

engines.whiskers = function(path, options, cb) {
  var engine = requires.whiskers || (requires.whiskers = require('whiskers'));
  engine.__express(path, options, cb);
};

/**
 * Whiskers string support.
 */

engines.whiskers.render = function(str, options, cb) {
  var engine = requires.whiskers || (requires.whiskers = require('whiskers'));
  try {
    cb(null, engine.render(str, options));
  } catch (err) {
    cb(err);
  }
};

/**
 * Coffee-HAML support.
 */

engines['haml-coffee'] = fromStringRenderer('haml-coffee');

/**
 * Coffee-HAML string support.
 */

engines['haml-coffee'].render = function(str, options, cb) {
  var engine = requires.HAMLCoffee || (requires.HAMLCoffee = require('haml-coffee'));
  try {
    var tmpl = cache(options) || cache(options, engine.compile(str, options));
    cb(null, tmpl(options));
  } catch (err) {
    cb(err);
  }
};

/**
 * Hogan support.
 */

engines.hogan = fromStringRenderer('hogan');

/**
 * Hogan string support.
 */

engines.hogan.render = function(str, options, cb) {
  var engine = requires.hogan || (requires.hogan = require('hogan.js'));
  try {
    var tmpl = cache(options) || cache(options, engine.compile(str, options));
    cb(null, tmpl.render(options, options.partials));
  } catch (err) {
    cb(err);
  }
};

/**
 * templayed.js support.
 */

engines.templayed = fromStringRenderer('templayed');

/**
 * templayed.js string support.
 */

engines.templayed.render = function(str, options, cb) {
  var engine = requires.templayed || (requires.templayed = require('templayed'));
  try {
    var tmpl = cache(options) || cache(options, engine(str));
    cb(null, tmpl(options));
  } catch (err) {
    cb(err);
  }
};

/**
 * Handlebars support.
 */

engines.handlebars = fromStringRenderer('handlebars');

/**
 * Handlebars string support.
 */

engines.handlebars.render = function(str, options, cb) {
  var engine = requires.handlebars || (requires.handlebars = require('handlebars'));
  try {
    for (var partial in options.partials) {
      engine.registerPartial(partial, options.partials[partial]);
    }
    for (var helper in options.helpers) {
      engine.registerHelper(helper, options.helpers[helper]);
    }
    var tmpl = cache(options) || cache(options, engine.compile(str, options));
    cb(null, tmpl(options));
  } catch (err) {
    cb(err);
  }
}

/**
 * Underscore support.
 */

engines.underscore = fromStringRenderer('underscore');

/**
 * Underscore string support.
 */

engines.underscore.render = function(str, options, cb) {
  var engine = requires.underscore || (requires.underscore = require('underscore'));
  try {
    var tmpl = cache(options) || cache(options, engine.template(str, null, options));
    cb(null, tmpl(options).replace(/\n$/, ''));
  } catch (err) {
    cb(err);
  }
};


/**
 * Lodash support.
 */

engines.lodash = fromStringRenderer('lodash');

/**
 * Lodash string support.
 */

engines.lodash.render = function(str, options, cb) {
  var engine = requires.lodash || (requires.lodash = require('lodash'));
  try {
    var tmpl = cache(options) || cache(options, engine.template(str, null, options));
    cb(null, tmpl(options).replace(/\n$/, ''));
  } catch (err) {
    cb(err);
  }
};


/**
 * QEJS support.
 */

engines.qejs = fromStringRenderer('qejs');

/**
 * QEJS string support.
 */

engines.qejs.render = function(str, options, cb) {
  try {
    var engine = requires.qejs || (requires.qejs = require('qejs'));
    engine.render(str, options).then(function(result) {
        cb(null, result);
    }, function(err) {
        cb(err);
    }).done();
  } catch (err) {
    cb(err);
  }
};


/**
 * Walrus support.
 */

engines.walrus = fromStringRenderer('walrus');

/**
 * Walrus string support.
 */

engines.walrus.render = function(str, options, cb) {
  var engine = requires.walrus || (requires.walrus = require('walrus'));
  try {
    var tmpl = cache(options) || cache(options, engine.parse(str));
    cb(null, tmpl.compile(options));
  } catch (err) {
    cb(err);
  }
};

/**
 * Mustache support.
 */

engines.mustache = fromStringRenderer('mustache');

/**
 * Mustache string support.
 */

engines.mustache.render = function(str, options, cb) {
  var engine = requires.mustache || (requires.mustache = require('mustache'));
  try {
    cb(null, engine.to_html(str, options, options.partials));
  } catch (err) {
    cb(err);
  }
};

/**
 * Just support.
 */

engines.just = function(path, options, cb) {
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
  engine.render('page', options, cb);
};

/**
 * ECT support.
 */

engines.ect = function(path, options, cb) {
  var engine = requires.ect;
  if (!engine) {
    var ECT = require('ect');
    engine = requires.ect = new ECT();
  }
  engine.configure({ cache: options.cache });
  engine.render(path, options, cb);
};

/**
 * ECT string support.
 */

engines.ect.render = function(str, options, cb) {
  var ECT = require('ect');
  var engine = new ECT({ root: { page: str }});
  engine.render('page', options, cb);
};

/**
 * mote support.
 */

engines.mote = fromStringRenderer('mote');

/**
 * mote string support.
 */

engines.mote.render = function(str, options, cb) {
  var engine = requires.mote || (requires.mote = require('mote'));
  try {
    var tmpl = cache(options) || cache(options, engine.compile(str));
    cb(null, tmpl(options));
  } catch (err) {
    cb(err);
  }
};

/**
 * Toffee support.
 */

engines.toffee = function(path, options, cb) {
  var toffee = requires.toffee || (requires.toffee = require('toffee'));
  toffee.__consolidate_engine_render(path, options, cb);
};

/**
 * Toffee string support.
 */

engines.toffee.render = function(str, options, cb) {
  var engine = requires.toffee || (requires.toffee = require('toffee'));
  try {
  	engine.str_render(str, options,cb);
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

engines.dot.render = function(str, options, cb) {
  var engine = requires.dot || (requires.dot = require('dot'));
  try {
    var tmpl = cache(options) || cache(options, engine.compile(str, options && options._def));
    cb(null, tmpl(options));
  } catch (err) {
    cb(err);
  }
};

/**
 * Ractive support.
 */

engines.ractive = fromStringRenderer('ractive');

/**
 * Ractive string support.
 */

engines.ractive.render = function(str, options, cb) {
  var engine = requires.ractive || (requires.ractive = require('ractive'));

  options.template = str;
  if (options.data === null || options.data === undefined)
  {
    options.data = options;
  }

  try {
    cb(null, new engine(options).renderHTML());
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

engines.nunjucks.render = function(str, options, cb) {
  var engine = requires.nunjucks || (requires.nunjucks = require('nunjucks'));
  engine.renderString(str, options, cb);
};
