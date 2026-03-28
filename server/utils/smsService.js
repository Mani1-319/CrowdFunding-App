/**
 * SMS OTP — requires Twilio (or similar) in production.
 * Without credentials, SMS is not sent; see server/.env.example.
 */
require('dotenv').config();

const normalizePhoneDigits = (phone) => String(phone || '').replace(/\D/g, '');

/**
 * @returns {Promise<{ ok: boolean, error?: string }>}
 */
async function sendSmsOtp(phoneDigits, otp) {
  const to = normalizePhoneDigits(phoneDigits);
  if (to.length < 10) {
    return { ok: false, error: 'Invalid phone number' };
  }

  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_PHONE_NUMBER;

  const body = `Your Donte verification code is ${otp}. Valid for 10 minutes.`;

  if (sid && token && from) {
    try {
      // Lazy-load so project works without twilio installed until needed
      const twilio = require('twilio')(sid, token);
      const e164 = to.startsWith('91') && to.length === 12 ? `+${to}` : to.length === 10 ? `+91${to}` : `+${to}`;
      await twilio.messages.create({ body, from, to: e164 });
      return { ok: true };
    } catch (e) {
      console.error('Twilio SMS error:', e.message);
      return { ok: false, error: e.message };
    }
  }

  if (process.env.SMS_LOG_OTP === 'true') {
    console.log('[SMS dev / no Twilio] OTP for', to, '→', otp);
  }

  return {
    ok: false,
    error:
      'SMS is not configured. Add TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER to server/.env, or set SMS_LOG_OTP=true to log OTP in the server console during development.',
  };
}

module.exports = { sendSmsOtp, normalizePhoneDigits };
