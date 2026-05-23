import { Schema, model } from 'mongoose';
import { IProject, ProjectModel } from '../types/project.js';

// 1. Define Mongoose Project Schema
const projectSchema = new Schema<IProject, ProjectModel>(
  {
    name: {
      type: String,
      required: [true, 'Project name is required'],
      trim: true,
    },
    key: {
      type: String,
      required: [true, 'Project short key is required'],
      uppercase: true,
      unique: true,
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
    status: {
      type: String,
      enum: {
        values: ['planning', 'active', 'on-hold', 'completed', 'cancelled'],
        message: '{VALUE} is not a valid project status',
      },
      default: 'planning',
    },
    priority: {
      type: String,
      enum: {
        values: ['low', 'medium', 'high', 'critical'],
        message: '{VALUE} is not a valid project priority',
      },
      default: 'medium',
    },
    startDate: {
      type: Date,
    },
    dueDate: {
      type: Date,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Project owner reference is required'],
    },
    members: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    progress: {
      type: Number,
      default: 0,
      min: [0, 'Progress percentage cannot be below 0'],
      max: [100, 'Progress percentage cannot exceed 100'],
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true, // Automatically manages createdAt and updatedAt
  }
);

// 2. Pre-Save Slugify Hook
projectSchema.pre('save', async function (next) {
  // Only trigger if name is new or modified
  if (!this.isModified('name')) {
    return next();
  }

  try {
    // Generate simple readable slug
    let baseSlug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric chars with dashes
      .replace(/(^-|-$)+/g, '');    // Trim trailing/leading dashes

    if (!baseSlug) {
      baseSlug = 'project';
    }

    // Guard slug uniqueness against collision
    const slugCollision = await model('Project').findOne({ slug: baseSlug });
    if (slugCollision) {
      // Append a short random alphanumeric suffix
      baseSlug = `${baseSlug}-${Math.random().toString(36).substring(2, 6)}`;
    }

    this.slug = baseSlug;
    next();
  } catch (error: any) {
    next(error);
  }
});

// 3. Define text indexes for text searches
projectSchema.index({ name: 'text', key: 'text', tags: 'text' });

// 4. Export Project Model
export const Project = model<IProject, ProjectModel>('Project', projectSchema);
