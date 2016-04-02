/*
 * Interact with DeLorme's clunky email/web pseudo-API.
 */

'use strict';

const REPLY_FROM = 'weather@miksovsky.com';
const DELORME_DOMAINS = [
  'delorme.com',
  'sendgrid.net'  // Apparent DeLorme service provider
];
const DELORME_ENDPOINT = 'https://explore.delorme.com/TextMessage/TxtMsg';
// const DELORME_ENDPOINT = 'http://miksovsky.com/TextMessage/TxtMsg';

let request = require('request-promise');
let $ = require('cheerio');

function sendReply(originalMessage, reply) {
  let url = extractUrlFromEmail(originalMessage);
  if (!url) {
    throw "Couldn't find DeLorme URL.";
  }
  console.log(`Requesting DeLorme page ${url}`);
  return request(url)
  .then(html => {
    let data = parseDeLormePage(html);
    console.log(`Got DeLorme page with data: ${JSON.stringify(data, null, 2)}`);
    data.ReplyAddress = REPLY_FROM;
    data.ReplyMessage = reply.body;
    return postToDeLorme(data);
  })
  .then(result => {
    console.log("Successfully posted to DeLorme");
    console.log(JSON.stringify(result, null, 2));
    return result;
  });
}

function extractUrlFromEmail(message) {
  let urlRegex = /https:\/\/explore.delorme.com\/textmessage\/\S+/;
  let match = message.body.match(urlRegex);
  return match && match[0];
}

function isDeLormeMessage(message) {
  let address = message.from;
  return address && DELORME_DOMAINS.some(domain => address.endsWith(domain));
}

function parseDeLormePage(html) {
  let document = $(html);
  let guidInput = document.find('input#Guid');
  let Guid = guidInput.attr('value');
  let messageInput = document.find('input#MessageId');
  let MessageId = messageInput.attr('value');
  return { Guid, MessageId };
}

function postToDeLorme(data) {
  console.log("Preparing post to DeLorme");
  console.log(JSON.stringify(data, null, 2));
  if (process.env.SEND_MESSAGE === 'false') {
    console.log("(Skipped posting to DeLorme)");
    return Promise.resolve({ ok: true });
  } else {
    console.log("Posting to DeLorme");
    return request({
      method: 'POST',
      uri: DELORME_ENDPOINT,
      body: data,
      json: true
    });
  }
}


module.exports = {
  extractUrlFromEmail,
  isDeLormeMessage,
  parseDeLormePage,
  postToDeLorme,
  sendReply
};
