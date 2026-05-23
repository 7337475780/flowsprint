import { Card, CardContent } from '../components/ui/Card.js';
import { Button } from '../components/ui/Button.js';
import { 
  Plus, 
  Search, 
  Filter, 
  ArrowUpDown, 
  User, 
  Calendar,
  AlertCircle
} from 'lucide-react';

interface Task {
  id: string;
  title: string;
  sprint: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'todo' | 'in_progress' | 'in_review' | 'done';
  assignee: string;
  dueDate: string;
}

export default function Tasks() {
  const tasks: Task[] = [
    { id: "FS-129", title: "Handcraft clean and custom app shell dashboard layout", sprint: "Sprint 4", priority: "high", status: "in_progress", assignee: "Alex Mercer", dueDate: "May 25, 2026" },
    { id: "FS-130", title: "Setup centralized error handling and response helper in Express TS", sprint: "Sprint 4", priority: "medium", status: "done", assignee: "Sarah Connor", dueDate: "May 22, 2026" },
    { id: "FS-131", title: "Validate environment variables using Zod schema on backend boot", sprint: "Sprint 4", priority: "high", status: "done", assignee: "Tony Stark", dueDate: "May 20, 2026" },
    { id: "FS-132", title: "Implement Zustand store for light/dark mode and sidebar persistent states", sprint: "Sprint 4", priority: "medium", status: "in_review", assignee: "Bruce Wayne", dueDate: "May 24, 2026" },
    { id: "FS-133", title: "Scaffold TanStack Query Client provider and custom hooks framework", sprint: "Sprint 4", priority: "high", status: "todo", assignee: "Tony Stark", dueDate: "May 28, 2026" },
    { id: "FS-134", title: "Formulate base theme and HSL global styles in tailwind.config", sprint: "Sprint 4", priority: "low", status: "done", assignee: "Alex Mercer", dueDate: "May 18, 2026" },
  ];

  const getPriorityStyles = (p: Task['priority']) => {
    switch (p) {
      case 'low': return 'bg-slate-500/10 text-slate-400 border border-slate-500/20';
      case 'medium': return 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20';
      case 'high': return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
      case 'urgent': return 'bg-rose-500/10 text-rose-400 border border-rose-500/20';
    }
  };

  const getStatusStyles = (s: Task['status']) => {
    switch (s) {
      case 'todo': return 'bg-neutral-800 text-neutral-400';
      case 'in_progress': return 'bg-amber-500/20 text-amber-500';
      case 'in_review': return 'bg-indigo-500/20 text-indigo-500';
      case 'done': return 'bg-emerald-500/20 text-emerald-500';
    }
  };

  const getStatusLabel = (s: Task['status']) => {
    return s.toUpperCase().replace('_', ' ');
  };

  return (
    <div className="space-y-6 animate-pulse-subtle">
      {/* Header section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold tracking-tight">Active Backlog</h1>
          <p className="text-muted-foreground mt-1 text-sm">Sprint board task list. Select individual items to view task details, files, and comments.</p>
        </div>
        <Button size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Create Task
        </Button>
      </div>

      {/* Control / Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3 p-4 bg-card rounded-lg border glassmorphism">
        <div className="relative w-full sm:flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Search by task title or code (e.g. FS-129)..." 
            className="w-full pl-9 pr-4 py-2 text-sm bg-secondary border rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button variant="outline" size="sm" className="w-full sm:w-auto">
            <Filter className="mr-2 h-4 w-4" />
            Filters
          </Button>
          <Button variant="outline" size="sm" className="w-full sm:w-auto">
            <ArrowUpDown className="mr-2 h-4 w-4" />
            Sort
          </Button>
        </div>
      </div>

      {/* Task List Grid */}
      <div className="space-y-3">
        {tasks.map((task) => (
          <Card key={task.id} className="glassmorphism cursor-pointer hover:border-primary/40">
            <CardContent className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
              {/* Title & Code */}
              <div className="flex-1 space-y-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-primary tracking-wider">{task.id}</span>
                  <span className="text-xs bg-secondary text-muted-foreground px-2 py-0.5 rounded font-medium">{task.sprint}</span>
                </div>
                <h3 className="font-medium text-sm md:text-base truncate">{task.title}</h3>
              </div>

              {/* Badges / Meta information */}
              <div className="flex flex-wrap items-center gap-3 text-xs md:text-sm">
                {/* Priority */}
                <span className={`px-2 py-0.5 rounded text-2xs font-bold uppercase tracking-wide ${getPriorityStyles(task.priority)}`}>
                  {task.priority}
                </span>

                {/* Status */}
                <span className={`px-2 py-0.5 rounded text-2xs font-bold uppercase tracking-wide ${getStatusStyles(task.status)}`}>
                  {getStatusLabel(task.status)}
                </span>

                {/* Assignee */}
                <div className="flex items-center gap-1.5 text-muted-foreground bg-secondary px-2.5 py-1 rounded-md">
                  <User className="h-3.5 w-3.5" />
                  <span className="text-2xs font-medium text-foreground">{task.assignee}</span>
                </div>

                {/* Due date */}
                <div className="flex items-center gap-1.5 text-muted-foreground bg-secondary px-2.5 py-1 rounded-md">
                  <Calendar className="h-3.5 w-3.5" />
                  <span className="text-2xs font-medium text-foreground">{task.dueDate}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Footer hint */}
      <div className="flex items-center gap-2 p-4 rounded-lg bg-amber-500/10 text-amber-500 text-xs border border-amber-500/20">
        <AlertCircle className="h-4 w-4 flex-shrink-0" />
        <span>You are currently viewing mockup backlog cards. Direct DB writes and filters will be integrated in Phase 2.</span>
      </div>
    </div>
  );
}
