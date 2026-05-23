import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button.js';
import { Compass, Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-4">
      <div className="relative mb-6">
        {/* Animated outer ring */}
        <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse"></div>
        <div className="relative p-6 bg-secondary border rounded-full text-primary">
          <Compass className="h-12 w-12 animate-spin" style={{ animationDuration: '8s' }} />
        </div>
      </div>
      
      <h1 className="font-heading text-5xl font-extrabold tracking-tight">404</h1>
      <h2 className="font-heading text-2xl font-bold mt-2">Workspace Lost in Space</h2>
      
      <p className="text-muted-foreground max-w-md mt-3 text-sm leading-relaxed">
        The task board, sprint backlog, or user profile you are searching for does not exist in this coordinates. It may have been archived or moved elsewhere.
      </p>

      <div className="flex items-center gap-3 mt-8">
        <Link to="..">
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back
          </Button>
        </Link>
        <Link to="/">
          <Button size="sm">
            <Home className="mr-2 h-4 w-4" />
            Return Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}
