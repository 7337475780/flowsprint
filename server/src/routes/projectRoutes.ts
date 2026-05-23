import { Router } from 'express';
import {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
  manageProjectMembers,
} from '../controllers/projectController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import {
  createProjectValidator,
  updateProjectValidator,
  projectIdValidator,
} from '../validators/projectValidator.js';

const router = Router();

// All projects routes require authentication
router.use(protect as any);

/**
 * @route   POST /api/projects
 * @desc    Create a new project workspace
 * @access  Private (Admin / Manager only)
 */
router.post(
  '/',
  authorize('admin', 'manager') as any,
  createProjectValidator,
  createProject
);

/**
 * @route   GET /api/projects
 * @desc    Get paginated and filtered projects
 * @access  Private (Admins/Managers see all; Members see assigned)
 */
router.get('/', getProjects);

/**
 * @route   GET /api/projects/:id
 * @desc    Get individual project details
 * @access  Private (Admins/Managers see all; Members see assigned)
 */
router.get('/:id', projectIdValidator, getProjectById);

/**
 * @route   PUT /api/projects/:id
 * @desc    Update project variables
 * @access  Private (Owner / Admin / Manager only)
 */
router.put(
  '/:id',
  projectIdValidator,
  updateProjectValidator,
  updateProject
);

/**
 * @route   DELETE /api/projects/:id
 * @desc    Remove a project workspace
 * @access  Private (Owner / Admin only)
 */
router.delete('/:id', projectIdValidator, deleteProject);

/**
 * @route   PATCH /api/projects/:id/members
 * @desc    Assign or unassign teammates from project arrays
 * @access  Private (Owner / Admin / Manager only)
 */
router.patch('/:id/members', projectIdValidator, manageProjectMembers);

export default router;
