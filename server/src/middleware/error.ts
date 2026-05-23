import { Request, Response, NextFunction } from 'express';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';
import { AppError } from '../utils/errors.js';
import { sendError } from '../utils/response.js';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let errors: any = undefined;

  // Log error internally
  logger.error(`${req.method} ${req.originalUrl} - ${message}`, err);

  // Handle specific Zod validation errors
  if (err.name === 'ZodError') {
    statusCode = 400;
    message = 'Validation failed';
    errors = err.errors.map((e: any) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
  }

  // Handle MongoDB cast error (invalid ObjectId)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid value for field: ${err.path}`;
  }

  // Handle MongoDB duplicate key error
  if (err.code === 11000) {
    statusCode = 400;
    const duplicatedKey = Object.keys(err.keyValue)[0];
    message = `A record with this ${duplicatedKey} already exists.`;
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid credentials token. Please log in again.';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Credentials token expired. Please log in again.';
  }

  // In development mode, include raw stack trace or original error details
  const errorPayload = env.NODE_ENV === 'development' 
    ? { 
        originalMessage: err.message, 
        stack: err.stack, 
        details: errors 
      }
    : errors;

  sendError(res, message, errorPayload, statusCode);
};
