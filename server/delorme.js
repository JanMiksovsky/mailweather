'use strict';

let $ = require('cheerio');

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

module.exports = {
  extractInfoFromWebPage: extractInfoFromWebPage,
  extractUrlFromEmail: extractUrlFromEmail
};
