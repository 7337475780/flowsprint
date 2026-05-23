import { Request, Response, NextFunction } from 'express';

/**
 * Custom operational error class for mapping status codes and structured payloads.
 */
export class CustomError extends Error {
  public statusCode: number;

  constructor(message: string, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/**
 * Centralized global Express error handler middleware.
 */
export const errorMiddleware = (
  err: any,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
): void => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Something went wrong';

  // Log to console if not running tests
  if (process.env.NODE_ENV !== 'test') {
    console.error(`[Error Boundary] ${req.method} ${req.path} -> ${statusCode}: ${message}`);
    if (err.stack && process.env.NODE_ENV === 'development') {
      console.error(err.stack);
    }
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};
