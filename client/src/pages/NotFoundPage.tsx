import { Link } from 'react-router-dom';
import { Zap, ArrowLeft } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-center px-6">
      <div className="mb-6 p-3 bg-primary/10 text-primary rounded-2xl w-fit">
        <Zap className="h-8 w-8 fill-current" />
      </div>
      <p className="text-7xl font-heading font-extrabold text-primary/20 leading-none mb-2">404</p>
      <h1 className="text-2xl font-bold tracking-tight mb-2">Page not found</h1>
      <p className="text-sm text-muted-foreground max-w-sm mb-8">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link
        to="/dashboard"
        className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 active:scale-[0.98] transition-all"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Dashboard
      </Link>
    </div>
  );
}
