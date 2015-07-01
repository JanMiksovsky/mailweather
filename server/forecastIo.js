"use strict";

/*
 * Return a promise for a weather forecast for the given location.
 */

let request = require('request-promise');

// Format a Forecast.io forecast for human presentation.
function format(forecast) {
  return forecast.currently.summary;
}

// Return a promise for a forecast from Forecast.io.
function getForecast(location) {
  let apiKey = process.env.FORECAST_API_KEY;
  let latitude = location.latitude;
  let longitude = location.longitude;
  let url = `https://api.forecast.io/forecast/${apiKey}/${latitude},${longitude}`;
  console.log(`Getting forecast: ${url}`);
  return request(url)
  .then(function(response) {
    var data = JSON.parse(response);
    var hourly = data.hourly;
    console.log("Got forecast");
    return JSON.stringify(hourly);
  });
}

module.exports = {
  format: format,
  getForecast: getForecast
};
