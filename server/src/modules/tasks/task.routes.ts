import { Router } from 'express';
import { protect } from '../../middleware/authMiddleware.js';
import * as taskController from './task.controller.js';
import * as taskValidation from './task.validation.js';

const router = Router();

// Secure all task API endpoints with JWT auth
router.use(protect as any);

/**
 * @route   POST /api/tasks
 * @desc    Create a new task workspace item
 */
router.post('/', taskValidation.validateCreateTask, taskController.createTask);

/**
 * @route   GET /api/tasks
 * @desc    Get paginated, sorted, and filtered tasks
 */
router.get('/', taskController.getTasks);

/**
 * @route   GET /api/tasks/stats/overview
 * @desc    Get task statistics for a project workspace
 */
router.get('/stats/overview', taskController.getTaskStats);
router.get('/stats/:projectId', taskController.getTaskStats);

/**
 * @route   PATCH /api/tasks/reorder
 * @desc    Reorder tasks drag and drop column shifting
 */
router.patch('/reorder', taskValidation.validateReorderTasks, taskController.reorderTasks);

/**
 * @route   GET /api/tasks/:id
 * @desc    Get individual task details
 */
router.get('/:id', taskController.getTaskById);

/**
 * @route   PUT /api/tasks/:id
 * @desc    Update task details (partial)
 */
router.put('/:id', taskValidation.validateUpdateTask, taskController.updateTask);
router.patch('/:id', taskValidation.validateUpdateTask, taskController.updateTask);

/**
 * @route   PATCH /api/tasks/:id/move
 * @desc    Move task status and order
 */
router.patch('/:id/move', taskController.moveTask);

/**
 * @route   PATCH /api/tasks/:id/subtasks/:subtaskId
 * @desc    Toggle a specific subtask checklist item
 */
router.patch('/:id/subtasks/:subtaskId', taskController.toggleSubtask);

/**
 * @route   POST /api/tasks/:id/comments
 * @desc    Add a comment to task discussion logs
 */
router.post('/:id/comments', taskValidation.validateComment, taskController.addComment);

/**
 * @route   DELETE /api/tasks/:id
 * @desc    Remove a task
 */
router.delete('/:id', taskController.deleteTask);

export default router;
