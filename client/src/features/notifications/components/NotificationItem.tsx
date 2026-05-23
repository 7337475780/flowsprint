import { Check, Trash2, AtSign, MessageSquare, UserCheck, RefreshCw, Play, CheckCircle2, AlertTriangle, Move } from 'lucide-react';
import { INotification, useNotificationStore } from '../store/notificationStore.js';
import { cn } from '../../../lib/utils.js';

interface NotificationItemProps {
  notification: INotification;
  onNavigate?: () => void;
}

export default function NotificationItem({ notification, onNavigate }: NotificationItemProps) {
  const { markAsRead, deleteNotification } = useNotificationStore();

  const handleItemClick = (e: React.MouseEvent) => {
    // Avoid double trigger if buttons are clicked
    if ((e.target as HTMLElement).closest('button')) return;

    if (!notification.isRead) {
      markAsRead(notification._id);
    }
    if (onNavigate) {
      onNavigate();
    }
  };

  const getNotificationConfig = () => {
    switch (notification.type) {
      case 'task_assigned':
        return {
          icon: UserCheck,
          bgColor: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
          label: 'Assignment',
        };
      case 'task_updated':
        return {
          icon: RefreshCw,
          bgColor: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20',
          label: 'Task Update',
        };
      case 'task_moved':
        return {
          icon: Move,
          bgColor: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
          label: 'Pipeline Move',
        };
      case 'sprint_started':
        return {
          icon: Play,
          bgColor: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
          label: 'Sprint Start',
        };
      case 'sprint_completed':
        return {
          icon: CheckCircle2,
          bgColor: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
          label: 'Sprint Complete',
        };
      case 'mention':
        return {
          icon: AtSign,
          bgColor: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
          label: 'Mention',
        };
      case 'comment_added':
        return {
          icon: MessageSquare,
          bgColor: 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20',
          label: 'Comment',
        };
      case 'system_alert':
        return {
          icon: AlertTriangle,
          bgColor: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
          label: 'Alert',
        };
      default:
        return {
          icon: AlertTriangle,
          bgColor: 'bg-secondary text-secondary-foreground border-border',
          label: 'System',
        };
    }
  };

  const config = getNotificationConfig();
  const IconComponent = config.icon;

  const initials = notification.createdBy?.name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'S';

  // Format time (e.g. 5m ago, 2h ago)
  const formatTimeAgo = (dateStr: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(dateStr).getTime()) / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <div
      onClick={handleItemClick}
      className={cn(
        'group flex gap-4 p-4 rounded-xl border bg-card transition-all cursor-pointer relative overflow-hidden',
        'hover:bg-secondary/30 hover:border-muted-foreground/30 shadow-2xs hover:shadow-sm',
        !notification.isRead && 'border-primary/20 bg-primary/2xs hover:bg-primary/5'
      )}
    >
      {/* Unread Indicator dot */}
      {!notification.isRead && (
        <span className="absolute top-4 left-2.5 h-1.5 w-1.5 rounded-full bg-primary" />
      )}

      {/* Left Icon Badge */}
      <div className={cn('h-10 w-10 shrink-0 rounded-lg border flex items-center justify-center', config.bgColor)}>
        <IconComponent className="h-5 w-5" />
      </div>

      {/* Content area */}
      <div className="flex-1 space-y-1">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-2xs font-semibold text-muted-foreground tracking-wider uppercase">
              {config.label}
            </span>
            {notification.priority && notification.priority !== 'medium' && (
              <span
                className={cn(
                  'text-4xs font-extrabold px-1.5 py-0.5 rounded-full uppercase tracking-widest',
                  notification.priority === 'urgent' && 'bg-rose-500/10 text-rose-500',
                  notification.priority === 'high' && 'bg-amber-500/10 text-amber-500',
                  notification.priority === 'low' && 'bg-slate-500/10 text-slate-500'
                )}
              >
                {notification.priority}
              </span>
            )}
          </div>
          <span className="text-3xs text-muted-foreground font-semibold">
            {formatTimeAgo(notification.createdAt)}
          </span>
        </div>

        <h4 className="text-sm font-bold tracking-tight text-foreground">
          {notification.title}
        </h4>
        <p className="text-xs text-muted-foreground leading-relaxed break-words pr-4">
          {notification.message}
        </p>

        {/* Sender details if available */}
        {notification.createdBy && (
          <div className="flex items-center gap-2 pt-2">
            {notification.createdBy.avatar ? (
              <img
                src={notification.createdBy.avatar}
                alt={notification.createdBy.name}
                className="h-5 w-5 rounded-full object-cover border"
              />
            ) : (
              <div className="h-5 w-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-4xs font-bold border">
                {initials}
              </div>
            )}
            <span className="text-3xs font-semibold text-muted-foreground">
              by {notification.createdBy.name}
            </span>
          </div>
        )}
      </div>

      {/* Action items (Visible on hover) */}
      <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity justify-center shrink-0">
        {!notification.isRead && (
          <button
            onClick={() => markAsRead(notification._id)}
            className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground hover:text-primary border border-transparent hover:border-border transition-all"
            title="Mark as Read"
            aria-label="Mark as Read"
          >
            <Check className="h-3.5 w-3.5" />
          </button>
        )}
        <button
          onClick={() => deleteNotification(notification._id)}
          className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive border border-transparent hover:border-destructive/20 transition-all"
          title="Delete Notification"
          aria-label="Delete Notification"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
