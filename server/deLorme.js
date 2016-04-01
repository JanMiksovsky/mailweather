/*
 * Interact with DeLorme's clunky email/web pseudo-API.
 */

'use strict';

const REPLY_FROM = 'weather@miksovsky.com';
const DELORME_DOMAIN = 'delorme.com';

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
    return sendToDeLorme(data);
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

function sendToDeLorme(data) {
  console.log("Sending to DeLorme");
  console.log(JSON.stringify(data, null, 2));
  if (process.env.SEND_MESSAGE === 'false') {
    console.log("(Skipped sending to DeLorme)");
  } else {
    console.log("(Would have sent to DeLorme)");
  }
  return Promise.resolve();
}


module.exports = {
  extractUrlFromEmail,
  isDeLormeMessage,
  parseDeLormePage,
  sendReply
};
