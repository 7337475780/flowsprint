import { Router } from 'express';
import {
  registerUser,
  loginUser,
  getMe,
  logoutUser,
} from '../controllers/authController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import {
  registerValidator,
  loginValidator,
} from '../validators/authValidator.js';

const router = Router();

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user account with validations
 * @access  Public
 */
router.post('/register', registerValidator, registerUser);

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user, assign session cookie & returns safe user details
 * @access  Public
 */
router.post('/login', loginValidator, loginUser);

/**
 * @route   GET /api/auth/me
 * @desc    Retrieve active session user profile (Protected)
 * @access  Private
 */
router.get('/me', protect as any, getMe);

/**
 * @route   GET /api/auth/admin-only
 * @desc    Workspace admin diagnostic endpoint (Protected & Restricted)
 * @access  Private (Admin Only)
 */
router.get('/admin-only', protect as any, authorize('admin') as any, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to the Admin workspace, privileges authorized.',
    data: {},
  });
});

/**
 * @route   POST /api/auth/logout
 * @desc    Clear session cookies and revoke active access
 * @access  Public
 */
router.post('/logout', logoutUser);

export default router;
