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

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

app.get('/', function(request, response) {
  loadFile(request.path)
    .then(function(html) {
      response.set('Content-Type', 'text/html');
      response.send(html);
    })
    .catch(function(err) {
      console.error(err);
    });
});

app.post('/message', function(request, response) {
  let json = JSON.stringify(request.body, null, 2);
  console.log(json);
  let messageFrom = request.envelope ?
    request.envelope.from :
    'jan@miksovsky.com';
  let receivedBody = request.body.html || request.body.plain;
  console.log(`Received message from :\n${receivedBody}`);
  let location = parseLocation(receivedBody);
  let result = location ?
    `Found location: ${JSON.stringify(location, null, 2)}` :
    `No location found`;
  console.log(result);
  var sendBody = result + '\n\n__________\n\n' + receivedBody;
  var message = {
      from: SEND_FROM,
      to: messageFrom,
      subject: 'Weather',
      text: sendBody
  };
  sendMessage(message);
  response.send(sendBody);
});

let clientPath = path.join(__dirname, '../client');
app.use(express.static(clientPath));
app.listen(PORT);
console.log(`Listening on port :${PORT}`);

/*
 * Return a promise for the file at the given path.
 */
function loadFile(relativePath) {
  if (relativePath === '/') {
    relativePath = 'index.html';
  }
  let filePath = path.join(clientPath, relativePath);
  console.log(filePath);
  return new Promise(function(resolve, reject) {

    fs.readFile(filePath, { encoding: 'utf8' }, function(err, data) {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });

  });
}

function sendMessage(message) {
  transport.sendMail(message, function(error, info){
    if (error) {
      return console.log(error);
    }
    console.log(`Message sent: ${info.response}`);
  });
}
