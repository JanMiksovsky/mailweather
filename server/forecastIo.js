/*
 * Integrate with Forecast.io.
 */


'use strict';

let request = require('request-promise');
let formatForecast = require('./formatForecast');


/*
 * Return a promise for a weather forecast for the given location.
 */
function getForecast(location) {
  let apiKey = process.env.FORECAST_API_KEY;
  let latitude = location.latitude;
  let longitude = location.longitude;
  let url = `https://api.forecast.io/forecast/${apiKey}/${latitude},${longitude}`;
  console.log(`Getting forecast: ${url}`);
  return request(url)
  .then(function(response) {
    let forecast = JSON.parse(response);
    console.log("Got forecast");
    let formatted = formatForecast(forecast);
    return formatted;
  });
}

module.exports = { getForecast };
