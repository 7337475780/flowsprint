import { io, Socket } from 'socket.io-client';
import { toast } from 'sonner';
import { useNotificationStore } from '../features/notifications/store/notificationStore.js';

let socket: Socket | null = null;

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 
  (import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '' : 'http://localhost:5000/api')).replace(/\/api\/?$/, '');

/**
 * Connect and authenticate with the Socket.io server using JWT.
 * Configures real-time listener handlers to sync with global Zustand store.
 */
let lastToken: string | null = null;

export const initSocket = (token: string) => {
  if (socket && lastToken === token) return;

  if (socket) {
    socket.disconnect();
  }

  lastToken = token;
  const host = SOCKET_URL || (typeof window !== 'undefined' ? window.location.origin : '');

  socket = io(host, {
    auth: { token },
    transports: ['websocket'],
    secure: import.meta.env.PROD ? true : undefined,
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: Infinity,
  });

  socket.on('connect', () => {
    console.log('⚡ Connected to FlowSprint Socket Server.');
  });

  // Listen to new in-app notification triggers
  socket.on('notification:new', (notification) => {
    // 1. Push directly into Zustand store for instant UI updates
    useNotificationStore.getState().addNotification(notification);

    // 2. Spawn a elegant, non-intrusive SaaS Toast Alert
    toast(notification.title, {
      description: notification.message,
      action: {
        label: 'View',
        onClick: () => {
          window.location.href = '/notifications';
        },
      },
    });
  });

  // Listen to in-app notification state updates (read / delete events)
  socket.on('notification:update', (data) => {
    useNotificationStore.getState().handleNotificationUpdate(data);
  });

  socket.on('disconnect', () => {
    console.warn('⚡ Disconnected from FlowSprint Socket Server.');
  });
};

/**
 * Safely disconnects the stateful socket session.
 */
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const getSocket = (): Socket | null => socket;
