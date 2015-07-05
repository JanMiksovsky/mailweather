"use strict";

let fs = require('fs');
let path = require('path');
let assert = require('chai').assert;
let forecastIo = require('../server/forecastIo');

// Return a promise for the contents of the given file.
function getFile(relativePath) {  
  let filePath = path.join(__dirname, relativePath);
  return new Promise(function(resolve, reject) {
    fs.readFile(filePath, { encoding: 'utf8' }, function(err, data) {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
}

function getForecast() {
  return getFile('forecast.json')
  .then(function(data) {
    return JSON.parse(data);
  });
}

module.exports = {
  getFile: getFile,
  getForecast: getForecast
};

if (!module.parent) {
  // Running as script.
  getForecast()
  .then(function(forecast) {
    let formatted = forecastIo.format(forecast);
    console.log(formatted);
  })
  .catch(function(err) {
    console.error(`Error: ${err}`);
  });
}
