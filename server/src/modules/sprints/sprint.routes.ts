import { Router } from 'express';
import * as sprintController from './sprint.controller.js';
import * as sprintValidation from './sprint.validation.js';
import { protect } from '../../middleware/authMiddleware.js';

const router = Router();

// Secure all sprint endpoints under JWT auth
router.use(protect as any);

/**
 * @route   POST /api/sprints
 * @desc    Plan a new sprint
 */
router.post('/', sprintValidation.validateCreateSprint, sprintController.createSprint);

/**
 * @route   GET /api/sprints
 * @desc    Filter and search sprints
 */
router.get('/', sprintController.getSprints);

/**
 * @route   GET /api/sprints/:id
 * @desc    Get detailed sprint with stats
 */
router.get('/:id', sprintController.getSprintById);

/**
 * @route   PUT /api/sprints/:id & PATCH /api/sprints/:id
 * @desc    Update sprint fields (partial)
 */
router.put('/:id', sprintValidation.validateUpdateSprint, sprintController.updateSprint);
router.patch('/:id', sprintValidation.validateUpdateSprint, sprintController.updateSprint);

/**
 * @route   DELETE /api/sprints/:id
 * @desc    Hard remove a planned sprint
 */
router.delete('/:id', sprintController.deleteSprint);

// ---- Agile Sprints Lifecycle ----

/**
 * @route   PATCH /api/sprints/:id/start
 * @desc    Transition sprint from planned to active
 */
router.patch('/:id/start', sprintController.startSprint);

/**
 * @route   PATCH /api/sprints/:id/end & PATCH /api/sprints/:id/complete
 * @desc    Close active sprint and run Velocity Engine calculation
 */
router.patch('/:id/end', sprintController.endSprint);
router.patch('/:id/complete', sprintController.endSprint);

/**
 * @route   PATCH /api/sprints/:id/cancel
 * @desc    Cancel an active or planned sprint
 */
router.patch('/:id/cancel', sprintController.cancelSprint);

// ---- Backlog Assignment ----

/**
 * @route   PATCH /api/sprints/:id/tasks
 * @desc    Bulk add/remove tasks inside a sprint bin
 */
router.patch('/:id/tasks', sprintController.manageSprintTasks);

// ---- Charts & Reports ----

/**
 * @route   GET /api/sprints/:id/burndown
 * @desc    Fetch burndown charting dataset
 */
router.get('/:id/burndown', sprintController.getSprintBurndown);

/**
 * @route   GET /api/sprints/:id/analytics
 * @desc    Retrieve detailed performance metrics report
 */
router.get('/:id/analytics', sprintController.getSprintAnalytics);

export default router;
