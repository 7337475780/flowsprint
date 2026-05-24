import { Document, Schema, Model } from 'mongoose';

export type FileType = 'image' | 'pdf' | 'doc' | 'other';
export type FileVisibility = 'public' | 'private';

export interface IFile extends Document {
  fileName: string;
  originalName: string;
  fileUrl: string;
  fileType: FileType;
  size: number; // bytes
  uploadedBy: Schema.Types.ObjectId;
  taskId?: Schema.Types.ObjectId;
  projectId?: Schema.Types.ObjectId;
  sprintId?: Schema.Types.ObjectId;
  visibility: FileVisibility;
  publicId?: string; // Cloudinary public identifier for deletion
  createdAt: Date;
  updatedAt: Date;
}

export type FileModel = Model<IFile>;
