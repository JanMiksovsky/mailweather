'use strict';

let path = require('path');
let express = require('express');
let bodyParser = require('body-parser');
let parseLocation = require('../server/parseLocation');
let forecastIo = require('./forecastIo');
let formatForecast = require('./formatForecast');
let replyToEmail = require('./replyToEmail');
// let replyToDeLorme = require('./replyToDeLorme');

let PORT = process.env.PORT || 8000;

let app = express();

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

app.post('/message', (request, response) => {
  let incoming = parseMessageRequest(request);
  let location = incoming.body && parseLocation(incoming.body);
  console.log(`Received message from :\n${incoming.from})`);
  let responseContent;
  constructReply(location)
  .then(replyBody => {
    responseContent = replyBody;
    // return replyToDeLorme.isDeLormeMessage ?
    //   replyToDeLorme(incoming, replyBody) :
    //   replyToEmail(incoming, replyBody);
    return replyToEmail(incoming, replyBody);
  })
  .then(() => {
    // Return the reply content as the response.
    response.set('Content-Type', 'application/json');
    response.send(responseContent);
  });
});

let clientPath = path.join(__dirname, '../client');
app.use(express.static(clientPath));
app.listen(PORT);
console.log(`Listening on port :${PORT}`);
console.log(`Forecast API key: ${process.env.FORECAST_API_KEY}`);


function constructReply(location) {

  if (!location) {
    // No location found
    return Promise.resolve({
      subject: "Weather: no location found",
      body: "No location could be found in the original message below."
    });
  }

  // Return formatted forecast for location.
  return forecastIo.getForecast(location)
  .then(forecast => {
    let formatted = formatForecast(forecast);
    let replyBody = `${formatted}\n\n${location.latitude},${location.longitude}`;
    return {
      subject: `Weather for ${location.latitude},${location.longitude}`,
      body: replyBody
    };
  });
}

function parseMessageRequest(request) {
  return {
    from: request.body.html || request.body.plain,
    body: (request.envelope && request.envelope.from) || request.body.from
  };
}
