import { Router } from 'express';
import {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
  getProjectStats,
} from './project.controller.js';
import { protect } from '../../middleware/authMiddleware.js';
import {
  validateCreateProject,
  validateUpdateProject,
} from './project.validation.js';

const router = Router();

// Secure all modular project REST endpoints with authentication
router.use(protect as any);

router.get('/stats/overview', getProjectStats);

router.post('/', validateCreateProject as any, createProject);
router.get('/', getProjects);
router.get('/:id', getProjectById);
router.patch('/:id', validateUpdateProject as any, updateProject);
router.delete('/:id', deleteProject);

export default router;
