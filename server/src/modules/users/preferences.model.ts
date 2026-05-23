import { Schema, model, Document } from 'mongoose';

export interface INotificationPreference extends Document {
  userId: Schema.Types.ObjectId;
  emailNotifications: boolean;
  inAppNotifications: boolean;
  mentionAlerts: boolean;
  taskUpdates: boolean;
  sprintUpdates: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const notificationPreferenceSchema = new Schema<INotificationPreference>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required for preferences'],
      unique: true,
      index: true,
    },
    emailNotifications: {
      type: Boolean,
      default: true,
    },
    inAppNotifications: {
      type: Boolean,
      default: true,
    },
    mentionAlerts: {
      type: Boolean,
      default: true,
    },
    taskUpdates: {
      type: Boolean,
      default: true,
    },
    sprintUpdates: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export const NotificationPreference = model<INotificationPreference>(
  'NotificationPreference',
  notificationPreferenceSchema
);
