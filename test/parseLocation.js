'use strict';

let assert = require('chai').assert;
let parseLocation = require('../server/parseLocation');

describe('location parser', () => {

  it("parses location from Apple Maps email", () => {
    let text = "Jan Miksovsky's Location <http://maps.apple.com/?q=47.632939,-122.280175&sll=47.632939,-122.280175>\n\n\n\n\n\n-Jan\n\n(sent from my phone)";
    let location = parseLocation(text);
    assert.equal(location.latitude, 47.632939);
    assert.equal(location.longitude, -122.280175);
  });

  it("parses location from DeLorme InReach email", () => {
    let text = "Jan Miksovsky sent this message from:\nLat 47.633082 Lon -122.280192";
    let location = parseLocation(text);
    assert.equal(location.latitude, 47.633082);
    assert.equal(location.longitude, -122.280192);
  });

});
