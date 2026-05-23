import { Router } from 'express';
import {
  createSprint,
  getSprints,
  getSprintById,
  updateSprint,
  deleteSprint,
  startSprint,
  endSprint,
  cancelSprint,
  manageSprintTasks,
  getSprintBurndown,
  getSprintAnalytics,
} from '../controllers/sprintController.js';
import { protect } from '../middleware/authMiddleware.js';
import {
  createSprintValidator,
  updateSprintValidator,
  sprintIdValidator,
} from '../validators/sprintValidator.js';

const router = Router();

// All sprint endpoints require JWT authentication
router.use(protect as any);

/**
 * @route   POST /api/sprints
 * @desc    Create a new planned sprint
 */
router.post('/', createSprintValidator, createSprint);

/**
 * @route   GET /api/sprints
 * @desc    Get paginated and filtered sprints
 */
router.get('/', getSprints);

/**
 * @route   GET /api/sprints/:id
 * @desc    Get sprint details with live stats
 */
router.get('/:id', sprintIdValidator, getSprintById);

/**
 * @route   PUT /api/sprints/:id
 * @desc    Update sprint fields
 */
router.put('/:id', sprintIdValidator, updateSprintValidator, updateSprint);

/**
 * @route   DELETE /api/sprints/:id
 * @desc    Remove a sprint
 */
router.delete('/:id', sprintIdValidator, deleteSprint);

// ---- Lifecycle ----

/**
 * @route   PATCH /api/sprints/:id/start
 * @desc    Start a planned sprint
 */
router.patch('/:id/start', sprintIdValidator, startSprint);

/**
 * @route   PATCH /api/sprints/:id/end
 * @desc    End an active sprint and compute velocity
 */
router.patch('/:id/end', sprintIdValidator, endSprint);

/**
 * @route   PATCH /api/sprints/:id/cancel
 * @desc    Cancel a sprint
 */
router.patch('/:id/cancel', sprintIdValidator, cancelSprint);

// ---- Task Assignment ----

/**
 * @route   PATCH /api/sprints/:id/tasks
 * @desc    Add or remove tasks from a sprint
 */
router.patch('/:id/tasks', sprintIdValidator, manageSprintTasks);

// ---- Data & Analytics ----

/**
 * @route   GET /api/sprints/:id/burndown
 * @desc    Fetch chart-ready daily burndown data
 */
router.get('/:id/burndown', sprintIdValidator, getSprintBurndown);

/**
 * @route   GET /api/sprints/:id/analytics
 * @desc    Per-sprint analytics report
 */
router.get('/:id/analytics', sprintIdValidator, getSprintAnalytics);

export default router;
