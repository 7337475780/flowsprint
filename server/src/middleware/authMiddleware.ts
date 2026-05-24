import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { IUser } from '../types/user.js';

// Extend the Express Request interface with typed user property
export interface AuthenticatedRequest extends Request {
  user?: IUser;
}

/**
 * Route protection middleware to authenticate users via JWT.
 * Verifies Bearer tokens and cookie contexts, fetching the matching DB profile.
 */
export const protect = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  let token: string | undefined;

  // 1. Check Bearer Authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }
  // 2. Check Cookie session fallback
  else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    res.status(401).json({
      success: false,
      message: 'Not authorized, access token is missing',
    });
    return;
  }

  try {
    // Verify token payload
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || process.env.JWT_ACCESS_SECRET || 'dev_jwt_secret_flowsprint_token'
    ) as { id: string };

    // Fetch matching user from database excluding hashed password
    const user = await User.findById(decoded.id);

    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Not authorized, user profile could not be found',
      });
      return;
    }

    if (!user.isActive) {
      res.status(401).json({
        success: false,
        message: 'Not authorized, user account is currently deactivated',
      });
      return;
    }

    // Attach typed user document directly to Express Request
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Not authorized, invalid or expired credentials token',
    });
  }
};

/**
 * Role-guard middleware restricting access to specific workspace privileges.
 * Supports multi-role configurations (e.g. authorize('admin', 'manager')).
 */
export const authorize = (...roles: Array<'admin' | 'manager' | 'member'>) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Not authorized, credentials context is missing',
      });
      return;
    }

    // Block request if the user's role is not within the authorized parameter array
    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: `Access denied, permission level forbidden for ${req.user.role} role`,
      });
      return;
    }

    next();
  };
};
