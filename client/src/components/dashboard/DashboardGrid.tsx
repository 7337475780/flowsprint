import { cn } from '../../lib/utils.js';

interface DashboardGridProps {
  children: React.ReactNode;
  variant?: 'kpis' | 'widgets';
  className?: string;
}

/**
 * Grid layout system for KPI cells and analytics cards.
 * Uses 16px gaps and items-stretch for equal-height siblings.
 */
export default function DashboardGrid({
  children,
  variant = 'widgets',
  className,
}: DashboardGridProps) {
  return (
    <div
      className={cn(
        // items-stretch ensures all cards in a row share the same height
        'grid gap-4 w-full items-stretch',
        {
          // KPI cards: 1 col → 2 col → 3 col → 6 col
          'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6':
            variant === 'kpis',
          // Analytics widgets: 1 col → 2 col → 3 col
          'grid-cols-1 md:grid-cols-2 lg:grid-cols-3':
            variant === 'widgets',
        },
        className
      )}
    >
      {children}
    </div>
  );
}
