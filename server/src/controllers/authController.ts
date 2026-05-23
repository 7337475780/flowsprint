import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';

/**
 * @route   POST /api/auth/register
 * @desc    Scaffold for creating a user account
 * @access  Public
 */
export const registerUser = asyncHandler(async (req: Request, res: Response) => {
  const { name, email } = req.body;

  // Stub response matching standard API structures
  return res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: {
      user: {
        id: 'mock-user-uuid-101',
        name: name || 'FlowSprint Developer',
        email: email || 'dev@flowsprint.io',
      },
      token: 'mock-jwt-token-string-xyz',
    },
  });
});

/**
 * @route   POST /api/auth/login
 * @desc    Scaffold for authenticating a user
 * @access  Public
 */
export const loginUser = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body;

  // Simulate setting an HTTP-Only secure cookie for session tracking
  res.cookie('token', 'mock-jwt-token-string-xyz', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    sameSite: 'lax',
  });

  return res.status(200).json({
    success: true,
    message: 'User logged in successfully',
    data: {
      user: {
        id: 'mock-user-uuid-101',
        name: 'FlowSprint Developer',
        email: email || 'dev@flowsprint.io',
      },
      token: 'mock-jwt-token-string-xyz',
    },
  });
});

/**
 * @route   GET /api/auth/me
 * @desc    Scaffold for retrieving authenticated user context
 * @access  Private
 */
export const getMe = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id || 'unknown';

  return res.status(200).json({
    success: true,
    message: 'Active profile retrieved successfully',
    data: {
      user: {
        id: userId,
        name: 'FlowSprint Developer',
        email: 'dev@flowsprint.io',
        role: 'Project Manager',
      },
    },
  });
});

/**
 * @route   POST /api/auth/logout
 * @desc    Scaffold for clearing user authentication session
 * @access  Public
 */
export const logoutUser = asyncHandler(async (req: Request, res: Response) => {
  // Clear the cookie session
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  });

  return res.status(200).json({
    success: true,
    message: 'Logged out successfully',
    data: {},
  });
});
