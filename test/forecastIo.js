"use strict";

let fs = require('fs');
let path = require('path');
let assert = require('chai').assert;
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

});
