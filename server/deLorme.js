/*
 * Interact with DeLorme's clunky email/web pseudo-API.
 */

'use strict';

const REPLY_FROM = 'weather@miksovsky.com';
const DELORME_DOMAIN = 'delorme.com';
// const DELORME_ENDPOINT = 'https://explore.delorme.com/TextMessage/TxtMsg';
const DELORME_ENDPOINT = 'http://miksovsky.com/TextMessage/TxtMsg';

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
  });
}

function extractUrlFromEmail(message) {
  let urlRegex = /https:\/\/explore.delorme.com\/textmessage\/\S+/;
  let match = message.body.match(urlRegex);
  return match && match[0];
}

function isDeLormeMessage(message) {
  return message.from && message.from.endsWith(DELORME_DOMAIN);
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
  console.log(JSON.stringify(data, null, 2));
  if (process.env.SEND_MESSAGE === 'false') {
    console.log("(Skipped sending to DeLorme)");
    return Promise.resolve();
  } else {
    console.log("Sending to DeLorme");
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
