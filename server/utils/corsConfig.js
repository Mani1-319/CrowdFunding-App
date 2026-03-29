/**
 * Origins allowed for CORS + Socket.io when the SPA is on Netlify (or elsewhere)
 * and the API is on Render.
 *
 * Set in Render (and local .env):
 *   CLIENT_ORIGIN=https://your-app.netlify.app
 * Or multiple:
 *   CLIENT_ORIGINS=https://app.netlify.app,http://localhost:5173
 */
function parseAllowedOrigins() {
  const raw =
    process.env.CLIENT_ORIGINS ||
    process.env.CLIENT_ORIGIN ||
    process.env.FRONTEND_URL ||
    '';
  if (!raw.trim()) {
    if (process.env.NODE_ENV === 'production') {
      console.warn(
        '[cors] CLIENT_ORIGIN (or CLIENT_ORIGINS) is not set — browser requests from your Netlify URL may be blocked. Set CLIENT_ORIGIN in Render.'
      );
      return [];
    }
    return ['http://localhost:5173', 'http://127.0.0.1:5173'];
  }
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

function corsOriginCallback(allowedList) {
  return (origin, callback) => {
    if (!origin) {
      return callback(null, true);
    }
    if (allowedList.length === 0) {
      return callback(new Error('CORS: no allowed origins configured'));
    }
    if (allowedList.includes(origin)) {
      return callback(null, true);
    }
    callback(new Error('Not allowed by CORS'));
  };
}

module.exports = { parseAllowedOrigins, corsOriginCallback };
