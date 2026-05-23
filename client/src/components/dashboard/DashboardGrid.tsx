import { cn } from '../../lib/utils.js';

interface DashboardGridProps {
  children: React.ReactNode;
  variant?: 'kpis' | 'widgets';
  className?: string;
}

/**
 * Grid layout system for KPI cells and analytics cards.
 */
export default function DashboardGrid({
  children,
  variant = 'widgets',
  className,
}: DashboardGridProps) {
  return (
    <div
      className={cn(
        'grid gap-5 w-full',
        {
          // KPIs layout: 1 column mobile, 2 tablet, 3 desktop, 6 on widescreen
          'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6': variant === 'kpis',
          // Analytics widgets layout: 1 col on mobile, 2 on tablet/desktop, 3 on large screens
          'grid-cols-1 md:grid-cols-2 lg:grid-cols-3': variant === 'widgets',
        },
        className
      )}
    >
      {children}
    </div>
  );
}
