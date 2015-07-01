"use strict";

let express = require('express');
let bodyParser = require('body-parser');
let parseLocation = require('../server/parseLocation');
let forecastIo = require('./forecastIo');
let nodemailer = require('nodemailer');
let path = require('path');
let fs = require('fs');

let PORT = process.env.PORT || 8000;
let REPLY_FROM = 'MailWeather <5237dc9b94b1dcd5ddd1@cloudmailin.net>';

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
  let incoming = parseMessageRequest(request);
  let body;
  constructReply(incoming)
  .then(function(outgoing) {
    body = outgoing.body;
    let subject = outgoing.subject;
    let message = {
        from: REPLY_FROM,
        to: incoming.from,
        // subject: subject,
        text: body
    };
    sendMessage(message);
    return loadFile('/');
  })
  .then(function(html) {
    // Splice in forecast.
    let placeholder = '<!-- Forecast goes here -->';
    html = html.replace(placeholder, body);
    response.set('Content-Type', 'text/html');
    response.send(html);
  });
});

let clientPath = path.join(__dirname, '../client');
app.use(express.static(clientPath));
app.listen(PORT);
console.log(`Listening on port :${PORT}`);


function constructReply(incoming) {

  let location = parseLocation(incoming.body);

  if (!location) {
    // No location found
    Promise.resolve({
      subject: "Weather: no location found",
      body: "No location could be found in the original message below."
    });
  }

  return forecastIo.getForecast(location)
  .then(function(forecast) {
    let outgoingBody = `${forecast}\n\n${location.latitude},${location.longitude}`;
    return {
      subject: `Weather for ${location.latitude},${location.longitude}`,
      body: outgoingBody
    };
  });
}

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

function parseMessageRequest(request) {
  let messageFrom = request.envelope ?
    request.envelope.from :
    'jan@miksovsky.com';
  console.log(`Received message from :\n${messageFrom}`);
  let messageBody = request.body.html || request.body.plain;
  return {
    from: messageFrom,
    body: messageBody
  };
}

function sendMessage(message) {
  console.log("[Sending message]");
  console.log(JSON.stringify(message, null, 2));
  transport.sendMail(message, function(error, info){
    if (error) {
      return console.log(error);
    }
    console.log(`Message sent: ${info.response}`);
  });
}
