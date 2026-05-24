import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

export const updateProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name cannot exceed 100 characters').optional(),
  bio: z.string().max(1000, 'Bio description cannot exceed 1000 characters').optional(),
  avatar: z.string().url('Avatar URL must be a valid resource address').or(z.string().regex(/^\/uploads\//)).optional().nullable(),
});

export const changePasswordSchema = z.object({
  oldPassword: z.string().min(1, 'Current security password is required'),
  newPassword: z
    .string()
    .min(8, 'New password must be at least 8 characters')
    .regex(/[A-Z]/, 'New password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'New password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'New password must contain at least one numerical digit'),
});

export const updatePreferencesSchema = z.object({
  theme: z.enum(['light', 'dark']).optional(),
  emailNotifications: z.boolean().optional(),
  taskAlerts: z.boolean().optional(),
  sprintAlerts: z.boolean().optional(),
  mentionAlerts: z.boolean().optional(),
});

// ─── Middleware Validation Hooks ───────────────────────────────────────────

export const validateUpdateProfile = (req: Request, res: Response, next: NextFunction): void => {
  const result = updateProfileSchema.safeParse(req.body);
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

export const validateChangePassword = (req: Request, res: Response, next: NextFunction): void => {
  const result = changePasswordSchema.safeParse(req.body);
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

export const validateUpdatePreferences = (req: Request, res: Response, next: NextFunction): void => {
  const result = updatePreferencesSchema.safeParse(req.body);
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
