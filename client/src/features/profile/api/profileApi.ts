import api from '../../../api/axios.js';
import type { User } from '../../../api/authApi.js';

export interface PreferencesInput {
  theme?: 'light' | 'dark';
  emailNotifications?: boolean;
  taskAlerts?: boolean;
  sprintAlerts?: boolean;
  mentionAlerts?: boolean;
}

export interface ProfileResponse {
  success: boolean;
  message: string;
  data: User;
}

/**
 * Update active profile name, bio, and avatar.
 */
export const updateProfile = async (payload: { name?: string; bio?: string; avatar?: string }): Promise<User> => {
  const { data } = await api.patch<ProfileResponse>('/users/me', payload);
  return data.data;
};

/**
 * Update notifications and appearance theme configurations.
 */
export const updatePreferences = async (payload: PreferencesInput): Promise<User> => {
  const { data } = await api.patch<ProfileResponse>('/users/preferences', payload);
  return data.data;
};

/**
 * Change authenticated user's password.
 */
export const changePassword = async (payload: Record<string, string>): Promise<User> => {
  const { data } = await api.patch<ProfileResponse>('/users/change-password', payload);
  return data.data;
};

/**
 * Invalidate session arrays across all active device devices.
 */
export const logoutAllDevices = async (): Promise<void> => {
  await api.post('/users/logout-all');
};
