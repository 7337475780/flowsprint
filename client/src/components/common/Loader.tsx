import { cn } from '../../lib/utils.js';

interface LoaderProps {
  fullscreen?: boolean;
  size?:       'sm' | 'md' | 'lg';
  className?:  string;
}

/**
 * Reusable spinner component.
 * Pass `fullscreen` to center it in the viewport for page-level loading states.
 */
export default function Loader({ fullscreen, size = 'md', className }: LoaderProps) {
  const sizes = { sm: 'h-4 w-4', md: 'h-7 w-7', lg: 'h-10 w-10' };

  const spinner = (
    <svg
      className={cn('animate-spin text-primary', sizes[size], className)}
      viewBox="0 0 24 24"
      fill="none"
    >
      <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
      <path
        className="opacity-80"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );

  if (fullscreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
        {spinner}
      </div>
    );
  }

  return spinner;
}
