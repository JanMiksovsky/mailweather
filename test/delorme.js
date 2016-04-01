'use strict';

let assert = require('chai').assert;
let sample = require('./sample');
let delorme = require('../server/replyToDeLorme');

describe.skip('DeLorme handler', () => {

  it("extracts link from email", done => {
    sample.getFile('delorme.eml')
    .then(email => {
      let url = delorme.extractUrlFromEmail(email);
      assert.equal(url, 'https://explore.delorme.com/textmessage/txtmsg?mo=6cf76ee244ec40a0ab0170c05040102322740101&adr=jan%40miksovsky.com');
      done();
    })
    .catch(err => {
      done(err);
    });
  });

  it('extracts ID and GUID from DeLorme web page', done => {
    sample.getFile('delorme.html')
    .then(html => {
      let info = delorme.extractInfoFromWebPage(html);
      assert.equal(info.guid, '798be1f2-bca7-4655-b0d7-a4baeafd2fc4');
      assert.equal(info.messageId, '32598084');
      done();
    })
    .catch(err => {
      done(err);
    });
  });

});
