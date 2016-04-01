/*
 * Send an email message
 */

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

function replyToEmail(message) {
  console.log("[Sending message]");
  console.log(JSON.stringify(message, null, 2));
  // transport.sendMail(message, function(error, info){
  //   if (error) {
  //     return console.log(error);
  //   }
  //   console.log(`Message sent: ${info.response}`);
  // });
}

  let body;
  constructReply(incoming)
  .then(outgoing => {
    body = outgoing.body;
    if (outgoing.to) {
      // Send email reply.
      let subject = outgoing.subject;
      let message = {
          from: REPLY_FROM,
          to: outgoing.to,
          // subject: subject,
          text: body
      };
      sendMessage(message);
    }
  //   return loadFile('/');
  // })
  // .then(html => {
  //   // Splice in forecast.
  //   let placeholder = '<!-- Forecast goes here -->';
  //   html = html.replace(placeholder, body);
  //   response.set('Content-Type', 'text/html');
  //   response.send(html);


module.exports = replyToEmail;
