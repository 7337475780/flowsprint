import { type LucideIcon } from 'lucide-react';
import { cn } from '../../lib/utils.js';

interface EmptyStateProps {
  icon?:        LucideIcon;
  title:        string;
  description?: string;
  action?:      React.ReactNode;
  className?:   string;
}

/**
 * Reusable empty state panel for lists, boards, and query results.
 */
export default function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-xl border border-dashed',
        'bg-card/50 p-12 text-center',
        className
      )}
    >
      {Icon && (
        <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-muted text-muted-foreground">
          <Icon className="h-6 w-6" />
        </div>
      )}
      <h3 className="font-semibold text-sm">{title}</h3>
      {description && (
        <p className="mt-1.5 text-xs text-muted-foreground max-w-xs">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
