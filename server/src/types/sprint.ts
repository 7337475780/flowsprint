import { Document, Schema, Model } from 'mongoose';

/**
 * Interface representing Mongoose Sprint Document fields.
 */
export interface ISprint extends Document {
  name: string;
  goal?: string;
  project: Schema.Types.ObjectId;
  tasks: Schema.Types.ObjectId[];
  startDate?: Date;
  endDate?: Date;
  status: 'planned' | 'active' | 'completed' | 'cancelled';
  plannedPoints: number;
  completedPoints: number;
  velocity: number;
  progress: number;
  owner: Schema.Types.ObjectId;
  members: Schema.Types.ObjectId[];
  retrospective?: string;
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Sprint Model type representation.
 */
export type SprintModel = Model<ISprint>;
