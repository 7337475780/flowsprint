import {
  CheckCircle2,
  Zap,
  MessageSquare,
  ShieldCheck,
} from "lucide-react";
import { cn } from "../../../lib/utils.js";

export default function ActivityLog() {
  const activities = [
    {
      id: "act-1",
      action: "completed",
      title: "Resolved task ticket",
      details:
        'Moved task "FS-104: Design landing dashboard mockup" to completed.',
      time: "35 minutes ago",
      icon: CheckCircle2,
      theme: "text-emerald-400 bg-emerald-500/10 border-emerald-500/25",
    },
    {
      id: "act-2",
      action: "sprint",
      title: "Started new sprint milestone",
      details:
        'Started sprint "Active Sprint 4: Dashboard Integrations".',
      time: "3 hours ago",
      icon: Zap,
      theme: "text-amber-500 bg-amber-500/10 border-amber-500/25",
    },
    {
      id: "act-3",
      action: "comment",
      title: "Added task discussion log",
      details:
        'Commented on task "FS-12: Integrate file attachments drawer module".',
      time: "Yesterday at 4:32 PM",
      icon: MessageSquare,
      theme: "text-sky-400 bg-sky-500/10 border-sky-500/25",
    },
    {
      id: "act-4",
      action: "security",
      title: "Successful identity login",
      details: "Authenticated successfully from Windows desktop session.",
      time: "2 days ago",
      icon: ShieldCheck,
      theme: "text-indigo-400 bg-indigo-500/10 border-indigo-500/25",
    },
  ];

  return (
    <div className="space-y-4 rounded-2xl border bg-card/65 p-6 shadow-sm backdrop-blur-sm">
      <div>
        <h3 className="select-none font-heading text-sm font-extrabold tracking-tight text-foreground">
          Activity Summary & Changelog
        </h3>
        <p className="mt-1 text-xs font-medium text-muted-foreground">
          Review recent task completions, sprint updates, and system logins.
        </p>
      </div>

      <div className="relative space-y-4 pt-1 before:absolute before:bottom-2 before:left-[17.5px] before:top-2 before:w-0.5 before:bg-secondary/70">
        {activities.map((act) => {
          const Icon = act.icon;

          return (
            <div
              key={act.id}
              className="group relative flex items-start gap-4 pl-0.5"
            >
              <div
                className={cn(
                  "z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border shadow-sm transition-transform duration-200 group-hover:scale-110",
                  act.theme
                )}
              >
                <Icon className="h-4 w-4" />
              </div>

              <div className="min-w-0 flex-1">
                <span className="block truncate text-sm font-bold leading-tight text-foreground transition-colors duration-200 group-hover:text-primary">
                  {act.title}
                </span>

                <p className="mt-1 max-w-xl text-xs leading-normal text-muted-foreground">
                  {act.details}
                </p>

                <span className="mt-1 block font-mono text-[10px] text-muted-foreground">
                  {act.time}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}