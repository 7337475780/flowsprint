import { Loader2 } from 'lucide-react';

interface SprintProgressProps {
  message?: string;
}

export default function SprintProgress({ message = 'Synchronizing sprint metrics...' }: SprintProgressProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 border border-dashed rounded-2xl bg-card/40">
      <Loader2 className="h-6 w-6 text-primary animate-spin mb-2" />
      <span className="text-3xs font-extrabold uppercase tracking-widest text-muted-foreground">
        {message}
      </span>
    </div>
  );
}
