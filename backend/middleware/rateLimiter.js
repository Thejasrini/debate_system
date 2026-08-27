import rateLimit from "express-rate-limit";

/**
 * Global rate limiter — max 60 requests per minute per IP
 */
export const globalRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 60,
  message: { error: "Global rate limit exceeded. Please wait before sending more requests." },
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * Debate API rate limiter — max 5 SSE debate queries per minute per IP
 */
export const debateRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 5,
  message: { error: "Too many debate queries submitted. Please wait 60 seconds before filing another case." },
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * Auth rate limiter — max 20 auth attempts per 15 minutes per IP
 */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: "Too many authentication attempts. Please try again after 15 minutes." },
  standardHeaders: true,
  legacyHeaders: false
});
