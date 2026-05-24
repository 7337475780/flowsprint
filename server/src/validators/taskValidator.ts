import { body, param } from 'express-validator';
import { validateRequest } from './authValidator.js';

/**
 * Validation rules list for creating a new task.
 */
export const createTaskValidator = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Task title is required')
    .isLength({ min: 3 })
    .withMessage('Task title must be at least 3 characters'),
  body('project')
    .notEmpty()
    .withMessage('Project reference ID is required')
    .isMongoId()
    .withMessage('Invalid Project ID parameter format'),
  body('assignee')
    .optional()
    .isMongoId()
    .withMessage('Invalid Assignee ID parameter format'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'critical'])
    .withMessage('Invalid priority level. Supported: low, medium, high, critical'),
  body('dueDate')
    .optional()
    .isISO8601()
    .withMessage('Due date must be a valid ISO8601 calendar date'),
  body('labels')
    .optional()
    .isArray()
    .withMessage('Labels must be an array of strings'),
  validateRequest,
];

/**
 * Validation rules for reordering a task.
 */
export const reorderTaskValidator = [
  body('reorders')
    .isArray({ min: 1 })
    .withMessage('Reorders must be a non-empty array'),
  body('reorders.*.taskId')
    .notEmpty()
    .withMessage('Each reorder must contain a taskId')
    .isMongoId()
    .withMessage('taskId must be a valid Mongo ID'),
  body('reorders.*.status')
    .notEmpty()
    .isIn(['backlog', 'todo', 'in-progress', 'review', 'done'])
    .withMessage('status must be one of backlog, todo, in-progress, review, done'),
  body('reorders.*.order')
    .isNumeric()
    .withMessage('order must be a number'),
  validateRequest,
];


/**
 * Validation rules list for updating existing task parameters.
 */
export const updateTaskValidator = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 3 })
    .withMessage('Task title must be at least 3 characters'),
  body('assignee')
    .optional()
    .custom((val) => {
      if (val !== null && !/^[0-9a-fA-F]{24}$/.test(val)) {
        throw new Error('Assignee must be a valid 24-character hexadecimal MongoDB ObjectId or null');
      }
      return true;
    }),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'critical'])
    .withMessage('Invalid priority level'),
  body('dueDate')
    .optional()
    .isISO8601()
    .withMessage('Due date must be a valid ISO8601 calendar date'),
  body('estimatedHours')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Estimated hours must be a number equal to or greater than 0'),
  body('actualHours')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Actual hours must be a number equal to or greater than 0'),
  validateRequest,
];

/**
 * Validation parameter checking individual task Mongo ID formats.
 */
export const taskIdValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid Task ID parameter format. Must be a valid 24-character Mongo ID'),
  validateRequest,
];
