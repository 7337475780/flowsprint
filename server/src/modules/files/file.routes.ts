import { Router } from 'express';
import { protect } from '../../middleware/authMiddleware.js';
import * as fileController from './file.controller.js';
import { uploadMiddleware } from './file.service.js';

import { uploadLimiter } from '../../middleware/rateLimiter.js';

const router = Router();

// Secure all file API endpoints with JWT auth
router.use(protect as any);

/**
 * @route   POST /api/files/upload
 * @desc    Upload single or multiple files and attach to tasks or projects
 * @access  Private
 */
router.post('/upload', uploadLimiter as any, uploadMiddleware.any(), fileController.uploadFiles);

/**
 * @route   GET /api/files
 * @desc    Get files list matching optional filters like taskId or projectId
 * @access  Private
 */
router.get('/', fileController.getFiles);

/**
 * @route   GET /api/files/:id
 * @desc    Retrieve detailed metadata for a file record
 * @access  Private
 */
router.get('/:id', fileController.getFileById);

/**
 * @route   DELETE /api/files/:id
 * @desc    Delete a file attachment from storage and DB
 * @access  Private
 */
router.delete('/:id', fileController.deleteFile);

export default router;
