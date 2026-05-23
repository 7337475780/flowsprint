import { Notification, INotification } from './notification.model.js';
import { emitNotification } from '../../sockets/index.js';
import { NotFoundError } from '../../utils/errors.js';

/**
 * 1. Create a notification and dispatch it live via sockets.
 */
export const createNotification = async (payload: {
  recipient: string;
  sender?: string;
  type: INotification['type'];
  title: string;
  message: string;
  link?: string;
}): Promise<INotification> => {
  const notification = new Notification(payload);
  const saved = await notification.save();
  
  // Populate sender for display details
  const populated = await saved.populate('sender', 'name email avatar');

  // Push live socket alert to user personal room
  emitNotification(payload.recipient, populated);

  return populated;
};

/**
 * 2. Get all read & unread notifications for a user, sorted newest first.
 */
export const getNotifications = async (userId: string): Promise<INotification[]> => {
  return await Notification.find({ recipient: userId })
    .populate('sender', 'name email avatar')
    .sort({ createdAt: -1 })
    .limit(100);
};

/**
 * 3. Mark single notification as read.
 */
export const markAsRead = async (id: string, userId: string): Promise<INotification> => {
  const notification = await Notification.findOne({ _id: id, recipient: userId });
  if (!notification) {
    throw new NotFoundError('Notification item not found');
  }

  notification.read = true;
  return await notification.save();
};

/**
 * 4. Mark all unread notifications as read.
 */
export const markAllAsRead = async (userId: string): Promise<void> => {
  await Notification.updateMany({ recipient: userId, read: false }, { read: true });
};
