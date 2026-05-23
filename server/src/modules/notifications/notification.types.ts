import { Document, Schema } from 'mongoose';

export type NotificationType =
  | 'task_assigned'
  | 'task_updated'
  | 'task_moved'
  | 'sprint_started'
  | 'sprint_completed'
  | 'mention'
  | 'comment_added'
  | 'system_alert';

export type EntityType = 'task' | 'sprint' | 'project' | 'comment';
export type NotificationPriority = 'low' | 'medium' | 'high' | 'critical' | 'urgent';

export interface INotification extends Document {
  userId: Schema.Types.ObjectId;
  type: NotificationType;
  title: string;
  message: string;
  entityType?: EntityType;
  entityId?: Schema.Types.ObjectId;
  isRead: boolean;
  priority: NotificationPriority;
  createdBy?: Schema.Types.ObjectId;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}
