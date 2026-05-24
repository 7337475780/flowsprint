import { User } from '../../models/User.js';
import { IUser } from '../../types/user.js';
import bcrypt from 'bcryptjs';

/**
 * Strips password and private details to return a safe user payload.
 */
export const toSafeUser = (user: any) => {
  const userObj = user.toObject ? user.toObject() : user;
  delete userObj.password;
  return userObj;
};

/**
 * Updates a user's basic profile details (name, bio, avatar).
 */
export const updateProfile = async (
  userId: string,
  updateData: { name?: string; bio?: string; avatar?: string }
): Promise<any> => {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }

  if (updateData.name !== undefined) user.name = updateData.name;
  if (updateData.bio !== undefined) user.bio = updateData.bio;
  if (updateData.avatar !== undefined) user.avatar = updateData.avatar;

  await user.save();
  return toSafeUser(user);
};

/**
 * Updates a user's notification or theme preferences.
 */
export const updatePreferences = async (
  userId: string,
  preferencesData: {
    theme?: 'light' | 'dark';
    emailNotifications?: boolean;
    taskAlerts?: boolean;
    sprintAlerts?: boolean;
    mentionAlerts?: boolean;
  }
): Promise<any> => {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }

  if (!user.preferences) {
    user.preferences = {
      theme: 'dark',
      emailNotifications: true,
      taskAlerts: true,
      sprintAlerts: true,
      mentionAlerts: true,
    };
  }

  if (preferencesData.theme !== undefined) user.preferences.theme = preferencesData.theme;
  if (preferencesData.emailNotifications !== undefined)
    user.preferences.emailNotifications = preferencesData.emailNotifications;
  if (preferencesData.taskAlerts !== undefined) user.preferences.taskAlerts = preferencesData.taskAlerts;
  if (preferencesData.sprintAlerts !== undefined) user.preferences.sprintAlerts = preferencesData.sprintAlerts;
  if (preferencesData.mentionAlerts !== undefined) user.preferences.mentionAlerts = preferencesData.mentionAlerts;

  await user.save();
  return toSafeUser(user);
};

/**
 * Changes a user's password with old password verification.
 * Optionally terminates other active device sessions for account safety.
 */
export const changePassword = async (
  userId: string,
  data: { oldPassword: string; newPassword: string },
  currentToken?: string
): Promise<any> => {
  // Fetch user explicitly selecting the password
  const user = await User.findById(userId).select('+password');
  if (!user) {
    throw new Error('User not found');
  }

  // 1. Verify old password
  const isMatch = await user.comparePassword(data.oldPassword);
  if (!isMatch) {
    throw new Error('Incorrect current password provided');
  }

  // 2. Hash and update new password
  user.password = data.newPassword;

  // 3. Keep only the current session token (invalidates all other sessions)
  if (currentToken && user.activeSessions) {
    user.activeSessions = user.activeSessions.filter((sess) => sess.token === currentToken);
  }

  await user.save();
  return toSafeUser(user);
};

/**
 * Track an active user session upon successful login.
 */
export const trackSession = async (
  userId: string,
  sessionDetails: { token: string; device: string; ip: string }
): Promise<void> => {
  const user = await User.findById(userId);
  if (!user) return;

  user.lastLogin = new Date();
  
  if (!user.activeSessions) {
    user.activeSessions = [];
  }

  // Keep list clean (e.g. limit to 10 active devices maximum)
  if (user.activeSessions.length >= 10) {
    user.activeSessions.shift();
  }

  user.activeSessions.push({
    token: sessionDetails.token,
    device: sessionDetails.device,
    ip: sessionDetails.ip,
    lastActive: new Date(),
  } as any);

  await user.save();
};

/**
 * Wipe all sessions, enforcing logout across all devices.
 */
export const logoutAllDevices = async (userId: string): Promise<void> => {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }

  user.activeSessions = [];
  await user.save();
};
