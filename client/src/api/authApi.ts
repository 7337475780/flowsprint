import api from './axios.js';

export interface LoginInput {
  email:    string;
  password: string;
}

export interface RegisterInput {
  name:     string;
  email:    string;
  password: string;
  role?:    'member' | 'manager';
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user:  User;
    token: string;
  };
}

export interface User {
  _id:      string;
  name:     string;
  email:    string;
  role:     'admin' | 'manager' | 'member';
  avatar?:  string;
  isActive: boolean;
  bio?:     string;
  preferences?: {
    theme: 'light' | 'dark';
    emailNotifications: boolean;
    taskAlerts: boolean;
    sprintAlerts: boolean;
    mentionAlerts: boolean;
  };
  lastLogin?: string;
  activeSessions?: Array<{
    _id: string;
    token: string;
    device: string;
    ip: string;
    lastActive: string;
  }>;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Authenticate with email + password.
 */
export const login = async (credentials: LoginInput): Promise<AuthResponse> => {
  const { data } = await api.post<AuthResponse>('/auth/login', credentials);
  return data;
};

/**
 * Create a new account.
 */
export const register = async (payload: RegisterInput): Promise<AuthResponse> => {
  const { data } = await api.post<AuthResponse>('/auth/register', payload);
  return data;
};

/**
 * Fetch the currently authenticated user's profile.
 */
export const getCurrentUser = async (): Promise<User> => {
  const { data } = await api.get<{ success: boolean; data: { user: User } }>('/auth/me');
  return data.data.user;
};

/**
 * Destroy the server-side session cookie.
 */
export const logout = async (): Promise<void> => {
  await api.post('/auth/logout');
};
