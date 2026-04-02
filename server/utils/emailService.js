const nodemailer = require('nodemailer');
require('dotenv').config();

function smtpPassNormalized() {
  return (process.env.SMTP_PASS || '').replace(/\s/g, '');
}

function isRealSmtpConfigured() {
  return (
    process.env.SMTP_HOST &&
    process.env.SMTP_PORT &&
    process.env.SMTP_USER &&
    smtpPassNormalized()
  );
}

const sendEmail = async (to, subject, html) => {
  try {
    if (!isRealSmtpConfigured()) {
      return {
        ok: false,
        error: "SMTP not configured properly in Render environment variables",
      };
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: false, // for port 587
      auth: {
        user: process.env.SMTP_USER,
        pass: smtpPassNormalized(),
      },
    });

    const info = await transporter.sendMail({
      from: `"Donation Platform" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    });

    console.log("EMAIL SENT:", info.messageId);

    return {
      ok: true,
      messageId: info.messageId,
    };
  } catch (error) {
    console.error("EMAIL ERROR:", error.message);
    return {
      ok: false,
      error: error.message,
    };
  }
};

module.exports = { sendEmail };