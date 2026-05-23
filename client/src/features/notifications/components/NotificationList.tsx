import { BellOff } from 'lucide-react';
import { INotification } from '../store/notificationStore.js';
import NotificationItem from './NotificationItem.js';
import Loader from '../../../components/common/Loader.js';

interface NotificationListProps {
  notifications: INotification[];
  isLoading: boolean;
}

export default function NotificationList({ notifications, isLoading }: NotificationListProps) {
  if (isLoading && notifications.length === 0) {
    return <Loader className="py-16" />;
  }

  if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 rounded-xl border border-dashed bg-secondary/10 px-4">
        <div className="h-12 w-12 rounded-full bg-secondary flex items-center justify-center text-muted-foreground border">
          <BellOff className="h-5 w-5" />
        </div>
        <div className="space-y-1">
          <h4 className="text-sm font-bold text-foreground">All clear here!</h4>
          <p className="text-2xs text-muted-foreground max-w-[280px]">
            You have no notifications in this category. We'll alert you when something updates!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {notifications.map((notification) => (
        <NotificationItem key={notification._id} notification={notification} />
      ))}
    </div>
  );
}
