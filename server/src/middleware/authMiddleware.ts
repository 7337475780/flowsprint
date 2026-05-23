import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Extend Request type to include the authenticated user context
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    [key: string]: any;
  };
}

/**
 * Route protection middleware to authenticate users via JWT.
 * Inspects Authorization Header (Bearer token) and Cookie fallbacks.
 */
export const protect = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  let token: string | undefined;

  // 1. Parse from Bearer Authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }
  // 2. Parse from Cookies fallback
  else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    res.status(401).json({
      success: false,
      message: 'Not authorized, credentials token missing',
    });
    return;
  }

  try {
    // Verify token using JWT secret
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'dev_jwt_secret_flowsprint_token'
    ) as { id: string };

    // Attach minimal user metadata context for downstream controllers
    req.user = { id: decoded.id };
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Not authorized, credentials token is invalid or expired',
    });
  }
};
