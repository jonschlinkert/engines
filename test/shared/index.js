
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

    it('should support locals', function(done){
      var path = 'test/fixtures/' + name + '/user.' + name;
      var str = fs.readFileSync(path).toString();
      var locals = { user: user, str: str };
      var html = cons[name](path, locals);
      html.should.equal('<p>Tobi</p>');
      done();
    });

    it('should not cache by default', function(done){
      var path = 'test/fixtures/' + name + '/user.' + name;
      var str = fs.readFileSync(path).toString();
      var locals = { user: user, str: str };
      var calls = 0;
      var callMap = {
        atpl: 2,
        toffee: 2,
        jade: 2,
        ect: 2
      };
      var expected = callMap[name] || 0;

      fs.readFileSync = function(){
        ++calls;
        return readFileSync.apply(this, arguments);
      };

      fs.readFile = function(){
        ++calls;
        readFile.apply(this, arguments);
      };

      var html = cons[name](path, locals);
      html.should.equal('<p>Tobi</p>');
      html = cons[name](path, locals);
      html.should.equal('<p>Tobi</p>');
      calls.should.equal(expected);
      done();
    });

    it('should support caching', function(done){
      var path = 'test/fixtures/' + name + '/user.' + name;
      var str = fs.readFileSync(path).toString();
      var locals = { user: user, cache: true, str: str };

      var html = cons[name](path, locals);

      fs.readFile = function (path) {
        done(new Error('fs.readFile() called with ' + path));
      };

      fs.readFileSync = function(path){
        done(new Error('fs.readFileSync() called with ' + path));
      };

      html.should.equal('<p>Tobi</p>');
      html = cons[name](path, locals);
      html.should.equal('<p>Tobi</p>');
      done();
    });

    it('should support rendering a string', function(done){
      var str = fs.readFileSync('test/fixtures/' + name + '/user.' + name).toString();
      var locals = { user: user, str: str };
      var html = cons[name].render(str, locals);
      html.should.equal('<p>Tobi</p>');
      done();
    });
  });
};
