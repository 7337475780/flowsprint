import { cn } from '../../lib/utils.js';

interface SkeletonCardProps {
  variant?: 'kpi' | 'chart' | 'list' | 'progress';
  className?: string;
}

/**
 * Shimmer loader displaying beautiful layout placeholders for queries.
 */
export default function SkeletonCard({ variant = 'kpi', className }: SkeletonCardProps) {
  return (
    <div
      className={cn(
        'border bg-card rounded-2xl p-5 shadow-2xs animate-pulse flex flex-col justify-between transition-all duration-300',
        {
          'h-32': variant === 'kpi',
          'h-80': variant === 'chart',
          'h-64': variant === 'progress' || variant === 'list',
        },
        className
      )}
    >
      {/* ─── KPI Loader ─── */}
      {variant === 'kpi' && (
        <div className="space-y-4 w-full">
          <div className="flex justify-between items-center">
            <div className="h-3.5 bg-muted rounded w-20" />
            <div className="h-7 w-7 bg-muted rounded-lg" />
          </div>
          <div className="h-8 bg-muted rounded w-16" />
          <div className="h-3 bg-muted rounded w-32" />
        </div>
      )}

      {/* ─── Circular/Status Chart Loader ─── */}
      {variant === 'chart' && (
        <div className="space-y-6 w-full h-full flex flex-col justify-between">
          <div className="space-y-2">
            <div className="h-4 bg-muted rounded w-1/3" />
            <div className="h-3 bg-muted rounded w-1/2" />
          </div>
          <div className="h-28 w-28 rounded-full bg-muted/60 mx-auto animate-pulse" />
          <div className="grid grid-cols-2 gap-4">
            <div className="h-3 bg-muted rounded w-full" />
            <div className="h-3 bg-muted rounded w-full" />
          </div>
        </div>
      )}

      {/* ─── List/Feed Item Loader ─── */}
      {variant === 'list' && (
        <div className="space-y-4 w-full h-full">
          <div className="space-y-2">
            <div className="h-4 bg-muted rounded w-1/4" />
            <div className="h-3 bg-muted rounded w-1/3" />
          </div>
          <div className="space-y-3 pt-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex gap-3 items-center">
                <div className="h-8 w-8 rounded-full bg-muted/80 shrink-0" />
                <div className="space-y-1.5 flex-1">
                  <div className="h-3.5 bg-muted rounded w-2/3" />
                  <div className="h-2.5 bg-muted rounded w-1/4" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── Progress Scales Loader ─── */}
      {variant === 'progress' && (
        <div className="space-y-4 w-full h-full flex flex-col justify-between">
          <div className="space-y-2">
            <div className="h-4 bg-muted rounded w-1/3" />
            <div className="h-3 bg-muted rounded w-1/2" />
          </div>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <div className="h-3 bg-muted rounded w-2/3" />
              <div className="h-2 bg-muted rounded w-full" />
            </div>
            <div className="space-y-2">
              <div className="h-3 bg-muted rounded w-1/2" />
              <div className="h-2 bg-muted rounded w-full" />
            </div>
          </div>
          <div className="h-10 bg-muted rounded w-full" />
        </div>
      )}
    </div>
  );
}
