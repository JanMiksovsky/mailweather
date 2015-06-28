var express = require('express');
var path = require('path');
var fs = require('fs');

var PORT = process.env.PORT || 8000;

var app = express();
var clientPath = path.join(__dirname, '../client');

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
