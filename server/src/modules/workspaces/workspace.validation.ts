import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

export const createWorkspaceSchema = z.object({
  name: z.string().min(3, 'Workspace name must be at least 3 characters long').max(100, 'Workspace name cannot exceed 100 characters'),
});

export const addMemberSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

export const validateCreateWorkspace = (req: Request, res: Response, next: NextFunction): void => {
  const result = createWorkspaceSchema.safeParse(req.body);
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

export const validateAddMember = (req: Request, res: Response, next: NextFunction): void => {
  const result = addMemberSchema.safeParse(req.body);
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
