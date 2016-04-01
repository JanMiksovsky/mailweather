'use strict';

let $ = require('cheerio');

function replyToDeLorme(originalMessage, replyBody) {

}

function extractInfoFromWebPage(html) {
  let page = $(html);
  let guidInput = page.find('input#Guid');
  let guid = guidInput.attr('value');
  let messageInput = page.find('input#MessageId');
  let messageId = messageInput.attr('value');
  return {
    guid: guid,
    messageId: messageId
  };
}

function extractUrlFromEmail(email) {
  let urlRegex = /https:\/\/explore.delorme.com\/textmessage\/\S+/;
  let match = email.match(urlRegex);
  return match && match[0];
}

function extractInfoFromEmail(email) {
  let url = extractUrlFromEmail(email);
  if (url) {

  } else {
    return null;
  }
}
//
// function parseDeLormeSender(body) {
//   let senderRegex = /&adr=([^\s&]+)/;
//   let match = body.match(senderRegex);
//   return match ?
//     querystring.unescape(match[1]) :
//     null;
// }


module.exports = replyToDeLorme;
