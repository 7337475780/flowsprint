import { Schema, model } from 'mongoose';
import { ITask, TaskModel } from '../types/task.js';

// 1. Embedded Comment Schema
const commentSchema = new Schema(
  {
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    text: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true, // Manages comment level createdAt and updatedAt
  }
);

// 2. Embedded Activity Schema
const activitySchema = new Schema(
  {
    action: {
      type: String,
      enum: ['created', 'assigned', 'moved', 'commented', 'updated', 'archived'],
      required: true,
    },
    performedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    details: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false }, // Only need timestamp for when activity occurred
  }
);

// 3. Embedded Subtask Schema
const subtaskSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, 'Subtask title is required'],
      trim: true,
    },
    completed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// 4. Define Mongoose Task Schema
const taskSchema = new Schema<ITask, TaskModel>(
  {
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
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
    sprintId: {
      type: Schema.Types.ObjectId,
      ref: 'Sprint',
    },
    assignee: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    reporter: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Task reporter reference is required'],
    },
    status: {
      type: String,
      enum: {
        values: ['backlog', 'todo', 'in-progress', 'review', 'done'],
        message: '{VALUE} is not a valid task status',
      },
      default: 'backlog',
    },
    priority: {
      type: String,
      enum: {
        values: ['low', 'medium', 'high', 'critical'],
        message: '{VALUE} is not a valid task priority',
      },
      default: 'medium',
    },
    labels: [
      {
        type: String,
        trim: true,
      },
    ],
    dueDate: {
      type: Date,
    },
    estimatedHours: {
      type: Number,
      min: 0,
    },
    actualHours: {
      type: Number,
      min: 0,
    },
    spentHours: {
      type: Number,
      min: 0,
      default: 0,
    },
    storyPoints: {
      type: Number,
      min: [0, 'Story points cannot be negative'],
      default: 0,
    },
    order: {
      type: Number,
      required: true,
      default: 0,
    },
    position: {
      type: Number,
      required: true,
      default: 0,
    },
    attachments: [
      {
        type: String,
        trim: true,
      },
    ],
    isArchived: {
      type: Boolean,
      default: false,
    },
    archived: {
      type: Boolean,
      default: false,
    },
    subtasks: [subtaskSchema],
    comments: [commentSchema],
    activities: [activitySchema],
  },
  {
    timestamps: true,
  }
);

// 5. Pre-Save Compatibility Hook
taskSchema.pre('save', function (next) {
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

  if (this.position !== undefined) {
    this.order = this.position;
  } else if (this.order !== undefined) {
    this.position = this.order;
  }

  next();
});

// 6. Pre-Save Slugify Hook
taskSchema.pre('save', async function (next) {
  // Only trigger if title is new or modified
  if (!this.isModified('title')) {
    return next();
  }

  try {
    // Generate simple readable slug
    let baseSlug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    if (!baseSlug) {
      baseSlug = 'task';
    }

    // Guard slug uniqueness against collision
    const slugCollision = await model('Task').findOne({ slug: baseSlug });
    if (slugCollision) {
      baseSlug = `${baseSlug}-${Math.random().toString(36).substring(2, 6)}`;
    }

    this.slug = baseSlug;
    next();
  } catch (error: any) {
    next(error);
  }
});

// 7. Export Task Model
export const Task = model<ITask, TaskModel>('Task', taskSchema);
