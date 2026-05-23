import { Response } from 'express';
import { AuthenticatedRequest } from '../../middleware/authMiddleware.js';
import * as notificationService from './notification.service.js';
import { NotificationPreference } from '../users/preferences.model.js';

/**
 * GET /api/notifications
 * Get paginated, filterable notifications for the logged-in user
 */
export const getNotifications = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!._id.toString();
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 20;
    const unreadOnly = req.query.unread === 'true';
    const type = req.query.type as any;

    const data = await notificationService.getUserNotifications(userId, {
      page,
      limit,
      unreadOnly,
      type,
    });

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching user notifications',
    });
  }
};

/**
 * PATCH /api/notifications/:id/read
 * Mark a single notification as read
 */
export const markRead = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!._id.toString();
    const notificationId = req.params.id;

    const notification = await notificationService.markAsRead(notificationId, userId);

    res.status(200).json({
      success: true,
      data: notification,
    });
  } catch (error: any) {
    const status = error.name === 'NotFoundError' ? 404 : 500;
    res.status(status).json({
      success: false,
      message: error.message || 'Error marking notification as read',
    });
  }
};

/**
 * PATCH /api/notifications/read-all
 * Mark all notifications for the user as read
 */
export const markAllRead = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!._id.toString();

    await notificationService.markAllAsRead(userId);

    res.status(200).json({
      success: true,
      message: 'All notifications successfully marked as read',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error marking all notifications as read',
    });
  }
};

/**
 * DELETE /api/notifications/:id
 * Delete a single notification
 */
export const deleteNotification = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!._id.toString();
    const notificationId = req.params.id;

    await notificationService.deleteNotification(notificationId, userId);

    res.status(200).json({
      success: true,
      message: 'Notification deleted successfully',
    });
  } catch (error: any) {
    const status = error.name === 'NotFoundError' ? 404 : 500;
    res.status(status).json({
      success: false,
      message: error.message || 'Error deleting notification',
    });
  }
};

/**
 * GET /api/notifications/preferences
 * Retrieve logged-in user notification preferences
 */
export const getPreferences = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!._id.toString();
    const preferences = await notificationService.getPreferences(userId);

    res.status(200).json({
      success: true,
      data: preferences,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching notification preferences',
    });
  }
};

/**
 * PUT /api/notifications/preferences
 * Update user notification preferences
 */
export const updatePreferences = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!._id.toString();
    const updateData = req.body;

    const allowedFields = [
      'emailNotifications',
      'inAppNotifications',
      'mentionAlerts',
      'taskUpdates',
      'sprintUpdates',
    ];

    const cleanUpdate: any = {};
    allowedFields.forEach((field) => {
      if (updateData[field] !== undefined) {
        cleanUpdate[field] = !!updateData[field];
      }
    });

    const preferences = await NotificationPreference.findOneAndUpdate(
      { userId },
      { $set: cleanUpdate },
      { new: true, upsert: true }
    );

    res.status(200).json({
      success: true,
      data: preferences,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error updating notification preferences',
    });
  }
};
