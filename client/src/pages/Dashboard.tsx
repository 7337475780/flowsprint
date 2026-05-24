import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card.js';
import { Button } from '../components/ui/Button.js';
import {
  Activity,
  TrendingUp,
  CheckCircle2,
  Clock,
  ListTodo,
  Plus,
  Flame,
  Layers
} from 'lucide-react';

export default function Dashboard() {
  const stats = [
    { label: "Active Sprints", value: "2", icon: Flame, change: "Sprint 4 & Sprint 5", color: "text-amber-500 bg-amber-500/10" },
    { label: "Total Tasks", value: "48", icon: ListTodo, change: "12 completed this week", color: "text-indigo-500 bg-indigo-500/10" },
    { label: "Completed", value: "68%", icon: CheckCircle2, change: "+8% from last sprint", color: "text-emerald-500 bg-emerald-500/10" },
    { label: "Blocked Items", value: "3", icon: Clock, change: "Require review", color: "text-rose-500 bg-rose-500/10" },
  ];

  const recentActivities = [
    { id: 1, user: "Alex Mercer", action: "moved", target: "FS-129: Wireframe Auth Shell", to: "In Review", time: "10m ago" },
    { id: 2, user: "Sarah Connor", action: "created", target: "FS-134: Setup TanStack Query Caching", to: "", time: "42m ago" },
    { id: 3, user: "Bruce Wayne", action: "blocked", target: "FS-110: Integrate Payment Webhooks", to: "API down", time: "2h ago" },
    { id: 4, user: "Tony Stark", action: "completed", target: "FS-92: Handcraft Button and Card Atomic Components", to: "", time: "4h ago" },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 bg-gradient-to-b from-primary/5 via-background/10 to-background/5">
      {/* Upper header action area */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between bg-card p-4 border rounded-2xl shadow-sm glassmorphism">
        <div>
          <h1 className="font-heading text-3xl font-bold tracking-tight">FlowSprint Dashboard</h1>
          <p className="text-muted-foreground mt-1 text-sm">Welcome back. Here is your team's velocity and planning workspace overview.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <Layers className="mr-2 h-4 w-4" />
            Manage Sprints
          </Button>
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Create Task
          </Button>
        </div>
      </div>

      {/* Grid of stats */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <Card key={i} className="glassmorphism shadow-xl transition-transform hover:scale-105 border-transparent bg-card/60">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <span className="text-sm font-medium text-muted-foreground">{stat.label}</span>
                <div className={`p-2 rounded-lg ${stat.color}`}>
                  <Icon className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-heading">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3 text-emerald-500 inline" />
                  {stat.change}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Columns layout */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Core project status card */}
        <Card className="col-span-1 md:col-span-2 glassmorphism">
          <CardHeader>
            <CardTitle>Sprint Progress Metrics</CardTitle>
            <CardDescription>Velocity mapping and workload distribution for active sprint cycle.</CardDescription>
          </CardHeader>
          <CardContent className="h-[240px] flex flex-col justify-between">
            {/* Visual Progress meter */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm font-medium">
                <span>Sprint 4 (Core Infrastructure)</span>
                <span className="text-primary font-bold">76% Done</span>
              </div>
              <div className="w-full bg-secondary h-2.5 rounded-full overflow-hidden">
                <div className="bg-primary h-full rounded-full transition-all duration-500" style={{ width: '76%' }}></div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm font-medium">
                <span>Sprint 5 (Auth & Billing Integration)</span>
                <span className="text-amber-500 font-bold">32% Done</span>
              </div>
              <div className="w-full bg-secondary h-2.5 rounded-full overflow-hidden">
                <div className="bg-amber-500 h-full rounded-full transition-all duration-500" style={{ width: '32%' }}></div>
              </div>
            </div>

            <div className="border-t pt-4 grid grid-cols-3 text-center gap-2 mt-4">
              <div>
                <span className="block text-xl font-bold font-heading">24</span>
                <span className="text-xs text-muted-foreground">To Do</span>
              </div>
              <div className="border-x">
                <span className="block text-xl font-bold font-heading text-amber-500">11</span>
                <span className="text-xs text-muted-foreground">In Progress</span>
              </div>
              <div>
                <span className="block text-xl font-bold font-heading text-emerald-500">13</span>
                <span className="text-xs text-muted-foreground">Completed</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent activity card */}
        <Card className="glassmorphism shadow-xl transition-transform hover:scale-105">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Team Activity Stream
            </CardTitle>
            <CardDescription>Live action stream from colleagues across workspaces.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flow-root">
              <ul className="-mb-8">
                {recentActivities.map((act, idx) => (
                  <li key={act.id}>
                    <div className="relative pb-6">
                      {idx !== recentActivities.length - 1 ? (
                        <span className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-secondary" aria-hidden="true" />
                      ) : null}
                      <div className="relative flex space-x-3">
                        <div>
                          <span className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center text-xs font-semibold ring-8 ring-background">
                            {act.user.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-muted-foreground">
                            <span className="font-semibold text-foreground">{act.user}</span>{' '}
                            {act.action}{' '}
                            <span className="font-medium text-foreground hover:underline cursor-pointer">{act.target}</span>
                            {act.to ? <> to <span className="font-semibold text-primary">{act.to}</span></> : null}
                          </p>
                          <div className="text-2xs text-muted-foreground mt-0.5">{act.time}</div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
