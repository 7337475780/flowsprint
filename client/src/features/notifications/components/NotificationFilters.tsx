import { useNotificationStore } from '../store/notificationStore.js';
import { cn } from '../../../lib/utils.js';

interface NotificationFiltersProps {
  currentTab: 'all' | 'unread';
  setCurrentTab: (tab: 'all' | 'unread') => void;
  selectedType: string;
  setSelectedType: (type: string) => void;
}

const NOTIFICATION_TYPES = [
  { value: '', label: 'All Categories' },
  { value: 'mention', label: 'Mentions (@user)' },
  { value: 'task_assigned', label: 'Assignments' },
  { value: 'task_updated', label: 'Updates' },
  { value: 'task_moved', label: 'Column Shifts' },
  { value: 'comment_added', label: 'Comments' },
  { value: 'sprint_started', label: 'Sprint Start' },
  { value: 'sprint_completed', label: 'Sprint End' },
];

export default function NotificationFilters({
  currentTab,
  setCurrentTab,
  selectedType,
  setSelectedType,
}: NotificationFiltersProps) {
  const unreadCount = useNotificationStore((state) => state.unreadCount);
  const total = useNotificationStore((state) => state.total);

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4 mt-2">
      {/* Read vs Unread Filter tabs */}
      <div className="flex gap-1.5 p-1 rounded-xl bg-secondary/40 border max-w-fit">
        <button
          onClick={() => setCurrentTab('all')}
          className={cn(
            'px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all',
            currentTab === 'all'
              ? 'bg-card text-foreground shadow-xs border border-border'
              : 'text-muted-foreground hover:text-foreground hover:bg-secondary/40 border border-transparent'
          )}
        >
          All
          {total > 0 && (
            <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-secondary text-2xs text-muted-foreground">
              {total}
            </span>
          )}
        </button>
        <button
          onClick={() => setCurrentTab('unread')}
          className={cn(
            'px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all',
            currentTab === 'unread'
              ? 'bg-card text-foreground shadow-xs border border-border'
              : 'text-muted-foreground hover:text-foreground hover:bg-secondary/40 border border-transparent'
          )}
        >
          Unread
          {unreadCount > 0 && (
            <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-primary/10 text-primary text-2xs font-extrabold">
              {unreadCount}
            </span>
          )}
        </button>
      </div>

      {/* Category Type selector dropdown */}
      <div className="flex items-center gap-2">
        <label className="text-3xs font-extrabold uppercase text-muted-foreground tracking-widest hidden md:inline">
          Filter:
        </label>
        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className={cn(
            'text-xs font-semibold rounded-lg border bg-card outline-none px-3 py-1.5 cursor-pointer',
            'focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all'
          )}
        >
          {NOTIFICATION_TYPES.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
