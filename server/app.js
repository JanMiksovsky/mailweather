"use strict";

let express = require('express');
let bodyParser = require('body-parser');
let parseLocation = require('../server/parseLocation');
let path = require('path');
let fs = require('fs');

let PORT = process.env.PORT || 8000;

let app = express();
let clientPath = path.join(__dirname, '../client');

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
  });
});

app.post('/message', function(request, response) {
  // let json = JSON.stringify(request.body, null, 2);
  // console.log(json);
  let message = request.body.plain;
  console.log(`Received message:\n${message}`);
  let location = parseLocation(message);
  let responseText = location ?
    `Found location: ${JSON.stringify(location, null, 2)}` :
    `No location found in ${message}`;
  console.log(responseText);
  response.send(responseText);
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
  let filePath = path.join(clientPath, relativePath);
  console.log(filePath);
  fs.readFile(filePath, { encoding: 'utf8' }, callback);
}
