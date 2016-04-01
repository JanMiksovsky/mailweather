'use strict';

let assert = require('chai').assert;
let sample = require('./sample');
let formatForecast = require('../server/formatForecast');

describe('Format forecast', () => {

  it("formats forecast from sample data", done => {
    let actual;
    sample.getForecast()
    .then(forecast => {
      actual = formatForecast(forecast);
      return sample.getFile('forecast.txt');
    })
    .then(expected => {
      assert.equal(actual, expected);
      done();
    })
    .catch(err => {
      done(err);
    });
  });

});
