import { Notification } from './notification.model.js';
import { INotification } from './notification.types.js';
import { NotificationPreference } from '../users/preferences.model.js';
import { emitNotification, getIO } from '../../sockets/index.js';
import { NotFoundError } from '../../utils/errors.js';

/**
 * Helper to fetch or default a user's notification preferences
 */
export const getPreferences = async (userId: string) => {
  let prefs = await NotificationPreference.findOne({ userId });
  if (!prefs) {
    // Return standard defaults if preferences are not configured yet
    prefs = new NotificationPreference({
      userId,
      emailNotifications: true,
      inAppNotifications: true,
      mentionAlerts: true,
      taskUpdates: true,
      sprintUpdates: true,
    });
  }
  return prefs;
};

/**
 * Optional email dispatcher stub layer.
 * Logs to server output. Ready to plug in Nodemailer, SendGrid, etc.
 */
export const sendEmailNotification = async (payload: {
  userId: string;
  type: string;
  title: string;
  message: string;
}) => {
  console.log(`
=========================================
📧 EMAIL DISPATCH SYSTEM (STUB TRIGGERED)
=========================================
To User ID  : ${payload.userId}
Category    : ${payload.type}
Headline    : ${payload.title}
Body Message: ${payload.message}
=========================================
  `);
};

/**
 * Enforces inboxes stay under a maximum count (1000) and deletes old logs (older than 30 days).
 */
export const cleanupNotifications = async (userId: string): Promise<void> => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // 1. Delete notifications older than 30 days
    await Notification.deleteMany({
      userId,
      createdAt: { $lt: thirtyDaysAgo },
    });

    // 2. Enforce the user's max notification count limit (last 1000)
    const totalCount = await Notification.countDocuments({ userId });
    const maxLimit = 1000;
    if (totalCount > maxLimit) {
      const excessDocs = await Notification.find({ userId })
        .sort({ createdAt: -1 })
        .skip(maxLimit)
        .select('_id');
      
      if (excessDocs.length > 0) {
        const idsToDelete = excessDocs.map((doc) => doc._id);
        await Notification.deleteMany({ _id: { $in: idsToDelete } });
      }
    }
  } catch (error) {
    console.error(`❌ Background notification cleanup failed for user ${userId}:`, error);
  }
};

/**
 * 1. Create a notification and dispatch it live via sockets.
 */
export const createNotification = async (payload: {
  userId: string;
  type: INotification['type'];
  title: string;
  message: string;
  entityType?: INotification['entityType'];
  entityId?: string;
  priority?: INotification['priority'];
  createdBy?: string;
  metadata?: Record<string, any>;
}): Promise<INotification | null> => {
  const prefs = await getPreferences(payload.userId);

  // Filter based on user preferences
  if (!prefs.inAppNotifications) return null;
  if (payload.type === 'mention' && !prefs.mentionAlerts) return null;
  if (
    ['task_assigned', 'task_updated', 'task_moved', 'comment_added'].includes(payload.type) &&
    !prefs.taskUpdates
  ) {
    return null;
  }
  if (
    ['sprint_started', 'sprint_completed'].includes(payload.type) &&
    !prefs.sprintUpdates
  ) {
    return null;
  }

  const notification = new Notification({
    ...payload,
    isRead: false,
  });

  const saved = await notification.save();
  const populated = await saved.populate('createdBy', 'name email avatar');

  // Push live socket alert to the user's personal channel
  emitNotification(payload.userId, populated);

  // Trigger stub email if email notifications are enabled for core events
  if (
    prefs.emailNotifications &&
    ['mention', 'task_assigned', 'sprint_started'].includes(payload.type)
  ) {
    sendEmailNotification({
      userId: payload.userId,
      type: payload.type,
      title: payload.title,
      message: payload.message,
    }).catch(console.error);
  }

  // Asynchronously clean up old inbox history in the background without blocking the request
  cleanupNotifications(payload.userId).catch(console.error);

  return populated;
};

/**
 * 2. Create multiple notifications efficiently (e.g. notifying all team members on sprint actions).
 */
export const bulkCreateNotification = async (
  payloads: Array<{
    userId: string;
    type: INotification['type'];
    title: string;
    message: string;
    entityType?: INotification['entityType'];
    entityId?: string;
    priority?: INotification['priority'];
    createdBy?: string;
    metadata?: Record<string, any>;
  }>
): Promise<INotification[]> => {
  if (payloads.length === 0) return [];

  // Extract distinct users
  const userIds = Array.from(new Set(payloads.map((p) => p.userId)));

  // Load preferences of all matching users in parallel
  const preferenceMap = new Map<string, any>();
  const dbPrefs = await NotificationPreference.find({ userId: { $in: userIds } });
  for (const pref of dbPrefs) {
    preferenceMap.set(pref.userId.toString(), pref);
  }

  const filteredPayloads = payloads.filter((payload) => {
    const prefs = preferenceMap.get(payload.userId) || {
      inAppNotifications: true,
      mentionAlerts: true,
      taskUpdates: true,
      sprintUpdates: true,
    };

    if (!prefs.inAppNotifications) return false;
    if (payload.type === 'mention' && !prefs.mentionAlerts) return false;
    if (
      ['task_assigned', 'task_updated', 'task_moved', 'comment_added'].includes(payload.type) &&
      !prefs.taskUpdates
    ) {
      return false;
    }
    if (
      ['sprint_started', 'sprint_completed'].includes(payload.type) &&
      !prefs.sprintUpdates
    ) {
      return false;
    }
    return true;
  });

  if (filteredPayloads.length === 0) return [];

  // Batch insert items in a single query
  const insertedDocs = await Notification.insertMany(filteredPayloads, { ordered: false });

  // Parallelize populating and emitting to sockets for fast real-time notifications
  Promise.all(
    insertedDocs.map(async (doc) => {
      const populated = await doc.populate('createdBy', 'name email avatar');
      
      // Dispatch socket alert
      emitNotification(doc.userId.toString(), populated);

      // Try sending email if requested
      const prefs = preferenceMap.get(doc.userId.toString()) || { emailNotifications: true };
      if (
        prefs.emailNotifications &&
        ['mention', 'task_assigned', 'sprint_started'].includes(doc.type)
      ) {
        sendEmailNotification({
          userId: doc.userId.toString(),
          type: doc.type,
          title: doc.title,
          message: doc.message,
        }).catch(console.error);
      }
    })
  ).catch(console.error);

  // Background trigger cleanups
  userIds.forEach((uid) => cleanupNotifications(uid).catch(console.error));

  return insertedDocs;
};

/**
 * 3. Retrieve paginated, filterable notifications for a user.
 */
export const getUserNotifications = async (
  userId: string,
  query: {
    page?: number;
    limit?: number;
    unreadOnly?: boolean;
    type?: INotification['type'];
  }
): Promise<{
  notifications: INotification[];
  total: number;
  page: number;
  pages: number;
  unreadCount: number;
}> => {
  const page = query.page || 1;
  const limit = query.limit || 20;
  const skip = (page - 1) * limit;

  const filter: any = { userId };
  
  if (query.unreadOnly) {
    filter.isRead = false;
  }
  if (query.type) {
    filter.type = query.type;
  }

  const [notifications, total, unreadCount] = await Promise.all([
    Notification.find(filter)
      .populate('createdBy', 'name email avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Notification.countDocuments(filter),
    Notification.countDocuments({ userId, isRead: false }),
  ]);

  return {
    notifications,
    total,
    page,
    pages: Math.ceil(total / limit),
    unreadCount,
  };
};

/**
 * 4. Mark single notification as read.
 */
export const markAsRead = async (id: string, userId: string): Promise<INotification> => {
  const notification = await Notification.findOne({ _id: id, userId });
  if (!notification) {
    throw new NotFoundError('Notification item not found');
  }

  notification.isRead = true;
  const saved = await notification.save();
  const populated = await saved.populate('createdBy', 'name email avatar');

  // Notify frontend socket regarding read state synchronization
  try {
    const io = getIO();
    io.to(`user:${userId}`).emit('notification:update', populated);
  } catch (err) {
    // Sockets not initialised (e.g. running in script/tests)
  }

  return populated;
};

/**
 * 5. Mark all unread notifications as read.
 */
export const markAllAsRead = async (userId: string): Promise<void> => {
  await Notification.updateMany({ userId, isRead: false }, { isRead: true });

  try {
    const io = getIO();
    io.to(`user:${userId}`).emit('notification:update', { allRead: true });
  } catch (err) {
    // Fallback
  }
};

/**
 * 6. Delete notification.
 */
export const deleteNotification = async (id: string, userId: string): Promise<void> => {
  const notification = await Notification.findOneAndDelete({ _id: id, userId });
  if (!notification) {
    throw new NotFoundError('Notification item not found');
  }

  try {
    const io = getIO();
    io.to(`user:${userId}`).emit('notification:update', { deletedId: id });
  } catch (err) {
    // Fallback
  }
};
