import { Router } from 'express';
import {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
  moveTask,
  reorderTasks as reorderTask,
  addComment,
  editComment,
  deleteComment,
} from '../controllers/taskController.js';
import { protect } from '../middleware/authMiddleware.js';
import {
  createTaskValidator,
  updateTaskValidator,
  taskIdValidator,
  reorderTaskValidator,
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
router.patch('/:id', taskIdValidator, updateTaskValidator, updateTask);

/**
 * @route   PATCH /api/tasks/reorder
 * @desc    Reorder tasks drag and drop column shifting
 * @access  Private (Owner/Manager/Assignee only)
 */
router.patch('/reorder', reorderTaskValidator, reorderTask);

/**
 * @route   PATCH /api/tasks/:id/move
 * @desc    Move task status and order
 * @access  Private (Owner/Manager/Assignee only)
 */
router.patch('/:id/move', taskIdValidator, moveTask);

/**
 * @route   POST /api/tasks/:id/comments
 * @desc    Add a comment to the task discussion thread
 * @access  Private
 */
router.post('/:id/comments', taskIdValidator, addComment);

/**
 * @route   PUT /api/tasks/:id/comments/:commentId
 * @desc    Modify an existing task comment
 * @access  Private (Comment author only)
 */
router.put('/:id/comments/:commentId', taskIdValidator, editComment);

/**
 * @route   DELETE /api/tasks/:id/comments/:commentId
 * @desc    Delete a comment from the discussion thread
 * @access  Private (Comment author/Project owner/Admin only)
 */
router.delete('/:id/comments/:commentId', taskIdValidator, deleteComment);

/**
 * @route   DELETE /api/tasks/:id
 * @desc    Remove a task
 * @access  Private (Admin / Project Owner / Reporter only)
 */
router.delete('/:id', taskIdValidator, deleteTask);

export default router;
