import { useNotificationStore } from '../store/notificationStore.js';
import { cn } from '../../../lib/utils.js';

interface UnreadBadgeProps {
  className?: string;
}

export default function UnreadBadge({ className }: UnreadBadgeProps) {
  const unreadCount = useNotificationStore((state) => state.unreadCount);

  if (unreadCount === 0) return null;

  return (
    <span
      className={cn(
        'flex h-5 min-w-[20px] items-center justify-center rounded-full bg-primary px-1.5 text-3xs font-extrabold text-primary-foreground shadow-sm animate-pulse ring-2 ring-background',
        className
      )}
    >
      {unreadCount > 99 ? '99+' : unreadCount}
    </span>
  );
}
