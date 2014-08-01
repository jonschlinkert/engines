
var cons = require('../../');
var fs = require('fs');
var readFile = fs.readFile;
var readFileSync = fs.readFileSync;

exports.test = function(name) {
  var user = { name: 'Tobi' };

  describe(name, function(){
    afterEach(function(){
      fs.readFile = readFile;
      fs.readFileSync = readFileSync;
    });

    if (name === 'hogan' || name === 'mustache' || name === 'handlebars' || name === 'ractive') {
      it('should support partials', function(done){
        var path = 'test/fixtures/' + name + '/partials.' + name;
        var str = fs.readFileSync(path).toString();
        var partial = fs.readFileSync('test/fixtures/' + name + '/user.' + name).toString();
        var locals = { user: user, str: str, partials: { partial: partial } };
        var html = cons[name](path, locals);
        html.should.equal('<p>Tobi</p>');
        done();
      });
    }
    else {
      it('should support rendering a partial', function(done){
        var str = fs.readFileSync('test/fixtures/' + name + '/user_partial.' + name).toString();
        var locals = {
          user: user,
          views: "./test/fixtures/" + name,
          str: str
        };
        var html = cons[name].render(str, locals);
        html.should.equal('<p>Tobi from partial!</p><p>Tobi</p>');
        done();
      });
    }
  });
};
