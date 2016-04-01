/*
 * Send an email message
 */

'use strict';


let REPLY_FROM = 'MailWeather <5237dc9b94b1dcd5ddd1@cloudmailin.net>';

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


function replyToEmail(originalMessage, reply) {
  let message = {
    from: REPLY_FROM,
    to: originalMessage.from,
    subject: reply.subject,
    text: reply.body
  };
  console.log(`Sending message`);
  console.log(JSON.stringify(message, null, 2));
  return Promise.resolve();
  // transport.sendMail(message, function(error, info){
  //   if (error) {
  //     return console.log(error);
  //   }
  //   console.log(`Message sent: ${info.response}`);
  // });
}


module.exports = replyToEmail;
