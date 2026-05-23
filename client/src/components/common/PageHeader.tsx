import { cn } from '../../lib/utils.js';

interface PageHeaderProps {
  title:        string;
  description?: string;
  actions?:     React.ReactNode;
  className?:   string;
}

/**
 * Standardised page header with title, optional description, and action slot.
 */
export default function PageHeader({ title, description, actions, className }: PageHeaderProps) {
  return (
    <div className={cn('flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between', className)}>
      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight">{title}</h1>
        {description && (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {actions && (
        <div className="flex shrink-0 items-center gap-2">{actions}</div>
      )}
    </div>
  );
}
