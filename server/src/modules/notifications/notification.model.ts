import { Schema, model, Document } from 'mongoose';

export interface INotification extends Document {
  recipient: Schema.Types.ObjectId;
  sender?: Schema.Types.ObjectId;
  type: 'task_assigned' | 'task_moved' | 'sprint_started' | 'comment_mention';
  title: string;
  message: string;
  read: boolean;
  link?: string;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    recipient: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Recipient userId reference is required'],
      index: true,
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    type: {
      type: String,
      enum: ['task_assigned', 'task_moved', 'sprint_started', 'comment_mention'],
      required: [true, 'Notification type category is required'],
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
    read: {
      type: Boolean,
      default: false,
    },
    link: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Notification = model<INotification>('Notification', notificationSchema);
