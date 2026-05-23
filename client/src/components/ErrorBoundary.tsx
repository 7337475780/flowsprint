import { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from './ui/Button.js';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/Card.js';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught application rendering error:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-slate-950 text-slate-100">
          <Card className="max-w-md w-full glassmorphism border-rose-500/30">
            <CardHeader className="text-center">
              <div className="mx-auto p-3 bg-rose-500/10 text-rose-500 rounded-full w-fit mb-3">
                <AlertTriangle className="h-8 w-8" />
              </div>
              <CardTitle className="text-xl">FlowSprint Crashed Unexpectedly</CardTitle>
              <CardDescription className="text-xs text-rose-400 mt-1">
                A rendering or runtime exception interrupted the workspace thread.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 bg-secondary rounded-md text-xs font-mono max-h-[160px] overflow-auto border border-border">
                {this.state.error?.stack || this.state.error?.toString() || 'Unknown Javascript exception.'}
              </div>
              <div className="flex justify-center">
                <Button size="sm" onClick={this.handleReload}>
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Reload Workspace
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
