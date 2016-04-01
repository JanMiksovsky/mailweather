'use strict';

let assert = require('chai').assert;
let nock = require('nock');
let sample = require('./sample');
let forecastIo = require('../server/forecastIo');

describe('ForecastIO', () => {

  it("calls forecast.io result", done => {
    sample.getForecast()
    .then(data => {
      nock('https://api.forecast.io')
        // Ignore API key for test purposes
        .filteringPath(/\/forecast\/[a-z0-9]+/, '/forecast/KEY')
        .get('/forecast/KEY/47.633082,-122.280192')
        .reply(200, data);
      let location = {
        "latitude": 47.633082,
        "longitude": -122.280192,
      };
      return forecastIo.getForecast(location);
    })
    .then(forecast => {
      assert.isNotNull(forecast);
      done();
    })
    .catch(err => {
      done(err);
    });
  });

});
