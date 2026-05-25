import Loader from '../../../components/common/Loader.js';

interface SprintProgressProps {
  message?: string;
}

export default function SprintProgress({ message = 'Synchronizing sprint metrics...' }: SprintProgressProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 border border-dashed rounded-2xl bg-card/40">
      <Loader className="mb-2" />
      <span className="text-3xs font-extrabold uppercase tracking-widest text-muted-foreground">
        {message}
      </span>
    </div>
  );
}
