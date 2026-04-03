require('dotenv').config();
const nodemailer = require('nodemailer');

async function testEmail() {
  console.log("Loading .env variables...");
  console.log("SMTP_HOST:", process.env.SMTP_HOST);
  console.log("SMTP_PORT:", process.env.SMTP_PORT);
  console.log("SMTP_USER:", process.env.SMTP_USER);
  
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS.replace(/\s/g, '')
    },
    connectionTimeout: 5000,
  });

  try {
    console.log("Attempting to connect to Google Servers...");
    const info = await transporter.sendMail({
      from: `"Test" <${process.env.SMTP_USER}>`,
      to: process.env.SMTP_USER,
      subject: 'Google Verification Test',
      text: 'Testing if Google accepts the credentials.'
    });
    console.log("\n==================================");
    console.log("SUCCESS! Google Accepted it!");
    console.log("Message ID:", info.messageId);
    console.log("==================================\n");
  } catch (err) {
    console.log("\n==================================");
    console.log("ERROR REJECTED BY GOOGLE:");
    console.error(err.message);
    console.log("==================================\n");
  }
}

testEmail();
