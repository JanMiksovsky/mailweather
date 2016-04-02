'use strict';

let assert = require('chai').assert;
let sample = require('./sample');
let formatter = require('../server/formatter');

describe('Formatter', () => {

  it("abbreviates words found in forecasts", () => {
    let text = "Light rain on Sunday through Tuesday, with temperatures bottoming out at 58°F on Tuesday.";
    let expected = "Light rain Sun thru Tue, temps bottoming out 58° Tue";
    let actual = formatter.abbreviate(text);
    assert.equal(actual, expected);
  });

  it("formats forecast from sample data", done => {
    let actual;
    sample.getForecast()
    .then(forecast => {
      actual = formatter.formatForecast(forecast);
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
