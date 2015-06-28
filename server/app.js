var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var fs = require('fs');

var PORT = process.env.PORT || 8000;

var app = express();
var clientPath = path.join(__dirname, '../client');

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

app.get('/', function(request, response) {
  loadFile(request.path, function(err, html) {
    if (err) {
      console.error(err);
    } else {
      response.set('Content-Type', 'text/html');
      response.send(html);
    }
  })
});

app.post('/message', function(request, response) {
  var text = `Received message:\n${request.body.message}`;
  console.log(text);
  response.send(text);
});

app.use(express.static(clientPath));
app.listen(PORT);
console.log(`Listening on port :${PORT}`);

/*
 * Return the file for the given path.
 */
function loadFile(relativePath, callback) {
  if (relativePath === '/') {
    relativePath = 'index.html';
  }
  var filePath = path.join(clientPath, relativePath);
  console.log(filePath);
  fs.readFile(filePath, { encoding: 'utf8' }, callback);
}
