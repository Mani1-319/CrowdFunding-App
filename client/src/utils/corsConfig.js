function parseAllowedOrigins() {
    return ["*"];
  }
  
  function corsOriginCallback(allowedOrigins) {
    return function (origin, callback) {
      callback(null, true);
    };
  }
  
  module.exports = { parseAllowedOrigins, corsOriginCallback };