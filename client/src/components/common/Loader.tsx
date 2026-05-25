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
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950 transition-colors duration-300">
        <div className="relative flex flex-col items-center gap-6">
          {/* Logo container with animated rotating gradient ring */}
          <div className="relative flex items-center justify-center w-28 h-28 shrink-0">
            {/* Spinning gradient ring */}
            <div className="absolute inset-0 rounded-full border-2 border-dashed border-primary/45 animate-[spin_8s_linear_infinite]" />
            <div className="absolute inset-2 rounded-full border border-dashed border-indigo-500/25 animate-[spin_6s_linear_infinite_reverse]" />
            {/* Soft background glow */}
            <div className="absolute inset-0 bg-primary/10 rounded-full blur-xl animate-pulse-subtle" />
            
            {/* Centered logo image with a floating/scaling micro-animation */}
            <img
              src="/logo.png"
              alt="FlowSprint Loader"
              className="relative w-16 h-16 object-contain rounded-2xl animate-[pulse-subtle_2s_ease-in-out_infinite]"
            />
          </div>

          {/* Text Title */}
          <h1 className="text-2xl font-bold tracking-tight text-white font-heading">
            FlowSprint
          </h1>

          {/* Sprint Progress bar */}
          <div className="w-40 h-1 bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full w-1/2 bg-gradient-to-r from-primary to-indigo-500 animate-progress rounded-full"></div>
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
