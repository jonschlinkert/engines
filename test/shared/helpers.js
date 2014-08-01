
var cons = require('../../');
var handlebars = require('handlebars');
var fs = require('fs');
var readFile = fs.readFile;
var readFileSync = fs.readFileSync;

exports.test = function(name) {
  var user = { name: '<strong>Tobi</strong>' };

  describe(name, function(){

    afterEach(function(){
      fs.readFile = readFile;
      fs.readFileSync = readFileSync;
    });

    if (name === 'handlebars') {

      // Use case: return safe HTML that won’t be escaped in the final render.
      it('should support helpers', function(done) {
        var str = fs.readFileSync('test/fixtures/' + name + '/helpers.' + name).toString();

        var locals = { user: user, str: str, helpers: { safe: function(object) {
          return new handlebars.SafeString(object);
        }}};

        var html = cons[name].render(str, locals);
        html.should.equal('<strong>Tobi</strong>');
        done();
      });
    }
  });
};
