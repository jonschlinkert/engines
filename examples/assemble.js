// npm install assemble

var assemble = require('assemble');
var engines = require('../');

assemble.engine('md', engines.marked);

assemble.run('site', function() {
  assemble
    .options({layout: 'src/default.hbs'})
    .src('src/*.hbs', {title: 'My Site'})
    .dest('_gh_pages/');
});

assemble.run('blog', function() {
  assemble
    .options({layout: 'src/post.hbs'})
    .src('src/blog/*.md', {title: 'My Blog'})
    .use(permalinks())
    .dest('_gh_pages/blog/');
});

assemble.run('default', ['site', 'blog']);