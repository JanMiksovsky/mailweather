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
  let message = {
    from: REPLY_FROM,
    to: originalMessage.from,
    subject: reply.subject,
    text: reply.body
  };
  console.log(JSON.stringify(message, null, 2));
  if (process.env.SEND_MESSAGE === 'false') {
    console.log("(Skipped sending message)");
    return Promise.resolve();
  } else {
    console.log("Sending message");
    return new Promise((resolve, reject) => {
      transport.sendMail(message, (error, info) => {
        if (error) {
          reject(error);
        }
        console.log(`Message sent: ${info.response}`);
        resolve();
      });
    });
  }
}


module.exports = {
  sendReply
};
