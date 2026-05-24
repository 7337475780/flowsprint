import { Document, Schema, Model } from 'mongoose';

/**
 * Main Project interface representing Mongoose Document fields.
 */
export interface IProject extends Document {
  name: string;
  key: string;
  slug: string;
  description?: string;
  status: 'planning' | 'active' | 'on-hold' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'critical';
  startDate?: Date;
  dueDate?: Date;
  owner: Schema.Types.ObjectId;
  members: Schema.Types.ObjectId[];
  tags: string[];
  progress: number;
  isArchived: boolean;
  attachments?: string[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Project Model type representation.
 */
export type ProjectModel = Model<IProject>;
