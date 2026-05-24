import { cn } from '../../lib/utils.js';

interface LoaderProps {
  fullscreen?: boolean;
  size?:       'sm' | 'md' | 'lg';
  className?:  string;
}

/**
 * Reusable spinner and premium brand loader component.
 * Pass `fullscreen` to render the immersive FlowSprint logo path drawing loader.
 */
export default function Loader({ fullscreen, size = 'md', className }: LoaderProps) {
  const sizes = { sm: 'h-4 w-4', md: 'h-7 w-7', lg: 'h-10 w-10' };

  if (fullscreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white dark:bg-slate-950 transition-colors duration-300">
        <div className="relative flex flex-col items-center gap-6">
          
          {/* SVG Brand Path Logo */}
          <svg
            viewBox="0 0 120 120"
            className="w-28 h-28 animate-pulse"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="loadBottomGrad" x1="0" y1="1" x2="1" y2="0">
                <stop offset="0%" stopColor="#1D4ED8" />
                <stop offset="100%" stopColor="#3b82f6" />
              </linearGradient>
              <linearGradient id="loadMiddleGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#0EA5E9" />
                <stop offset="100%" stopColor="#38bdf8" />
              </linearGradient>
              <linearGradient id="loadTopGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#2563EB" />
                <stop offset="100%" stopColor="#1D4ED8" />
              </linearGradient>
            </defs>

            {/* Bottom Flow */}
            <path
              d="M15 95C24 62 38 58 48 58C62 58 62 84 78 84"
              stroke="url(#loadBottomGrad)"
              strokeWidth="18"
              strokeLinecap="round"
              className="animate-draw1"
            />

            {/* Middle Flow */}
            <path
              d="M28 55C35 42 45 38 58 38H72"
              stroke="url(#loadMiddleGrad)"
              strokeWidth="14"
              strokeLinecap="round"
              className="animate-draw2"
            />

            {/* Top Arrow */}
            <path
              d="M20 35C28 15 42 12 58 12H85"
              stroke="url(#loadTopGrad)"
              strokeWidth="16"
              strokeLinecap="round"
              className="animate-draw3"
            />

            <path
              d="M84 2L108 18L84 34"
              fill="url(#loadTopGrad)"
              className="animate-arrow"
            />
          </svg>

          {/* Text Title */}
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white font-heading">
            FlowSprint
          </h1>

          {/* Sprint Progress bar */}
          <div className="w-40 h-1 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full w-1/2 bg-blue-600 dark:bg-indigo-500 animate-progress rounded-full"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
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
}
