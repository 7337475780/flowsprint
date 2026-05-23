import { create } from 'zustand';
import api from '../../../api/axios.js';

export interface INotification {
  _id: string;
  userId: string;
  type:
    | 'task_assigned'
    | 'task_updated'
    | 'task_moved'
    | 'sprint_started'
    | 'sprint_completed'
    | 'mention'
    | 'comment_added'
    | 'system_alert';
  title: string;
  message: string;
  entityType?: 'task' | 'sprint' | 'project' | 'comment';
  entityId?: string;
  isRead: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdBy?: {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface INotificationPreference {
  _id: string;
  userId: string;
  emailNotifications: boolean;
  inAppNotifications: boolean;
  mentionAlerts: boolean;
  taskUpdates: boolean;
  sprintUpdates: boolean;
}

interface NotificationState {
  notifications: INotification[];
  unreadCount: number;
  total: number;
  page: number;
  pages: number;
  preferences: INotificationPreference | null;
  isLoading: boolean;
  isPreferencesLoading: boolean;

  // Actions
  fetchNotifications: (query?: {
    page?: number;
    unread?: boolean;
    type?: string;
  }) => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  addNotification: (notification: INotification) => void;
  handleNotificationUpdate: (data: any) => void;
  fetchPreferences: () => Promise<void>;
  updatePreferences: (prefs: Partial<INotificationPreference>) => Promise<void>;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  total: 0,
  page: 1,
  pages: 1,
  preferences: null,
  isLoading: false,
  isPreferencesLoading: false,

  /**
   * Fetches paginated and filtered notifications list from backend API
   */
  fetchNotifications: async (query) => {
    set({ isLoading: true });
    try {
      const params = new URLSearchParams();
      if (query?.page) params.append('page', query.page.toString());
      if (query?.unread) params.append('unread', 'true');
      if (query?.type) params.append('type', query.type);

      const response = await api.get(`/notifications?${params.toString()}`);
      if (response.data?.success) {
        const { notifications, total, page, pages, unreadCount } = response.data.data;
        set({
          notifications,
          total,
          page,
          pages,
          unreadCount,
        });
      }
    } catch (error) {
      console.error('❌ Error fetching notifications:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  /**
   * Marks a single notification as read
   */
  markAsRead: async (id) => {
    // Optimistic local state update
    const updatedNotifications = get().notifications.map((n) =>
      n._id === id ? { ...n, isRead: true } : n
    );
    const prevCount = get().unreadCount;
    set({
      notifications: updatedNotifications,
      unreadCount: Math.max(0, prevCount - 1),
    });

    try {
      await api.patch(`/notifications/${id}/read`);
    } catch (error) {
      console.error('❌ Error marking notification as read:', error);
      // Revert if error
      get().fetchNotifications();
    }
  },

  /**
   * Marks all user notifications as read
   */
  markAllAsRead: async () => {
    // Optimistic local state update
    const updatedNotifications = get().notifications.map((n) => ({ ...n, isRead: true }));
    set({
      notifications: updatedNotifications,
      unreadCount: 0,
    });

    try {
      await api.patch('/notifications/read-all');
    } catch (error) {
      console.error('❌ Error marking all notifications as read:', error);
      get().fetchNotifications();
    }
  },

  /**
   * Deletes a single notification
   */
  deleteNotification: async (id) => {
    // Optimistic local state update
    const target = get().notifications.find((n) => n._id === id);
    const updatedNotifications = get().notifications.filter((n) => n._id !== id);
    const unreadDiff = target && !target.isRead ? 1 : 0;
    
    set({
      notifications: updatedNotifications,
      unreadCount: Math.max(0, get().unreadCount - unreadDiff),
      total: Math.max(0, get().total - 1),
    });

    try {
      await api.delete(`/notifications/${id}`);
    } catch (error) {
      console.error('❌ Error deleting notification:', error);
      get().fetchNotifications();
    }
  },

  /**
   * Prepend a new incoming notification (triggered by sockets)
   */
  addNotification: (notification) => {
    // Check if notification already exists in state
    if (get().notifications.some((n) => n._id === notification._id)) return;

    set({
      notifications: [notification, ...get().notifications],
      unreadCount: get().unreadCount + 1,
      total: get().total + 1,
    });
  },

  /**
   * Handles real-time update socket broadcasts
   */
  handleNotificationUpdate: (data) => {
    if (!data) return;

    // 1. If single notification marked read
    if (data._id) {
      const updated = get().notifications.map((n) =>
        n._id === data._id ? { ...n, isRead: true } : n
      );
      // Recalculate unreadCount
      const unreadCount = updated.filter((n) => !n.isRead).length;
      set({ notifications: updated, unreadCount });
    }
    // 2. If all notifications marked read
    else if (data.allRead) {
      const updated = get().notifications.map((n) => ({ ...n, isRead: true }));
      set({ notifications: updated, unreadCount: 0 });
    }
    // 3. If single notification deleted
    else if (data.deletedId) {
      const target = get().notifications.find((n) => n._id === data.deletedId);
      const updated = get().notifications.filter((n) => n._id !== data.deletedId);
      const unreadDiff = target && !target.isRead ? 1 : 0;
      set({
        notifications: updated,
        unreadCount: Math.max(0, get().unreadCount - unreadDiff),
        total: Math.max(0, get().total - 1),
      });
    }
  },

  /**
   * Fetch notification preferences
   */
  fetchPreferences: async () => {
    set({ isPreferencesLoading: true });
    try {
      const response = await api.get('/notifications/preferences');
      if (response.data?.success) {
        set({ preferences: response.data.data });
      }
    } catch (error) {
      console.error('❌ Error fetching notification preferences:', error);
    } finally {
      set({ isPreferencesLoading: false });
    }
  },

  /**
   * Update notification preferences
   */
  updatePreferences: async (cleanUpdate) => {
    // Optimistic local state update
    const current = get().preferences;
    if (current) {
      set({ preferences: { ...current, ...cleanUpdate } as any });
    }

    try {
      const response = await api.put('/notifications/preferences', cleanUpdate);
      if (response.data?.success) {
        set({ preferences: response.data.data });
      }
    } catch (error) {
      console.error('❌ Error updating notification preferences:', error);
      get().fetchPreferences();
    }
  },
}));
