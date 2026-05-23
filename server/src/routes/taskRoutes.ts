import { Router } from 'express';
import {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
} from '../controllers/taskController.js';
import { protect } from '../middleware/authMiddleware.js';
import {
  createTaskValidator,
  updateTaskValidator,
  taskIdValidator,
} from '../validators/taskValidator.js';

const router = Router();

// Secure all task API endpoints with JWT auth
router.use(protect as any);

/**
 * @route   POST /api/tasks
 * @desc    Create a new task in a project
 * @access  Private (Admin / Manager / Project Owner only)
 */
router.post('/', createTaskValidator, createTask);

/**
 * @route   GET /api/tasks
 * @desc    Get paginated and filtered tasks
 * @access  Private
 */
router.get('/', getTasks);

/**
 * @route   GET /api/tasks/:id
 * @desc    Get details of an individual task
 * @access  Private
 */
router.get('/:id', taskIdValidator, getTaskById);

/**
 * @route   PUT /api/tasks/:id
 * @desc    Update task details
 * @access  Private (Owner / Manager / Assignee only)
 */
router.put('/:id', taskIdValidator, updateTaskValidator, updateTask);

/**
 * @route   DELETE /api/tasks/:id
 * @desc    Remove a task
 * @access  Private (Admin / Project Owner / Reporter only)
 */
router.delete('/:id', taskIdValidator, deleteTask);

export default router;
