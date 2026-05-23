import { useState, useEffect } from 'react';
import { CheckCheck, RefreshCw, Inbox, Settings } from 'lucide-react';
import PageHeader from '../components/common/PageHeader.js';
import NotificationList from '../features/notifications/components/NotificationList.js';
import NotificationFilters from '../features/notifications/components/NotificationFilters.js';
import NotificationSettings from '../features/notifications/components/NotificationSettings.js';
import { useNotificationStore } from '../features/notifications/store/notificationStore.js';
import { cn } from '../lib/utils.js';

export default function NotificationsPage() {
  const [currentTab, setCurrentTab] = useState<'all' | 'unread'>('unread');
  const [selectedType, setSelectedType] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [activeSubTab, setActiveSubTab] = useState<'inbox' | 'preferences'>('inbox');

  const {
    notifications,
    unreadCount,
    pages,
    isLoading,
    fetchNotifications,
    markAllAsRead,
  } = useNotificationStore();

  const handleFetch = () => {
    fetchNotifications({
      page: currentPage,
      unread: currentTab === 'unread',
      type: selectedType || undefined,
    });
  };

  // Re-fetch when tab, filters, or page index changes
  useEffect(() => {
    handleFetch();
  }, [currentTab, selectedType, currentPage]);

  const handleMarkAllRead = async () => {
    await markAllAsRead();
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader
          title="Notification Center"
          description="Manage your inbox feed, mention alerts, task updates, and configurations."
        />
        
        {/* Settings Toggle Tabs */}
        <div className="flex gap-1.5 p-1 rounded-xl bg-secondary/40 border max-w-fit self-start sm:self-center shrink-0">
          <button
            onClick={() => setActiveSubTab('inbox')}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all',
              activeSubTab === 'inbox'
                ? 'bg-card text-foreground shadow-xs border border-border'
                : 'text-muted-foreground hover:text-foreground hover:bg-secondary/40 border border-transparent'
            )}
          >
            <Inbox className="h-3.5 w-3.5" />
            Inbox
            {unreadCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-primary text-primary-foreground text-4xs font-black">
                {unreadCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveSubTab('preferences')}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all',
              activeSubTab === 'preferences'
                ? 'bg-card text-foreground shadow-xs border border-border'
                : 'text-muted-foreground hover:text-foreground hover:bg-secondary/40 border border-transparent'
            )}
          >
            <Settings className="h-3.5 w-3.5" />
            Preferences
          </button>
        </div>
      </div>

      {activeSubTab === 'inbox' ? (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Inbox Column */}
          <div className="lg:col-span-2 space-y-4">
            <div className="rounded-xl border bg-card p-6 shadow-sm space-y-4">
              {/* Filter controls row */}
              <NotificationFilters
                currentTab={currentTab}
                setCurrentTab={setCurrentTab}
                selectedType={selectedType}
                setSelectedType={(t) => {
                  setSelectedType(t);
                  setCurrentPage(1);
                }}
              />

              {/* Action utilities bar */}
              <div className="flex items-center justify-between gap-4 pt-1">
                <button
                  onClick={handleFetch}
                  disabled={isLoading}
                  className="flex items-center gap-2 text-2xs font-extrabold text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50 uppercase tracking-widest"
                >
                  <RefreshCw className={cn('h-3.5 w-3.5', isLoading && 'animate-spin')} />
                  Refresh
                </button>

                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="flex items-center gap-2 text-2xs font-extrabold text-primary hover:text-primary/80 transition-colors uppercase tracking-widest"
                  >
                    <CheckCheck className="h-3.5 w-3.5" />
                    Mark all read
                  </button>
                )}
              </div>

              {/* List Feed */}
              <NotificationList notifications={notifications} isLoading={isLoading} />

              {/* Pagination controls */}
              {pages > 1 && (
                <div className="flex items-center justify-between border-t pt-4 mt-4">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1 || isLoading}
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg border hover:bg-secondary disabled:opacity-50 transition-colors cursor-pointer"
                  >
                    Previous
                  </button>
                  <span className="text-2xs text-muted-foreground font-semibold">
                    Page {currentPage} of {pages}
                  </span>
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(pages, p + 1))}
                    disabled={currentPage === pages || isLoading}
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg border hover:bg-secondary disabled:opacity-50 transition-colors cursor-pointer"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Quick Preferences Column */}
          <div className="hidden lg:block space-y-4">
            <NotificationSettings />
          </div>
        </div>
      ) : (
        <div className="max-w-3xl">
          <NotificationSettings />
        </div>
      )}
    </div>
  );
}
