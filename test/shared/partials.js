'use strict';

var fs = require('fs');
var readFile = fs.readFile;
var readFileSync = fs.readFileSync;
var engines = require('../..');

exports.test = function (name) {
  var user = {
    name: 'Assemble'
  };

  describe(name, function () {
    afterEach(function () {
      fs.readFile = readFile;
      fs.readFileSync = readFileSync;
    });

    if (name === 'hogan' || name === 'mustache' || name === 'handlebars' || name === 'ractive') {
      it('should support partials', function (done) {
        var path = 'test/fixtures/' + name + '/partials.' + name;
        var str = fs.readFileSync(path).toString();
        var partial = fs.readFileSync('test/fixtures/' + name + '/user.' + name).toString();
        var locals = {
          user: user,
          str: str,
          partials: {
            partial: partial
          }
        };
        var html = engines[name](path, locals);
        html.should.equal('<p>Assemble</p>');
        done();
      });
    } else {
      it('should support rendering a partial', function (done) {
        var str = fs.readFileSync('test/fixtures/' + name + '/user_partial.' + name).toString();
        var locals = {
          user: user,
          views: "./test/fixtures/" + name,
          str: str
        };
        var html = engines[name].renderSync(str, locals);
        html.should.equal('<p>Assemble from partial!</p><p>Assemble</p>');
        done();
      });
    }
  });
};