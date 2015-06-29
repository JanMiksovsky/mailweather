var assert = require('chai').assert;
var parseLocation = require('../server/parseLocation');

describe("Parse location from Apple Maps email", function() {
  var text = "Jan Miksovsky's Location <http://maps.apple.com/?q=47.632939,-122.280175&sll=47.632939,-122.280175>\n\n\n\n\n\n-Jan\n\n(sent from my phone)";
  var location = parseLocation(text);
  assert.equal(location.latitude, 47.632939);
  assert.equal(location.longitude, -122.280175);
});
