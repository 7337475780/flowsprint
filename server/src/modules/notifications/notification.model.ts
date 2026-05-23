import { Schema, model } from 'mongoose';
import { INotification } from './notification.types.js';

const notificationSchema = new Schema<INotification>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Recipient userId reference is required'],
      index: true,
    },
    type: {
      type: String,
      enum: [
        'task_assigned',
        'task_updated',
        'task_moved',
        'sprint_started',
        'sprint_completed',
        'mention',
        'comment_added',
        'system_alert',
      ],
      required: [true, 'Notification category type is required'],
    },
    title: {
      type: String,
      required: [true, 'Notification headline title is required'],
      trim: true,
    },
    message: {
      type: String,
      required: [true, 'Notification payload detail message is required'],
      trim: true,
    },
    entityType: {
      type: String,
      enum: ['task', 'sprint', 'project', 'comment'],
    },
    entityId: {
      type: Schema.Types.ObjectId,
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical', 'urgent'],
      default: 'medium',
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for optimal querying of user inbox lists and instant unread count badges
notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, createdAt: -1 });

export const Notification = model<INotification>('Notification', notificationSchema);
