import { useEffect } from 'react';
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
  TrendingUp,
} from 'lucide-react';
import { useUIStore } from '../../store/useUIStore.js';
import { cn } from '../../lib/utils.js';

const NAV_PRIMARY = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Projects',  href: '/projects',  icon: FolderKanban    },
  { label: 'Tasks',     href: '/tasks',      icon: ListTodo        },
  { label: 'Sprints',   href: '/sprints',    icon: Zap             },
  { label: 'Team',      href: '/team',       icon: Users           },
  { label: 'Analytics', href: '/analytics',  icon: TrendingUp      },
];

const NAV_BOTTOM = [
  { label: 'Settings', href: '/settings', icon: Settings },
];

export default function Sidebar() {
  const location = useLocation();
  const { sidebarOpen, toggleSidebar, setSidebarOpen } = useUIStore();

  // Auto-close on mobile when navigating
  useEffect(() => {
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  }, [location.pathname, setSidebarOpen]);

  // Binary state — NEVER in-between: either 220px expanded or 64px icon-only
  const collapsed = !sidebarOpen;

  const NavItem = ({ label, href, icon: Icon }: { label: string; href: string; icon: React.ElementType }) => {
    const active = location.pathname === href || location.pathname.startsWith(href + '/');
    return (
      <Link
        to={href}
        title={collapsed ? label : undefined}
        aria-label={label}
        className={cn(
          // h-10 = 40px per spec, px-3 = 12px, rounded-lg = 8px
          'flex items-center h-10 rounded-lg transition-all duration-150 relative group',
          collapsed
            ? 'w-10 mx-auto justify-center px-0'
            : 'gap-2.5 px-3 w-full',
          active
            ? [
                // Active: purple bg + left 3px brand border
                'bg-primary/15 text-white font-semibold',
                !collapsed && 'border-l-[3px] border-primary pl-[9px]',
              ]
            : 'text-muted-foreground hover:bg-white/5 hover:text-foreground'
        )}
      >
        <Icon
          className={cn(
            'shrink-0 transition-colors',
            collapsed ? 'h-[18px] w-[18px]' : 'h-[18px] w-[18px]',
            active ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'
          )}
        />
        {!collapsed && (
          <span className="text-sm truncate leading-none">{label}</span>
        )}

        {/* Tooltip on hover — icon-only mode */}
        {collapsed && (
          <span
            className={cn(
              'pointer-events-none absolute left-[calc(100%+8px)] top-1/2 -translate-y-1/2',
              'px-2 py-1 rounded-md text-xs font-medium whitespace-nowrap',
              'bg-secondary border border-border text-foreground shadow-lg',
              'opacity-0 group-hover:opacity-100 transition-opacity duration-150 z-50'
            )}
          >
            {label}
          </span>
        )}
      </Link>
    );
  };

  return (
    <>
      {/* ─── Sidebar ─────────────────────────────────────────────────── */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-30 flex flex-col border-r bg-card transition-all duration-300 shrink-0',
          'md:relative md:translate-x-0',
          sidebarOpen
            ? 'w-[220px] translate-x-0'
            : '-translate-x-full md:translate-x-0 md:w-16'
        )}
      >
        {/* ── Brand row: 64px height, vertically centered ── */}
        <div
          className={cn(
            'flex h-16 shrink-0 items-center border-b transition-all duration-300',
            collapsed ? 'justify-center px-0' : 'px-4 gap-2 justify-between'
          )}
        >
          <Link
            to="/dashboard"
            className={cn(
              'flex items-center min-w-0',
              collapsed ? 'justify-center' : 'gap-2'
            )}
            title="FlowSprint"
          >
            <div className="shrink-0 p-1.5 bg-primary/10 text-primary rounded-lg">
              <Zap className="h-5 w-5 fill-current" />
            </div>
            {!collapsed && (
              <span className="font-heading font-extrabold text-base tracking-tight truncate leading-none">
                FlowSprint
              </span>
            )}
          </Link>

          {/* Mobile close — only when sidebar is open */}
          {!collapsed && (
            <button
              onClick={toggleSidebar}
              className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors md:hidden shrink-0"
              aria-label="Close sidebar"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* ── Primary nav ── */}
        <nav
          className={cn(
            'flex-1 overflow-y-auto py-4 scrollbar-none',
            collapsed ? 'px-0 space-y-1' : 'px-3 space-y-0.5'
          )}
        >
          {NAV_PRIMARY.map((item) => (
            <NavItem key={item.href} {...item} />
          ))}
        </nav>

        {/* ── Bottom pinned: Settings ── */}
        <div
          className={cn(
            'shrink-0 border-t py-3',
            collapsed ? 'px-0 space-y-1' : 'px-3 space-y-0.5'
          )}
        >
          {NAV_BOTTOM.map((item) => (
            <NavItem key={item.href} {...item} />
          ))}

          {/* Collapse / expand toggle */}
          <div
            className={cn(
              'hidden md:flex items-center pt-2',
              collapsed ? 'justify-center' : 'justify-between px-0'
            )}
          >
            <button
              onClick={toggleSidebar}
              className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
              aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {collapsed
                ? <ChevronRight className="h-4 w-4" />
                : <ChevronLeft className="h-4 w-4" />
              }
            </button>
            {!collapsed && (
              <span className="text-[10px] font-mono text-muted-foreground">v1.0</span>
            )}
          </div>
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
