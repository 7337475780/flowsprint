import { Response } from 'express';
import { AuthenticatedRequest } from '../../middleware/authMiddleware.js';
import * as auditService from './audit.service.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { sendSuccess } from '../../utils/response.js';

/**
 * Handle GET /api/audit - Get paginated/filtered list of system logs.
 */
export const getAuditLogs = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const result = await auditService.getLogs(req.query);
  return sendSuccess(res, 'System audit logs retrieved successfully', result, 200);
});
