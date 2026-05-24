import { Response } from 'express';
import { AuthenticatedRequest } from '../../middleware/authMiddleware.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import * as userService from './user.service.js';

/**
 * Retrieves the currently authenticated user details.
 */
export const getProfile = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const profile = userService.toSafeUser(req.user!);
  
  res.status(200).json({
    success: true,
    message: 'Profile retrieved successfully',
    data: profile,
  });
});

/**
 * Updates basic user details (name, bio, avatar).
 */
export const updateProfile = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!._id.toString();
  const updatedUser = await userService.updateProfile(userId, req.body);

  res.status(200).json({
    success: true,
    message: 'User profile updated successfully',
    data: updatedUser,
  });
});

/**
 * Updates notification triggers and interface theme preferences.
 */
export const updatePreferences = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!._id.toString();
  const updatedUser = await userService.updatePreferences(userId, req.body);

  res.status(200).json({
    success: true,
    message: 'User preferences updated successfully',
    data: updatedUser,
  });
});

/**
 * Safely changes password verifying credentials.
 */
export const changePassword = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!._id.toString();
  
  // Extract active token context to keep current session alive
  let currentToken = '';
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    currentToken = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.token) {
    currentToken = req.cookies.token;
  }

  try {
    const updatedUser = await userService.changePassword(userId, req.body, currentToken);
    res.status(200).json({
      success: true,
      message: 'Password changed successfully',
      data: updatedUser,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to change password',
    });
  }
});

/**
 * Revokes all session listings logging user out on all other devices.
 */
export const logoutAllDevices = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!._id.toString();

  await userService.logoutAllDevices(userId);

  // Clear cookie of current session too as requested
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  });

  res.status(200).json({
    success: true,
    message: 'All devices successfully logged out',
  });
});
