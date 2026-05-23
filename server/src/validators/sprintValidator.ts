import { body, param } from 'express-validator';
import { validateRequest } from './authValidator.js';

/**
 * Validation rules for creating a new sprint.
 */
export const createSprintValidator = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Sprint name is required')
    .isLength({ min: 3 })
    .withMessage('Sprint name must be at least 3 characters'),
  body('project')
    .notEmpty()
    .withMessage('Project reference ID is required')
    .isMongoId()
    .withMessage('Invalid Project ID format'),
  body('goal')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Sprint goal cannot exceed 500 characters'),
  body('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid ISO8601 calendar date'),
  body('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid ISO8601 calendar date'),
  body('tasks')
    .optional()
    .isArray()
    .withMessage('Tasks must be an array of task IDs'),
  body('tasks.*')
    .optional()
    .isMongoId()
    .withMessage('Each task ID must be a valid MongoDB ObjectId'),
  body('members')
    .optional()
    .isArray()
    .withMessage('Members must be an array of user IDs'),
  body('members.*')
    .optional()
    .isMongoId()
    .withMessage('Each member ID must be a valid MongoDB ObjectId'),
  validateRequest,
];

/**
 * Validation rules for partially updating an existing sprint.
 */
export const updateSprintValidator = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 3 })
    .withMessage('Sprint name must be at least 3 characters'),
  body('goal')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Sprint goal cannot exceed 500 characters'),
  body('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid ISO8601 calendar date'),
  body('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid ISO8601 calendar date'),
  body('tasks')
    .optional()
    .isArray()
    .withMessage('Tasks must be an array of task IDs'),
  body('tasks.*')
    .optional()
    .isMongoId()
    .withMessage('Each task ID must be a valid MongoDB ObjectId'),
  body('members')
    .optional()
    .isArray()
    .withMessage('Members must be an array of user IDs'),
  body('members.*')
    .optional()
    .isMongoId()
    .withMessage('Each member ID must be a valid MongoDB ObjectId'),
  body('retrospective')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Retrospective notes cannot exceed 2000 characters'),
  body('isArchived')
    .optional()
    .isBoolean()
    .withMessage('isArchived must be a boolean value'),
  validateRequest,
];

/**
 * Validates individual sprint ID from route params.
 */
export const sprintIdValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid Sprint ID format. Must be a valid 24-character Mongo ID'),
  validateRequest,
];
