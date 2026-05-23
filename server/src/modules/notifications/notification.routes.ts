import { Router } from 'express';
import { protect } from '../../middleware/authMiddleware.js';
import {
  getNotifications,
  markRead,
  markAllRead,
  deleteNotification,
  getPreferences,
  updatePreferences,
} from './notification.controller.js';

const router = Router();

// General notifications endpoint (paginated and filterable)
router.get('/', protect, getNotifications);

// Retrieve and update notification preferences
router.get('/preferences', protect, getPreferences);
router.put('/preferences', protect, updatePreferences);

// Mark all notifications as read (Must be declared before :id wildcards!)
router.patch('/read-all', protect, markAllRead);

// Mark single notification read
router.patch('/:id/read', protect, markRead);

// Delete single notification
router.delete('/:id', protect, deleteNotification);

export default router;
