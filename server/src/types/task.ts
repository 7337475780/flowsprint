import { Document, Schema, Model } from 'mongoose';

/**
 * Interface representing a task comment.
 */
export interface IComment {
  _id: string;
  author: Schema.Types.ObjectId;
  text: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Interface representing lightweight task activity actions.
 */
export interface IActivity {
  _id: string;
  action: 'created' | 'assigned' | 'moved' | 'commented' | 'updated' | 'archived';
  performedBy: Schema.Types.ObjectId;
  details?: string;
  createdAt: Date;
}

/**
 * Main Task interface representing Mongoose Document fields.
 */
export interface ITask extends Document {
  title: string;
  slug: string;
  description?: string;
  project: Schema.Types.ObjectId;
  assignee?: Schema.Types.ObjectId;
  reporter: Schema.Types.ObjectId;
  status: 'backlog' | 'todo' | 'in-progress' | 'review' | 'done';
  priority: 'low' | 'medium' | 'high' | 'critical';
  labels: string[];
  dueDate?: Date;
  estimatedHours?: number;
  actualHours?: number;
  order: number;
  attachments: string[];
  isArchived: boolean;
  comments: IComment[];
  activities: IActivity[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Task Model type representation.
 */
export type TaskModel = Model<ITask>;
