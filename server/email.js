/*
 * Send an email message
 */

'use strict';

const REPLY_FROM = 'MailWeather <5237dc9b94b1dcd5ddd1@cloudmailin.net>';

let nodemailer = require('nodemailer');

let transport = nodemailer.createTransport({
  host: 'mail529.pair.com',
  port: 465,
  secure: true,
  debug: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});


function sendReply(originalMessage, reply) {
  let to = originalMessage.from;
  let message = {
    from: REPLY_FROM,
    to: to,
    subject: reply.subject,
    text: reply.body
  };
  console.log(JSON.stringify(message, null, 2));
  if (process.env.SEND_MESSAGE === 'false') {
    console.log("[Reply sending disabled through environment variable]");
    return Promise.resolve();
  } else if (to.indexOf('noreply') >= 0 || to.indexOf('no.reply') >= 0 || to.indexOf('no-reply') >= 0) {
    console.log("[Skipping reply to 'no reply' address]");
    return Promise.resolve();
  } else {
    console.log("Sending message");
    return new Promise((resolve, reject) => {
      transport.sendMail(message, (error, response) => {
        if (error) {
          reject(error);
        }
        console.log(`Message sent: ${JSON.stringify(response, null, 2)}`);
        resolve();
      });
    });
  }
}


module.exports = {
  sendReply
};
