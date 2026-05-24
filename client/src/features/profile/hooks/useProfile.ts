import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAuthStore } from '../../../store/authStore.js';
import { useUIStore } from '../../../store/useUIStore.js';
import {
  updateProfile,
  updatePreferences,
  changePassword,
  logoutAllDevices,
} from '../api/profileApi.js';

/**
 * Hook to update user profile information (name, bio, avatar).
 */
export function useUpdateProfileMutation() {
  const queryClient = useQueryClient();
  const setUser = useAuthStore((s) => s.setUser);

  return useMutation({
    mutationFn: updateProfile,
    onSuccess: (data) => {
      setUser(data); // Sync immediately to Zustand active session store
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['auth'] });
      toast.success('Profile details updated successfully!');
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || 'Failed to update profile details';
      toast.error(msg);
    },
  });
}

/**
 * Hook to update notifications and UI theme preferences.
 */
export function useUpdatePreferencesMutation() {
  const queryClient = useQueryClient();
  const setUser = useAuthStore((s) => s.setUser);
  const setTheme = useUIStore((s) => s.setTheme);

  return useMutation({
    mutationFn: updatePreferences,
    onSuccess: (data) => {
      setUser(data); // Sync Zustand user details
      
      // If theme updated, synchronize visual theme classes instantly
      if (data.preferences?.theme) {
        setTheme(data.preferences.theme);
      }

      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['auth'] });
      toast.success('Display preferences updated successfully!');
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || 'Failed to update preferences';
      toast.error(msg);
    },
  });
}

/**
 * Hook to update password credentials.
 */
export function useChangePasswordMutation() {
  return useMutation({
    mutationFn: changePassword,
    onSuccess: () => {
      toast.success('Account password updated successfully!');
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || 'Failed to change password';
      toast.error(msg);
    },
  });
}

/**
 * Hook to revoke session tokens on all other device listings.
 */
export function useLogoutAllDevicesMutation() {
  const logout = useAuthStore((s) => s.logout);

  return useMutation({
    mutationFn: logoutAllDevices,
    onSuccess: () => {
      toast.success('Logged out all devices successfully. Logging you out...');
      setTimeout(() => {
        logout(); // clear state and redirect to /login
      }, 1500);
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || 'Failed to terminate sessions';
      toast.error(msg);
    },
  });
}
