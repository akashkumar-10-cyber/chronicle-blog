const rateLimit = require('express-rate-limit');

// Rate limiter for authentication routes (login / register)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // Limit each IP to 30 authentication requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication attempts from this IP. Please try again after 15 minutes.',
  },
});

// Rate limiter for comment submissions to prevent spamming
const commentLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 20, // Limit each IP to 20 comments per minute
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'You are commenting too fast. Please slow down and try again in a minute.',
  },
});

module.exports = { authLimiter, commentLimiter };
