import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

export const createProjectSchema = z.object({
  name: z.string().min(1, 'Project name is required').min(3, 'Must be at least 3 characters'),
  key: z
    .string()
    .min(2, 'Project short key must be at least 2 characters')
    .max(6, 'Project short key cannot exceed 6 characters')
    .regex(/^[A-Za-z0-9]+$/, 'Project short key must be alphanumeric'),
  description: z.string().optional(),
  status: z.enum(['planning', 'active', 'on-hold', 'completed', 'cancelled']).optional(),
  priority: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  startDate: z.string().or(z.date()).optional(),
  dueDate: z.string().or(z.date()).optional(),
  tags: z.array(z.string()).optional(),
});

export const updateProjectSchema = createProjectSchema.partial();

/**
 * Express middleware to validate project creations.
 */
export const validateCreateProject = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const result = createProjectSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: result.error.errors.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
      })),
    });
    return;
  }
  // Standardise body fields with validated schema
  req.body = result.data;
  next();
};

/**
 * Express middleware to validate project updates (partial validations allowed).
 */
export const validateUpdateProject = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const result = updateProjectSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: result.error.errors.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
      })),
    });
    return;
  }
  req.body = result.data;
  next();
};
