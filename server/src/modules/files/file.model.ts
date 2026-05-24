import { Schema, model } from 'mongoose';
import { IFile, FileModel } from './file.types.js';

const fileSchema = new Schema<IFile, FileModel>(
  {
    fileName: {
      type: String,
      required: [true, 'File unique identifier name is required'],
      trim: true,
    },
    originalName: {
      type: String,
      required: [true, 'Original name of the file is required'],
      trim: true,
    },
    fileUrl: {
      type: String,
      required: [true, 'File delivery URL is required'],
      trim: true,
    },
    fileType: {
      type: String,
      enum: {
        values: ['image', 'pdf', 'doc', 'other'],
        message: '{VALUE} is not a valid file type',
      },
      required: [true, 'File category type is required'],
    },
    size: {
      type: Number,
      required: [true, 'File size in bytes is required'],
      min: [0, 'File size cannot be negative'],
    },
    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Uploaded by user reference is required'],
    },
    taskId: {
      type: Schema.Types.ObjectId,
      ref: 'Task',
      index: true, // Enable high-speed queries on task-associated assets
    },
    projectId: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      index: true, // Enable high-speed queries on project-associated assets
    },
    sprintId: {
      type: Schema.Types.ObjectId,
      ref: 'Sprint',
      index: true,
    },
    visibility: {
      type: String,
      enum: ['public', 'private'],
      default: 'public',
    },
    publicId: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound search index for double querying
fileSchema.index({ projectId: 1, taskId: 1 });

export const File = model<IFile, FileModel>('File', fileSchema);
export default File;
