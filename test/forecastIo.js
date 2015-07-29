"use strict";

let fs = require('fs');
let path = require('path');
let assert = require('chai').assert;
let nock = require('nock');
let sample = require('./sample');
let forecastIo = require('../server/forecastIo');

describe('ForecastIO', function() {

  it("formats forecast from sample data", function(done) {
    let actual;
    sample.getForecast()
    .then(function(forecast) {
      actual = forecastIo.format(forecast);
      return sample.getFile('forecast.txt');
    })
    .then(function(expected) {
      assert.equal(actual, expected);
      done();
    })
    .catch(function(err) {
      done(err);
    });
  });

  it("calls forecast.io result", function(done) {
    sample.getForecast()
    .then(function(data) {
      var scope = nock('https://api.forecast.io')
          // Ignore API key for test purposes
          .filteringPath(/\/forecast\/[a-z0-9]+/, '/forecast/KEY')
          .get('/forecast/KEY/47.633082,-122.280192')
          .reply(200, data);
      var location = {
        "latitude": 47.633082,
        "longitude": -122.280192,
      };
      return forecastIo.getForecast(location);
    })
    .then(function(forecast) {
      assert.isNotNull(forecast)
      done();
    })
    .catch(function(err) {
      done(err);
    });
  });

});
