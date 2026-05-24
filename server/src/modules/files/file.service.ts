import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
import { File } from './file.model.js';
import { Task } from '../../models/Task.js';
import { Project } from '../../models/Project.js';
import { IFile } from './file.types.js';
import { IUser } from '../../types/user.js';
import { getFileTypeFromMime, sanitizeFileName } from './file.utils.js';
import { logEvent } from '../audit/audit.service.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define uploads paths
const UPLOADS_DIR = path.join(__dirname, '../../../../uploads');
const TEMP_DIR = path.join(UPLOADS_DIR, 'temp');

// Ensure storage directories exist
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}
if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR, { recursive: true });
}

// Check Cloudinary variables
const isCloudinaryConfigured = !!(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  console.log('☁️  Cloudinary storage successfully initialized for file uploads.');
} else {
  console.warn(
    '⚠️  Cloudinary variables are missing in .env. Running in Local Storage Fallback Mode!'
  );
}

// Multer temporary storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, TEMP_DIR);
  },
  filename: (req, file, cb) => {
    cb(null, sanitizeFileName(file.originalname));
  },
});

// Multer upload middleware (10MB limit)
export const uploadMiddleware = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

/**
 * Service to process and upload a single file.
 */
export const uploadSingleFile = async (
  fileData: Express.Multer.File,
  user: IUser,
  association: { taskId?: string; projectId?: string; sprintId?: string }
): Promise<IFile> => {
  // Enforce Resource-Level Security Isolation
  if (association.projectId) {
    const project = await Project.findById(association.projectId);
    if (!project) {
      throw new Error('Project workspace not found');
    }
    const activeWorkspaceId = user.currentWorkspace?.toString();
    if (project.workspaceId && project.workspaceId.toString() !== activeWorkspaceId) {
      throw new Error('Access denied. Project belongs to a different workspace context.');
    }
  } else if (association.taskId) {
    const task = await Task.findById(association.taskId).populate('project');
    if (!task) {
      throw new Error('Task not found');
    }
    const project = task.project as any;
    if (project) {
      const activeWorkspaceId = user.currentWorkspace?.toString();
      if (project.workspaceId && project.workspaceId.toString() !== activeWorkspaceId) {
        throw new Error('Access denied. Task project belongs to a different workspace context.');
      }
    }
  }

  const fileType = getFileTypeFromMime(fileData.mimetype, fileData.originalname);
  let fileUrl = '';
  let publicId = '';

  try {
    if (isCloudinaryConfigured) {
      // 1. Upload to Cloudinary
      const uploadResult = await cloudinary.uploader.upload(fileData.path, {
        folder: 'flowsprint_attachments',
        resource_type: 'auto',
      });
      fileUrl = uploadResult.secure_url;
      publicId = uploadResult.public_id;

      // Clean up temporary local file
      fs.unlinkSync(fileData.path);
    } else {
      // 2. Local Fallback - move from temp to permanent uploads folder
      const permPath = path.join(UPLOADS_DIR, fileData.filename);
      fs.renameSync(fileData.path, permPath);
      // Construct a relative path that can be served via static middleware
      fileUrl = `/uploads/${fileData.filename}`;
      publicId = fileData.filename; // Use file name as public ID locally
    }

    // 3. Create File record in DB
    const newFile = await File.create({
      fileName: fileData.filename,
      originalName: fileData.originalname,
      fileUrl,
      fileType,
      size: fileData.size,
      uploadedBy: user._id,
      taskId: association.taskId || undefined,
      projectId: association.projectId || undefined,
      sprintId: association.sprintId || undefined,
      visibility: 'public',
      publicId,
    });

    // Log auditing trail
    await logEvent(user._id.toString(), 'FILE_UPLOADED', 'File', newFile._id.toString(), {
      originalName: newFile.originalName,
      fileType: newFile.fileType,
      size: newFile.size,
    });

    // 4. Update Parent Attachments Array
    if (association.taskId) {
      const task = await Task.findById(association.taskId);
      if (task) {
        task.attachments.push(fileUrl);
        
        // Add activity record
        task.activities.push({
          action: 'updated',
          performedBy: user._id as any,
          details: `Attached file "${fileData.originalname}"`,
          createdAt: new Date(),
        } as any);

        await task.save();
      }
    }

    if (association.projectId) {
      const project = await Project.findById(association.projectId);
      if (project) {
        if (!project.attachments) {
          project.attachments = [];
        }
        project.attachments.push(fileUrl);
        await project.save();
      }
    }

    return newFile;
  } catch (error) {
    // If anything fails, try to clean up the temp file
    if (fs.existsSync(fileData.path)) {
      try {
        fs.unlinkSync(fileData.path);
      } catch (err) {
        // Suppress secondary cleanup errors
      }
    }
    throw error;
  }
};

/**
 * Service to process and upload multiple files.
 */
export const uploadMultipleFiles = async (
  filesData: Express.Multer.File[],
  user: IUser,
  association: { taskId?: string; projectId?: string; sprintId?: string }
): Promise<IFile[]> => {
  const uploadPromises = filesData.map((file) =>
    uploadSingleFile(file, user, association)
  );
  return Promise.all(uploadPromises);
};

/**
 * Retrieves a list of files matching query criteria.
 */
export const getFiles = async (query: { taskId?: string; projectId?: string }) => {
  const filter: any = {};
  if (query.taskId) filter.taskId = query.taskId;
  if (query.projectId) filter.projectId = query.projectId;

  return File.find(filter)
    .populate('uploadedBy', 'name email avatar')
    .sort({ createdAt: -1 });
};

/**
 * Retrieves a single file record by ID.
 */
export const getFileById = async (id: string) => {
  return File.findById(id).populate('uploadedBy', 'name email avatar');
};

/**
 * Deletes a file resource by ID.
 * Enforces ownership controls: only the uploader or admin/manager can delete.
 */
export const deleteFile = async (id: string, user: IUser): Promise<void> => {
  const file = await File.findById(id);
  if (!file) {
    throw new Error('File not found');
  }

  // 1. Ownership & Role check
  const isUploader = file.uploadedBy.toString() === user._id.toString();
  const isPrivileged = user.role === 'admin' || user.role === 'manager';

  if (!isUploader && !isPrivileged) {
    throw new Error('Access denied, you do not have permission to delete this file');
  }

  // 2. Remove asset from physical storage
  if (file.publicId) {
    if (isCloudinaryConfigured) {
      try {
        // Delete from Cloudinary
        await cloudinary.uploader.destroy(file.publicId);
      } catch (err) {
        console.error(`Error deleting Cloudinary asset ${file.publicId}:`, err);
      }
    } else {
      // Local clean up
      const filePath = path.join(UPLOADS_DIR, file.publicId);
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
        } catch (err) {
          console.error(`Error deleting local asset ${file.publicId}:`, err);
        }
      }
    }
  }

  // 3. Remove file reference URL from parent Task
  if (file.taskId) {
    const task = await Task.findById(file.taskId);
    if (task) {
      task.attachments = task.attachments.filter((url) => url !== file.fileUrl);
      
      // Log activity
      task.activities.push({
        action: 'updated',
        performedBy: user._id as any,
        details: `Deleted attachment "${file.originalName}"`,
        createdAt: new Date(),
      } as any);

      await task.save();
    }
  }

  // 4. Remove file reference URL from parent Project
  if (file.projectId) {
    const project = await Project.findById(file.projectId);
    if (project && project.attachments) {
      project.attachments = project.attachments.filter((url) => url !== file.fileUrl);
      await project.save();
    }
  }

  // 5. Delete metadata record from database
  await File.findByIdAndDelete(id);

  // Log auditing trail
  await logEvent(user._id.toString(), 'FILE_DELETED', 'File', file._id.toString(), {
    originalName: file.originalName,
  });
};
