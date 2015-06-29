var assert = require('chai').assert;
var parseLocation = require('../server/parseLocation');

describe("Parse location", function() {
  var location = parseLocation('foo');
  assert.equal(location, 3);
});
