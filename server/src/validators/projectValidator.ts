import { body, param } from 'express-validator';
import { validateRequest } from './authValidator.js';

/**
 * Validation rules list for creating a new project.
 */
export const createProjectValidator = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Project name is required')
    .isLength({ min: 3 })
    .withMessage('Project name must be at least 3 characters'),
  body('description')
    .optional()
    .isString()
    .withMessage('Description must be a valid string text'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'critical'])
    .withMessage('Invalid priority value. Supported values: low, medium, high, critical'),
  body('status')
    .optional()
    .isIn(['planning', 'active', 'on-hold', 'completed', 'cancelled'])
    .withMessage('Invalid status value. Supported values: planning, active, on-hold, completed, cancelled'),
  body('dueDate')
    .optional()
    .isISO8601()
    .withMessage('Due date must be a valid ISO8601 calendar date string'),
  body('members')
    .optional()
    .isArray()
    .withMessage('Members must be an array of user IDs')
    .custom((value) => {
      if (value && !value.every((id: string) => /^[0-9a-fA-F]{24}$/.test(id))) {
        throw new Error('Every member ID must be a valid 24-character hexadecimal MongoDB ObjectId');
      }
      return true;
    }),
  validateRequest,
];

/**
 * Validation rules list for updating existing project details.
 */
export const updateProjectValidator = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 3 })
    .withMessage('Project name must be at least 3 characters'),
  body('description')
    .optional()
    .isString(),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'critical'])
    .withMessage('Invalid priority level'),
  body('status')
    .optional()
    .isIn(['planning', 'active', 'on-hold', 'completed', 'cancelled'])
    .withMessage('Invalid status level'),
  body('dueDate')
    .optional()
    .isISO8601()
    .withMessage('Due date must be a valid ISO8601 calendar date'),
  body('progress')
    .optional()
    .isInt({ min: 0, max: 100 })
    .withMessage('Progress must be an integer percentage value between 0 and 100'),
  validateRequest,
];

/**
 * Validation parameters list verifying MongoDB project ID inputs.
 */
export const projectIdValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid Project ID parameter format. Must be a valid 24-character Mongo ID'),
  validateRequest,
];
