'use strict';

var handlebars = require('handlebars');
var fs = require('fs');
var readFile = fs.readFile;
var readFileSync = fs.readFileSync;
var engines = require('../..');

exports.test = function (name) {
  var user = {
    name: '<strong>Assemble</strong>'
  };

  describe(name, function () {
    afterEach(function () {
      fs.readFile = readFile;
      fs.readFileSync = readFileSync;
    });

    if (name === 'handlebars') {
      // Use case: return safe HTML that won’t be escaped in the final render.
      it('should support helpers', function (done) {
        var str = fs.readFileSync('test/fixtures/' + name + '/helpers.' + name).toString();

        var locals = {
          user: user,
          str: str,
          helpers: {
            safe: function (object) {
              return new handlebars.SafeString(object);
            }
          }
        };

        if (engines[name].hasOwnProperty('renderSync')) {
          var html = engines[name].renderSync(str, locals);
          html.should.equal('<strong>Assemble</strong>');
        }
        done();
      });
    }
  });
};