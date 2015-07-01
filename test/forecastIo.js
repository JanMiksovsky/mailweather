"use strict";

let fs = require('fs');
let path = require('path');
let assert = require('chai').assert;
let sample = require('./sample');
let forecastIo = require('../server/forecastIo');

describe('ForecastIO', function() {

  it("formats forecast from sample data", function(done) {
    sample.getForecast()
    .then(function(forecast) {
      let formatted = forecastIo.format(forecast);
      console.log(formatted);
      assert.equal(formatted, 'Clear');
      done();
    })
    .catch(function(err) {
      done(err);
    });
  });

});
