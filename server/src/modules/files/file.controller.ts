import { Response } from 'express';
import { AuthenticatedRequest } from '../../middleware/authMiddleware.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import * as fileService from './file.service.js';

/**
 * Handles single or multiple file uploads, attaching them to a task, project, or sprint.
 */
export const uploadFiles = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { taskId, projectId, sprintId } = req.body;
  const user = req.user!;

  if (!req.file && (!req.files || (req.files as Express.Multer.File[]).length === 0)) {
    res.status(400).json({
      success: false,
      message: 'No files were uploaded. Please provide a file or file array.',
    });
    return;
  }

  const association = { taskId, projectId, sprintId };

  if (req.file) {
    // Single file upload case
    const uploadedFile = await fileService.uploadSingleFile(req.file, user, association);
    res.status(201).json({
      success: true,
      message: 'File uploaded successfully',
      data: [uploadedFile],
    });
  } else if (req.files) {
    // Multiple files upload case
    const filesArray = req.files as Express.Multer.File[];
    const uploadedFiles = await fileService.uploadMultipleFiles(filesArray, user, association);
    res.status(201).json({
      success: true,
      message: `${uploadedFiles.length} files uploaded successfully`,
      data: uploadedFiles,
    });
  }
});

/**
 * Retrieves list of files, optionally filtered by task or project context.
 */
export const getFiles = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const taskId = req.query.taskId as string;
  const projectId = req.query.projectId as string;

  const files = await fileService.getFiles({ taskId, projectId });
  
  res.status(200).json({
    success: true,
    message: 'Files retrieved successfully',
    data: files,
  });
});

/**
 * Retrieves an individual file metadata record by ID.
 */
export const getFileById = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const file = await fileService.getFileById(req.params.id);

  if (!file) {
    res.status(404).json({
      success: false,
      message: 'File not found',
    });
    return;
  }

  res.status(200).json({
    success: true,
    message: 'File details retrieved successfully',
    data: file,
  });
});

/**
 * Deletes a file, removing it from storage and parent lists.
 */
export const deleteFile = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  try {
    await fileService.deleteFile(req.params.id, req.user!);
    res.status(200).json({
      success: true,
      message: 'Attachment deleted successfully',
    });
  } catch (error: any) {
    res.status(error.message.includes('denied') ? 403 : 400).json({
      success: false,
      message: error.message || 'Failed to delete file attachment',
    });
  }
});
