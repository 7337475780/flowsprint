import { Router } from 'express';
import { protect } from '../../middleware/authMiddleware.js';
import { requireRole } from '../../middleware/rbac.middleware.js';
import { getAuditLogs } from './audit.controller.js';

const router = Router();

// Secure all endpoints with authentication and admin privilege validation
router.use(protect as any);
router.use(requireRole('admin') as any);

router.get('/', getAuditLogs);

export default router;
