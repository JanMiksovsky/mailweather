"use strict";

function parseLocation(text) {
  let locationRegex = /(-?\d+.\d+)(?:,| Lon )(-?\d+.\d+)/;
  let match = text.match(locationRegex);
  let location = match && {
    latitude: match[1],
    longitude: match[2]
  };
  return location;
}

module.exports = parseLocation;
