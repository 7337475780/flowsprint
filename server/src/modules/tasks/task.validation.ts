import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

export const createTaskSchema = z.object({
  title: z.string().min(1, 'Task title is required').max(150, 'Title cannot exceed 150 characters'),
  description: z.string().optional(),
  projectId: z.string().regex(objectIdRegex, 'Invalid Project ID reference'),
  sprintId: z.string().regex(objectIdRegex, 'Invalid Sprint ID reference').optional().nullable(),
  assignee: z.string().regex(objectIdRegex, 'Invalid Assignee ID reference').optional().nullable(),
  priority: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
  status: z.enum(['backlog', 'todo', 'in-progress', 'review', 'done']).default('backlog'),
  dueDate: z.string().or(z.date()).optional().nullable(),
  labels: z.array(z.string()).optional().default([]),
  estimatedHours: z.number().min(0, 'Estimated hours cannot be negative').optional(),
  spentHours: z.number().min(0, 'Spent hours cannot be negative').optional(),
  storyPoints: z.number().min(0, 'Story points cannot be negative').optional(),
});

export const updateTaskSchema = createTaskSchema.partial().extend({
  archived: z.boolean().optional(),
  position: z.number().optional(),
});

export const reorderTasksSchema = z.object({
  status: z.enum(['backlog', 'todo', 'in-progress', 'review', 'done']),
  position: z.number().min(0, 'Position must be a positive rank'),
});

export const commentSchema = z.object({
  text: z.string().min(1, 'Comment text cannot be empty').max(2000, 'Comment text cannot exceed 2000 characters'),
});

// ─── Middleware Validators ───────────────────────────────────────────────────

export const validateCreateTask = (req: Request, res: Response, next: NextFunction): void => {
  const result = createTaskSchema.safeParse(req.body);
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

export const validateUpdateTask = (req: Request, res: Response, next: NextFunction): void => {
  const result = updateTaskSchema.safeParse(req.body);
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

export const validateReorderTasks = (req: Request, res: Response, next: NextFunction): void => {
  console.log("REORDER PAYLOAD:", req.body);
  const { reorders } = req.body;
  if (!reorders || !Array.isArray(reorders)) {
    res.status(400).json({ message: "Invalid reorder payload" });
    return;
  }
  for (const item of reorders) {
    if (!item || !item.taskId || typeof item.order !== 'number') {
      res.status(400).json({ message: "Invalid reorder payload" });
      return;
    }
  }
  next();
};

export const validateComment = (req: Request, res: Response, next: NextFunction): void => {
  const result = commentSchema.safeParse(req.body);
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
