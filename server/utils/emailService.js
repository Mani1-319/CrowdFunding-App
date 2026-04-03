const fetch = require('node-fetch'); // or native fetch if Node 18+
require('dotenv').config();

const sendEmail = async (to, subject, html) => {
  try {
    const apiKey = process.env.BREVO_API_KEY;
    
    if (!apiKey) {
      return {
        ok: false,
        error: "BREVO_API_KEY is not configured in environment variables",
      };
    }

    // Use native fetch (Node 18+) or install node-fetch if on older versions
    // By default, modern Node has global 'fetch'
    const response = await globalThis.fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'api-key': apiKey
      },
      body: JSON.stringify({
        sender: { 
          name: "Donte Platform", 
          email: process.env.SMTP_USER || "noreply@donte.com" 
        },
        to: [{ email: to }],
        subject: subject,
        htmlContent: html
      })
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      console.error("BREVO API ERROR:", data);
      return {
        ok: false,
        error: data.message || `HTTP Error ${response.status}`,
      };
    }

    console.log("EMAIL SENT VIA BREVO Web API:", data.messageId);

    return {
      ok: true,
      messageId: data.messageId,
    };
  } catch (error) {
    console.error("EMAIL CRITICAL ERROR:", error.message);
    return {
      ok: false,
      error: error.message,
    };
  }
};

module.exports = { sendEmail };