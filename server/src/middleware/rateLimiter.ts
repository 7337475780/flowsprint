import { rateLimit } from 'express-rate-limit';

/**
 * Global API Rate Limiter
 * Restricts standard endpoints to maximum 100 requests per minute per IP.
 */
export const globalLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  limit: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: 'draft-7', // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after a minute.',
  },
});

/**
 * Authentication Brute-Force Rate Limiter
 * Restricts login attempts to maximum 5 attempts per 15 minutes per IP.
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 5, // Limit each IP to 5 requests per windowMs
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many login attempts from this IP, please try again after 15 minutes.',
  },
});

/**
 * File Upload Rate Limiter
 * Restricts uploads to 20 requests per minute per IP to prevent Denial of Service.
 */
export const uploadLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  limit: 20, // Limit each IP to 20 uploads per windowMs
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    success: false,
    message: 'File upload rate limit exceeded. Please try again after a minute.',
  },
});
