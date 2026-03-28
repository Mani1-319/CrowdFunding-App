const nodemailer = require('nodemailer');
require('dotenv').config();

const PLACEHOLDER_USERS = new Set(['your.actual.email@gmail.com', '', undefined]);
const PLACEHOLDER_PASSES = new Set(['your_16_digit_app_password', '', undefined]);

function smtpPassNormalized() {
  return (process.env.SMTP_PASS || '').replace(/\s/g, '');
}


function isRealSmtpConfigured() {
  const u = process.env.SMTP_USER;
  const p = smtpPassNormalized();
  return u && p && !PLACEHOLDER_USERS.has(u) && !PLACEHOLDER_PASSES.has(process.env.SMTP_PASS);
}

/**
 * Sends mail to `to` using SMTP from env.
 * @returns {Promise<{ ok: boolean, error?: string, messageId?: string, previewUrl?: string }>}
 */
const sendEmail = async (to, subject, html) => {
  try {
    const useEthereal = process.env.USE_ETHEREAL_MAIL === 'true';

    if (!useEthereal && !isRealSmtpConfigured()) {
      return {
        ok: false,
        error:
          'SMTP is not configured. Set SMTP_USER and SMTP_PASS in server/.env (Gmail: use an App Password, not your normal login password).',
      };
    }

    let transporter;
    let previewUrl;

    if (useEthereal) {
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
    } else {
      const smtpPort = Number(process.env.SMTP_PORT || 465);
      const smtpSecure = smtpPort === 465;
      transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: smtpPort,
        secure: smtpSecure,
        auth: {
          user: process.env.SMTP_USER,
          pass: smtpPassNormalized(),
        },
        tls: {
          minVersion: 'TLSv1.2',
        },
      });
    }

    const fromAddr = useEthereal ? '"Donation Platform" <test@donte.com>' : `"Donation Platform" <${process.env.SMTP_USER}>`;

    const info = await transporter.sendMail({
      from: fromAddr,
      to,
      subject,
      html,
    });

    if (useEthereal) {
      previewUrl = nodemailer.getTestMessageUrl(info);
      console.log('Ethereal preview URL (not delivered to real inbox):', previewUrl);
    } else {
      console.log('Email sent to %s, messageId=%s', to, info.messageId);
    }

    return { ok: true, messageId: info.messageId, previewUrl };
  } catch (error) {
    const msg = error && error.message ? error.message : String(error);
    console.error('sendEmail failed:', msg);
    return { ok: false, error: msg };
  }
};

module.exports = { sendEmail, isRealSmtpConfigured };
