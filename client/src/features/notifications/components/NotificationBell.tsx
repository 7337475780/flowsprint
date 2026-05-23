import { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { useNotificationStore } from '../store/notificationStore.js';
import { useAuthStore } from '../../../store/authStore.js';
import { initSocket, disconnectSocket } from '../../../lib/socketService.js';
import UnreadBadge from './UnreadBadge.js';
import NotificationDropdown from './NotificationDropdown.js';

export default function NotificationBell() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const token = useAuthStore((state) => state.token);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const fetchNotifications = useNotificationStore((state) => state.fetchNotifications);

  // Initialize sockets for real-time updates when authenticated
  useEffect(() => {
    if (isAuthenticated && token) {
      initSocket(token);
      
      // Initial fetch to load the unread counts count
      fetchNotifications();
    }

    return () => {
      // Disconnect socket on unmount (or when token drops)
      disconnectSocket();
    };
  }, [isAuthenticated, token, fetchNotifications]);

  const handleToggleDropdown = () => {
    setDropdownOpen((open) => !open);
  };

  return (
    <div className="relative">
      <button
        onClick={handleToggleDropdown}
        className="relative p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-all cursor-pointer active:scale-95"
        aria-label="Notifications"
        aria-haspopup="true"
        aria-expanded={dropdownOpen}
      >
        <Bell className="h-4.5 w-4.5 transition-transform duration-200 hover:rotate-12" />
        <UnreadBadge className="absolute top-1 right-1" />
      </button>

      {dropdownOpen && (
        <NotificationDropdown onClose={() => setDropdownOpen(false)} />
      )}
    </div>
  );
}
