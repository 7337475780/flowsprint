import { Schema, model } from 'mongoose';
import { IWorkspace, WorkspaceModel } from '../types/workspace.js';

// Define the Workspace Mongoose Schema
const workspaceSchema = new Schema<IWorkspace, WorkspaceModel>(
  {
    name: {
      type: String,
      required: [true, 'Workspace name is required'],
      trim: true,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Workspace owner reference is required'],
    },
    members: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    timestamps: true, // Automatically manages createdAt and updatedAt
  }
);

// High-speed index on members and owner
workspaceSchema.index({ owner: 1 });
workspaceSchema.index({ members: 1 });

export const Workspace = model<IWorkspace, WorkspaceModel>('Workspace', workspaceSchema);
export default Workspace;
