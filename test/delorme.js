'use strict';

let assert = require('chai').assert;
let nock = require('nock');
let sample = require('./sample');
let deLorme = require('../server/deLorme');

const DELORME_ENDPOINT_HOST = 'https://explore.delorme.com';
// const DELORME_ENDPOINT_HOST = 'http://miksovsky.com';

describe('DeLorme handler', () => {

  it("identifies DeLorme domains", () => {
    assert(deLorme.isDeLormeMessage({ from: 'foo@delorme.com' }));
    assert(deLorme.isDeLormeMessage({ from: 'foo@sendgrid.net' }));
    assert(!deLorme.isDeLormeMessage({ from: 'foo@example.com' }));
  });

  it("extracts link from email", done => {
    sample.getFile('delorme.eml')
    .then(body => {
      let email = { body };
      let url = deLorme.extractUrlFromEmail(email);
      assert.equal(url, 'https://explore.delorme.com/textmessage/txtmsg?mo=6cf76ee244ec40a0ab0170c05040102322740101&adr=jan%40miksovsky.com');
      done();
    })
    .catch(error => {
      done(error);
    });
  });

  it('extracts ID and GUID from DeLorme web page', done => {
    sample.getFile('delorme.html')
    .then(html => {
      let info = deLorme.parseDeLormePage(html);
      assert.equal(info.Guid, '798be1f2-bca7-4655-b0d7-a4baeafd2fc4');
      assert.equal(info.MessageId, '32598084');
      done();
    })
    .catch(error => done(error));
  });

  it('posts to DeLorme endpoint', done => {
    let data = {
      Guid: 'Guid',
      MessageId: 'MessageId',
      ReplyAddress: 'ReplyAddress',
      ReplyMessage: 'ReplyMessage'
    };
    nock(DELORME_ENDPOINT_HOST)
      .post('/TextMessage/TxtMsg')
      .reply(201, {
        Success: true
      });
    deLorme.postToDeLorme(data)
    .then(response => {
      assert(response.Success);
      done();
    })
    .catch(error => done(error));
  });

  it('can reply to an email from a DeLorme device', done => {
    let originalMessage;
    sample.getFile('delorme.eml')
    .then(body => {
      originalMessage = { body };
      return sample.getFile('delorme.html');
    })
    .then(html => {
      // Mock response from DeLorme web server.
      nock('https://explore.delorme.com')
        .get('/textmessage/txtmsg')
        .query(true) // Ignore query params
        .reply(200, html);
      // Mock response from DeLorme endpoint.
      nock(DELORME_ENDPOINT_HOST)
        .post('/TextMessage/TxtMsg', {
          ReplyMessage: "Forecast goes here"
        })
        .reply(201, {
          Success: true
        });
      let replyMessage = {
        body: "Forecast goes here"
      };
      return deLorme.sendReply(originalMessage, replyMessage);
    })
    .then(response => {
      assert(response.Success);
      done();
    })
    .catch(error => done(error));
  });

});
