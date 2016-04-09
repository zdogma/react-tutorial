var path = require('path');
var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var sqlite3 = require('sqlite3').verbose();
var commentsDB = new sqlite3.Database('db/sqlite3');

app.set('port', (process.env.PORT || 3000));

app.use('/', express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.use(function(req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'no-cache');
  next();
});

app.get('/api/comments', function(req, res) {
  commentsDB.all('SELECT * FROM comments', function(err, rows) {
    if (err) {
      console.error(err);
      process.exit(1);
    }
    res.json(rows);
  });
});

app.post('/api/comments', function(req, res) {
  commentsDB.all('SELECT * FROM comments', function(err, rows) {
    if (err) {
      console.error(err);
      process.exit(1);
    }
    var comments = rows;
    var newComment = {
      author_name: req.body.author_name,
      body_text: req.body.body_text,
    };
    comments.push(newComment);

    commentsDB.run('INSERT INTO comments (author_name, body_text) VALUES(?, ?)',
      [newComment.author_name, newComment.body_text], function(err) {
      if (err) {
        console.error(err);
        process.exit(1);
      }
      res.json(comments);
    });
  });
});

app.listen(app.get('port'), function() {
  console.log('Server started: http://localhost:' + app.get('port') + '/');
});
