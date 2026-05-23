import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { BellOff, CheckCheck, Inbox } from 'lucide-react';
import { useNotificationStore } from '../store/notificationStore.js';
import NotificationItem from './NotificationItem.js';
import Loader from '../../../components/common/Loader.js';

interface NotificationDropdownProps {
  onClose: () => void;
}

export default function NotificationDropdown({ onClose }: NotificationDropdownProps) {
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const { notifications, unreadCount, isLoading, fetchNotifications, markAllAsRead } =
    useNotificationStore();

  // Load latest notifications on mount
  useEffect(() => {
    fetchNotifications({ page: 1 });
  }, []);

  // Close when clicking outside the dropdown container
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const handleViewInbox = () => {
    navigate('/notifications');
    onClose();
  };

  const handleMarkAllRead = async () => {
    await markAllAsRead();
  };

  // Limit preview list to top 5
  const previewList = notifications.slice(0, 5);

  return (
    <div
      ref={dropdownRef}
      className="absolute right-0 top-full mt-2 w-80 sm:w-96 rounded-xl border bg-card shadow-lg z-50 overflow-hidden flex flex-col animate-in fade-in slide-in-from-top-1 duration-150"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b px-4 py-3 bg-secondary/10 shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-foreground">Notifications</span>
          {unreadCount > 0 && (
            <span className="px-1.5 py-0.5 rounded-full bg-primary/10 text-primary text-3xs font-black">
              {unreadCount} new
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="text-3xs font-extrabold text-primary hover:text-primary/80 transition-colors uppercase tracking-widest flex items-center gap-1"
          >
            <CheckCheck className="h-3 w-3" />
            Mark all read
          </button>
        )}
      </div>

      {/* List Preview */}
      <div className="max-h-[350px] overflow-y-auto divide-y">
        {isLoading && notifications.length === 0 ? (
          <Loader className="py-8" />
        ) : previewList.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 px-4 text-center space-y-2">
            <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center text-muted-foreground border">
              <BellOff className="h-4.5 w-4.5" />
            </div>
            <div>
              <h5 className="text-xs font-bold text-foreground">All caught up!</h5>
              <p className="text-4xs text-muted-foreground max-w-[200px] mt-0.5 leading-relaxed">
                You have no notifications right now.
              </p>
            </div>
          </div>
        ) : (
          <div className="p-2 space-y-1.5">
            {previewList.map((item) => (
              <NotificationItem
                key={item._id}
                notification={item}
                onNavigate={onClose}
              />
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <button
        onClick={handleViewInbox}
        className="flex w-full items-center justify-center gap-2 border-t px-4 py-2.5 text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-secondary/20 transition-all shrink-0 uppercase tracking-widest"
      >
        <Inbox className="h-3.5 w-3.5" />
        Open Full Inbox
      </button>
    </div>
  );
}
