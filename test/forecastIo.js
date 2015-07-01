"use strict";

let fs = require('fs');
let path = require('path');
let assert = require('chai').assert;
let forecastIo = require('../server/forecastIo');

// describe('ForecastIO', function() {
// 
//   it("formats forecast from sample data", function(done) {
//     getSampleForecast()
//     .then(function(forecast) {
//       let formatted = forecastIo.format(forecast);
//       console.log(formatted);
//       assert.equal(formatted, 'Clear');
//       done();
//     })
//     .catch(function(err) {
//       done(err);
//     });
//   });
// 
// });

function getSampleForecast() {

  let filePath = path.join(__dirname, 'forecast.json');
  // console.log(filePath);
  return new Promise(function(resolve, reject) {

    fs.readFile(filePath, { encoding: 'utf8' }, function(err, data) {
      if (err) {
        reject(err);
      } else {
        let json = JSON.parse(data);
        resolve(json);
      }
    });

  });
}

getSampleForecast()
.then(function(forecast) {
  let formatted = forecastIo.format(forecast);
  console.log(formatted);
})
.catch(function(err) {
  console.error(`Error: ${err}`);
});
