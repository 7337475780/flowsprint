import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

const createSprintObjectSchema = z.object({
  name: z.string().min(1, 'Sprint name is required').min(3, 'Sprint name must be at least 3 characters'),
  goal: z.string().max(500, 'Sprint goal cannot exceed 500 characters').optional().nullable(),
  projectId: z.string().regex(objectIdRegex, 'Invalid Project ID reference'),
  startDate: z.preprocess((val) => (val === '' ? null : val), z.string().or(z.date()).optional().nullable()),
  endDate: z.preprocess((val) => (val === '' ? null : val), z.string().or(z.date()).optional().nullable()),
  members: z.array(z.string().regex(objectIdRegex)).optional().default([]),
  tasks: z.array(z.string().regex(objectIdRegex)).optional().default([]),
});

export const createSprintSchema = createSprintObjectSchema.refine(
  (data) => {
    if (data.startDate && data.endDate) {
      return new Date(data.endDate) > new Date(data.startDate);
    }
    return true;
  },
  {
    message: 'Sprint end date must be after the start date',
    path: ['endDate'],
  }
);

const updateSprintObjectSchema = createSprintObjectSchema.partial().extend({
  retrospective: z.string().max(2000, 'Retrospective notes cannot exceed 2000 characters').optional().nullable(),
  archived: z.boolean().optional(),
});

export const updateSprintSchema = updateSprintObjectSchema.refine(
  (data) => {
    if (data.startDate && data.endDate) {
      return new Date(data.endDate) > new Date(data.startDate);
    }
    return true;
  },
  {
    message: 'Sprint end date must be after the start date',
    path: ['endDate'],
  }
);

// ─── Middleware Validators ───────────────────────────────────────────────────

export const validateCreateSprint = (req: Request, res: Response, next: NextFunction): void => {
  // Allow compatibility with client-side 'project' parameter
  if (req.body.project && !req.body.projectId) {
    req.body.projectId = req.body.project;
  }

  const result = createSprintSchema.safeParse(req.body);
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

export const validateUpdateSprint = (req: Request, res: Response, next: NextFunction): void => {
  // Allow compatibility with client-side 'project' parameter
  if (req.body.project && !req.body.projectId) {
    req.body.projectId = req.body.project;
  }

  const result = updateSprintSchema.safeParse(req.body);
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
