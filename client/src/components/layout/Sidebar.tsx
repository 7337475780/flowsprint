import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderKanban,
  ListTodo,
  Zap,
  Users,
  Settings,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react';
import { useUIStore } from '../../store/useUIStore.js';
import { cn } from '../../lib/utils.js';

const NAV = [
  { label: 'Dashboard', href: '/dashboard',  icon: LayoutDashboard },
  { label: 'Projects',  href: '/projects',   icon: FolderKanban    },
  { label: 'Tasks',     href: '/tasks',       icon: ListTodo        },
  { label: 'Sprints',   href: '/sprints',     icon: Zap             },
  { label: 'Team',      href: '/team',        icon: Users           },
  { label: 'Settings',  href: '/settings',    icon: Settings        },
];

export default function Sidebar() {
  const location               = useLocation();
  const { sidebarOpen, toggleSidebar } = useUIStore();

  return (
    <>
      {/* ─── Sidebar panel ─────────────────────────────────────────── */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-30 flex flex-col border-r bg-card transition-all duration-300',
          'md:relative md:translate-x-0',
          sidebarOpen ? 'w-60 translate-x-0' : '-translate-x-full md:translate-x-0 md:w-[68px]'
        )}
      >
        {/* Brand */}
        <div className="flex h-16 shrink-0 items-center justify-between border-b px-4">
          <Link to="/dashboard" className="flex items-center gap-2.5 min-w-0">
            <div className="shrink-0 p-1.5 bg-primary/10 text-primary rounded-lg">
              <Zap className="h-5 w-5 fill-current" />
            </div>
            {sidebarOpen && (
              <span className="font-heading font-extrabold text-base tracking-tight truncate">
                FlowSprint
              </span>
            )}
          </Link>
          {/* Mobile close */}
          <button
            onClick={toggleSidebar}
            className="p-1.5 rounded-lg hover:bg-secondary md:hidden"
            aria-label="Close sidebar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Navigation links */}
        <nav className="flex-1 overflow-y-auto px-2 py-4 space-y-0.5">
          {NAV.map(({ label, href, icon: Icon }) => {
            const active = location.pathname.startsWith(href);
            return (
              <Link
                key={href}
                to={href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  active
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                )}
              >
                <Icon className="h-4.5 w-4.5 shrink-0" />
                {sidebarOpen && <span className="truncate">{label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Desktop collapse toggle */}
        <div className="hidden md:flex border-t p-3 justify-between items-center">
          <button
            onClick={toggleSidebar}
            className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
            aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            {sidebarOpen
              ? <ChevronLeft className="h-4 w-4" />
              : <ChevronRight className="h-4 w-4" />
            }
          </button>
          {sidebarOpen && (
            <span className="text-2xs font-mono text-muted-foreground">v1.0</span>
          )}
        </div>
      </aside>

      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/40 backdrop-blur-sm md:hidden"
          onClick={toggleSidebar}
        />
      )}
    </>
  );
}
