import { Document, Model, Types } from 'mongoose';

/**
 * Main Workspace interface representing Mongoose Document fields.
 */
export interface IWorkspace extends Document {
  name: string;
  owner: Types.ObjectId;
  members: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Workspace Model type binding.
 */
export type WorkspaceModel = Model<IWorkspace>;
