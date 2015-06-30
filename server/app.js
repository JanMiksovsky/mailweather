"use strict";

let express = require('express');
let bodyParser = require('body-parser');
let parseLocation = require('../server/parseLocation');
let nodemailer = require('nodemailer');
let path = require('path');
let fs = require('fs');

let PORT = process.env.PORT || 8000;
let SEND_FROM = 'MailWeather <5237dc9b94b1dcd5ddd1@cloudmailin.net>';

let transport = nodemailer.createTransport({
  host: 'mail529.pair.com',
  port: 465,
  secure: true,
  debug: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

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
  let json = JSON.stringify(request.envelope, null, 2);
  console.log(json);
  let messageFrom = request.envelope ?
    request.envelope.from :
    'jan@miksovsky.com';
  let messageBody = request.body.plain;
  console.log(`Received message from :\n${messageBody}`);
  let location = parseLocation(messageBody);
  let result = location ?
    `Found location: ${JSON.stringify(location, null, 2)}` :
    `No location found`;
  console.log(result);
  var message = {
      from: SEND_FROM,
      to: messageFrom,
      subject: 'Weather',
      text: result
  };
  sendMessage(message);
  response.send(result + '\n\n' + json);
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

function sendMessage(message) {
  transport.sendMail(message, function(error, info){
    if (error) {
      return console.log(error);
    }
    console.log(`Message sent: ${info.response}`);
  });
}
