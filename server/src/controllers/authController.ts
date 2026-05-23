import { Request, Response } from 'express';
import { User } from '../models/User.js';
import { generateToken } from '../utils/generateToken.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { 
  BadRequestError, 
  UnauthorizedError, 
  NotFoundError 
} from '../utils/errors.js';

/**
 * Helper to strip password and return a safe user payload.
 */
const formatSafeUser = (user: any) => {
  const userObj = user.toObject ? user.toObject() : user;
  delete userObj.password;
  return userObj;
};

/**
 * @route   POST /api/auth/register
 * @desc    Register a new workspace user
 * @access  Public
 */
export const registerUser = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password, role } = req.body;

  // 1. Check if email is already taken
  const userExists = await User.findOne({ email });
  if (userExists) {
    throw new BadRequestError('A user with this email address already exists');
  }

  // 2. Create the user document (pre-save hook hashes password)
  const user = await User.create({
    name,
    email,
    password,
    role: role || 'member', // Default to member role
  });

  // 3. Generate signed authentication token
  const token = generateToken(user._id.toString(), user.role);

  // 4. Set HTTP-Only Cookie session
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
    sameSite: 'lax',
  });

  // 5. Send standardized successful response
  return res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: {
      user: formatSafeUser(user),
      token,
    },
  });
});

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user and create session token
 * @access  Public
 */
export const loginUser = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  // 1. Fetch user including password explicitly (select: false in schema)
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    throw new UnauthorizedError('Invalid email or password credentials');
  }

  // 2. Compare hashed password
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new UnauthorizedError('Invalid email or password credentials');
  }

  // 3. Verify user is active
  if (!user.isActive) {
    throw new UnauthorizedError('Your user account has been deactivated. Please contact support.');
  }

  // 4. Generate token
  const token = generateToken(user._id.toString(), user.role);

  // 5. Set session cookie
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    sameSite: 'lax',
  });

  return res.status(200).json({
    success: true,
    message: 'Login successful',
    data: {
      user: formatSafeUser(user),
      token,
    },
  });
});

/**
 * @route   GET /api/auth/me
 * @desc    Retrieve active session user profile
 * @access  Private
 */
export const getMe = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user || !req.user.id) {
    throw new UnauthorizedError('Not authorized, credentials context is missing');
  }

  // Fetch from DB to ensure it matches current state (and has latest details)
  const user = await User.findById(req.user.id);
  if (!user) {
    throw new NotFoundError('User profile could not be found');
  }

  return res.status(200).json({
    success: true,
    message: 'Active profile retrieved successfully',
    data: {
      user: formatSafeUser(user),
    },
  });
});

/**
 * @route   POST /api/auth/logout
 * @desc    Clear session cookies and revoke active access
 * @access  Public
 */
export const logoutUser = asyncHandler(async (req: Request, res: Response) => {
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
