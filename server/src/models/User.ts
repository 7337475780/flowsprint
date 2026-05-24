import { Schema, model } from 'mongoose';
import bcrypt from 'bcryptjs';
import { IUser, IUserMethods, UserModel } from '../types/user.js';

// 1. Define the Mongoose Schema
const userSchema = new Schema<IUser, UserModel, IUserMethods>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      select: false, // Ensures password is hidden in standard queries by default
    },
    role: {
      type: String,
      enum: {
        values: ['admin', 'manager', 'member'],
        message: '{VALUE} is not a supported role',
      },
      default: 'member',
    },
    avatar: {
      type: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    bio: {
      type: String,
      trim: true,
      default: '',
    },
    preferences: {
      theme: {
        type: String,
        enum: ['light', 'dark'],
        default: 'dark', // Elite developer startup theme default
      },
      emailNotifications: {
        type: Boolean,
        default: true,
      },
      taskAlerts: {
        type: Boolean,
        default: true,
      },
      sprintAlerts: {
        type: Boolean,
        default: true,
      },
      mentionAlerts: {
        type: Boolean,
        default: true,
      },
    },
    lastLogin: {
      type: Date,
    },
    activeSessions: [
      {
        token: {
          type: String,
          required: true,
        },
        device: {
          type: String,
          default: 'Unknown Device',
        },
        ip: {
          type: String,
          default: '127.0.0.1',
        },
        lastActive: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    workspaces: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Workspace',
      },
    ],
    currentWorkspace: {
      type: Schema.Types.ObjectId,
      ref: 'Workspace',
    },
  },
  {
    timestamps: true, // Automatically manages createdAt and updatedAt
  }
);

// 2. Hash Password Pre-Save Hook
userSchema.pre('save', async function (next) {
  // Only hash password if it was modified (or is new)
  if (!this.isModified('password')) {
    return next();
  }

  try {
    const rawPassword = this.password as string;
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await (bcrypt.hash(rawPassword, salt) as Promise<string>);
    this.password = hashedPassword;
    next();
  } catch (err: any) {
    next(err);
  }
});

// 3. Instance Methods
userSchema.method('comparePassword', async function (enteredPassword) {
  // Because password has select: false, this.password might not be present if not explicitly selected.
  // We handle comparing safely against empty passwords or selected passwords.
  if (!this.password) return false;
  return bcrypt.compare(enteredPassword, this.password);
});

// 4. Create and Export User Model
export const User = model<IUser, UserModel>('User', userSchema);
