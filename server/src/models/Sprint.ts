import { Schema, model } from 'mongoose';
import { ISprint, SprintModel } from '../types/sprint.js';

// Define Mongoose Sprint Schema
const sprintSchema = new Schema<ISprint, SprintModel>(
  {
    name: {
      type: String,
      required: [true, 'Sprint name is required'],
      trim: true,
    },
    goal: {
      type: String,
      trim: true,
    },
    project: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'Project reference is required'],
    },
    projectId: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
    },
    tasks: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Task',
      },
    ],
    startDate: {
      type: Date,
    },
    endDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: {
        values: ['planned', 'active', 'completed', 'cancelled'],
        message: '{VALUE} is not a valid sprint status',
      },
      default: 'planned',
    },
    plannedPoints: {
      type: Number,
      default: 0,
      min: [0, 'Planned points cannot be negative'],
    },
    completedPoints: {
      type: Number,
      default: 0,
      min: [0, 'Completed points cannot be negative'],
    },
    velocity: {
      type: Number,
      default: 0,
      min: [0, 'Velocity ratio cannot be negative'],
    },
    progress: {
      type: Number,
      default: 0,
      min: [0, 'Progress percentage cannot be below 0'],
      max: [100, 'Progress percentage cannot exceed 100'],
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Sprint owner reference is required'],
    },
    members: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    retrospective: {
      type: String,
      trim: true,
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
    archived: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true, // Automatically manages createdAt and updatedAt
  }
);

// Pre-save Compatibility Hook
sprintSchema.pre('save', function (next) {
  if (this.projectId && !this.project) {
    this.project = this.projectId;
  } else if (this.project && !this.projectId) {
    this.projectId = this.project;
  }

  if (this.archived !== undefined) {
    this.isArchived = this.archived;
  } else if (this.isArchived !== undefined) {
    this.archived = this.isArchived;
  }

  next();
});

// Compounded index on project and status for fast search and aggregation
sprintSchema.index({ project: 1, status: 1 });

// Export the Mongoose Sprint Model
export const Sprint = model<ISprint, SprintModel>('Sprint', sprintSchema);
