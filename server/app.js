'use strict';

let path = require('path');
let express = require('express');
let bodyParser = require('body-parser');
let parseLocation = require('../server/parseLocation');
let forecastIo = require('./forecastIo');
let formatter = require('./formatter');
let email = require('./email');
let deLorme = require('./deLorme');

let PORT = process.env.PORT || 8000;

let app = express();

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

app.post('/message', (request, response) => {
  let incoming = parseMessageRequest(request);
  let location = incoming.body && parseLocation(incoming.body);
  console.log(`Received message from ${incoming.from}`);
  let responseContent;
  constructReply(location)
  .then(reply => {
    responseContent = reply.body;
    return deLorme.isDeLormeMessage(incoming) ?
      deLorme.sendReply(incoming, reply) :
      email.sendReply(incoming, reply);
  })
  .then(() => {
    // Return the reply content as the response.
    console.log("Completed servicing request");
    response.send(responseContent);
  })
  .catch(error => {
    console.log(error.stack);
    response.send(`${error}\n\n${incoming.body}`);
  });
});

let clientPath = path.join(__dirname, '../client');
app.use(express.static(clientPath));
app.listen(PORT);
console.log(`Listening on port :${PORT}`);
console.log(`Forecast API key: ${process.env.FORECAST_API_KEY}`);


function constructReply(location) {
  if (!location) {
    throw "No location could be found.";
  }
  // Return formatted forecast for location.
  console.log(`Getting forecast for ${location.latitude},${location.longitude}`);
  return forecastIo.getForecast(location)
  .then(forecast => {
    let replyBody = formatter.formatForecast(forecast);
    return {
      subject: `Weather for ${location.latitude},${location.longitude}`,
      body: replyBody
    };
  });
}


function parseMessageRequest(request) {
  return {
    from: (request.envelope && request.envelope.from) || request.body.from,
    body: request.body.html || request.body.plain
  };
}
