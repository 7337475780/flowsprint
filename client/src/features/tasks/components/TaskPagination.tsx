import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../../lib/utils.js';

interface TaskPaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export default function TaskPagination({
  page,
  totalPages,
  onPageChange,
  className,
}: TaskPaginationProps) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }).map((_, i) => i + 1);

  return (
    <div
      className={cn(
        'flex items-center justify-between border bg-card px-5 py-3.5 rounded-2xl shadow-2xs mt-4 transition-all duration-300',
        className
      )}
    >
      <div className="hidden sm:block text-xs font-semibold text-muted-foreground">
        Showing page <span className="font-extrabold text-foreground">{page}</span> of{' '}
        <span className="font-extrabold text-foreground">{totalPages}</span>
      </div>
      <div className="flex items-center gap-1.5 mx-auto sm:mx-0">
        {/* Previous Button */}
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className="p-2 border rounded-lg hover:bg-secondary transition-all disabled:opacity-40 disabled:pointer-events-none active:scale-95 shrink-0"
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {/* Page Indexes */}
        {pages.map((p) => (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={cn(
              'h-9 w-9 text-xs font-mono font-extrabold rounded-lg border transition-all active:scale-95',
              page === p
                ? 'bg-primary text-primary-foreground border-primary shadow-2xs'
                : 'hover:bg-secondary text-muted-foreground hover:text-foreground'
            )}
          >
            {p}
          </button>
        ))}

        {/* Next Button */}
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
          className="p-2 border rounded-lg hover:bg-secondary transition-all disabled:opacity-40 disabled:pointer-events-none active:scale-95 shrink-0"
          aria-label="Next page"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
