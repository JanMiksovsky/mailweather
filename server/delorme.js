"use strict";

function extractUrlFromEmail(email) {
  let urlRegex = /https:\/\/explore.delorme.com\/textmessage\/\S+/;
  let match = email.match(urlRegex);
  return match && match[0];
}

module.exports = {
  extractUrlFromEmail: extractUrlFromEmail
};
