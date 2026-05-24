import { Router } from 'express';
import { protect } from '../../middleware/authMiddleware.js';
import * as userController from './user.controller.js';
import * as userValidation from './user.validation.js';

const router = Router();

// Secure all user API endpoints with JWT auth
router.use(protect as any);

/**
 * @route   GET /api/users/me
 * @desc    Get active authenticated user profile details
 * @access  Private
 */
router.get('/me', userController.getProfile);

/**
 * @route   PATCH /api/users/me
 * @desc    Update basic profile details (name, bio, avatar)
 * @access  Private
 */
router.patch('/me', userValidation.validateUpdateProfile, userController.updateProfile);

/**
 * @route   PATCH /api/users/change-password
 * @desc    Verify current password and establish a new one
 * @access  Private
 */
router.patch('/change-password', userValidation.validateChangePassword, userController.changePassword);

/**
 * @route   PATCH /api/users/preferences
 * @desc    Modify display settings and notification preferences
 * @access  Private
 */
router.patch('/preferences', userValidation.validateUpdatePreferences, userController.updatePreferences);

/**
 * @route   POST /api/users/logout-all
 * @desc    Invalidate and clear session arrays on all active devices
 * @access  Private
 */
router.post('/logout-all', userController.logoutAllDevices);

export default router;
