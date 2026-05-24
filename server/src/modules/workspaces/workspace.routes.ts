import { Router } from 'express';
import { protect } from '../../middleware/authMiddleware.js';
import * as workspaceController from './workspace.controller.js';
import * as workspaceValidation from './workspace.validation.js';

const router = Router();

// Secure all modular workspace REST endpoints with JWT auth
router.use(protect as any);

router.post('/', workspaceValidation.validateCreateWorkspace, workspaceController.createWorkspace);
router.get('/', workspaceController.getWorkspaces);
router.get('/:id', workspaceController.getWorkspaceById);
router.post('/:id/members', workspaceValidation.validateAddMember, workspaceController.addMemberToWorkspace);
router.post('/:id/switch', workspaceController.switchWorkspace);

export default router;
