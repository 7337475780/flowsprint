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
  { label: 'Projects', href: '/projects', icon: FolderKanban },
  { label: 'Tasks', href: '/tasks', icon: ListTodo },
  { label: 'Sprints', href: '/sprints', icon: Zap },
  { label: 'Team', href: '/team', icon: Users },
  { label: 'Analytics', href: '/analytics', icon: TrendingUp },
];

const NAV_BOTTOM = [
  { label: 'Settings', href: '/settings', icon: Settings },
];

export default function Sidebar() {
  const location = useLocation();
  const { sidebarOpen, toggleSidebar, setSidebarOpen } = useUIStore();

  // Auto-close on mobile when navigating
  useEffect(() => {
    const handleResizeClose = () => {
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      }
    };
    handleResizeClose();
    window.addEventListener('resize', handleResizeClose);
    return () => window.removeEventListener('resize', handleResizeClose);
  }, [location.pathname, setSidebarOpen]);

  const collapsed = !sidebarOpen;

  const NavItem = ({ label, href, icon: Icon }: { label: string; href: string; icon: React.ElementType }) => {
    const active = location.pathname === href || location.pathname.startsWith(href + '/');
    return (
      <Link
        to={href}
        title={collapsed ? label : undefined}
        aria-label={label}
        className={cn(
          'flex items-center h-10 rounded-xl transition-all duration-300 relative group select-none ease-out overflow-hidden',
          collapsed
            ? 'w-10 mx-auto justify-center px-0'
            : 'gap-3 px-3 w-full',
          active
            ? 'bg-gradient-to-r from-primary/10 to-transparent text-primary font-bold shadow-xs border border-primary/10'
            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50/50 dark:hover:bg-slate-900/50 hover:text-slate-900 dark:hover:text-white font-medium'
        )}
      >
        {active && (
          <span className="absolute left-0 top-2 bottom-2 w-1 bg-primary rounded-r-full" />
        )}
        <Icon
          className={cn(
            'shrink-0 h-[18px] w-[18px] transition-transform duration-300 group-hover:scale-110',
            active ? 'text-primary' : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-900 dark:group-hover:text-white'
          )}
        />
        {!collapsed && (
          <span className="text-sm tracking-tight truncate">{label}</span>
        )}

        {/* Premium Floating Tooltip — Only rendered in icon-only layout */}
        {collapsed && (
          <span
            className={cn(
              'pointer-events-none absolute left-[calc(100%+12px)] top-1/2 -translate-y-1/2',
              'px-2.5 py-1.5 rounded-lg text-xs font-bold tracking-wide whitespace-nowrap',
              'bg-slate-950 text-white border border-slate-800 shadow-xl backdrop-blur-md',
              'opacity-0 scale-95 origin-left group-hover:opacity-100 group-hover:scale-100 transition-all duration-300 z-50'
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
      {/* ─── Sidebar Element ─────────────────────────────────────────── */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex flex-col border-r bg-white/80 dark:bg-card/75 backdrop-blur-md transition-all duration-300 ease-in-out shrink-0',
          'border-slate-200/50 dark:border-slate-800/50 shadow-sm dark:shadow-none',
          'md:relative md:translate-x-0',
          sidebarOpen
            ? 'w-[240px] translate-x-0'
            : '-translate-x-full md:translate-x-0 md:w-16'
        )}
      >
        {/* ── Brand Header Row ── */}
        <div
          className={cn(
            'flex h-16 shrink-0 items-center border-b border-slate-100 dark:border-slate-900 transition-all duration-300',
            collapsed ? 'justify-center px-0' : 'px-5 gap-2 justify-between'
          )}
        >
          <Link
            to="/dashboard"
            className={cn(
              'flex items-center min-w-0',
              collapsed ? 'justify-center' : 'gap-2.5'
            )}
            title="FlowSprint"
          >
            <div className="shrink-0 p-1 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm transition-transform duration-300 hover:rotate-6">
              <svg
                viewBox="0 0 120 120"
                className="h-[22px] w-[22px]"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <linearGradient id="sideBottomGrad" x1="0" y1="1" x2="1" y2="0">
                    <stop offset="0%" stopColor="#1D4ED8" />
                    <stop offset="100%" stopColor="#3b82f6" />
                  </linearGradient>
                  <linearGradient id="sideMiddleGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#0EA5E9" />
                    <stop offset="100%" stopColor="#38bdf8" />
                  </linearGradient>
                  <linearGradient id="sideTopGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#2563EB" />
                    <stop offset="100%" stopColor="#1D4ED8" />
                  </linearGradient>
                </defs>
                <path
                  d="M15 95C24 62 38 58 48 58C62 58 62 84 78 84"
                  stroke="url(#sideBottomGrad)"
                  strokeWidth="18"
                  strokeLinecap="round"
                />
                <path
                  d="M28 55C35 42 45 38 58 38H72"
                  stroke="url(#sideMiddleGrad)"
                  strokeWidth="14"
                  strokeLinecap="round"
                />
                <path
                  d="M20 35C28 15 42 12 58 12H85"
                  stroke="url(#sideTopGrad)"
                  strokeWidth="16"
                  strokeLinecap="round"
                />
                <path
                  d="M84 2L108 18L84 34"
                  fill="url(#sideTopGrad)"
                />
              </svg>
            </div>
            {!collapsed && (
              <span className="font-bold text-slate-900 dark:text-white text-base tracking-tight truncate">
                FlowSprint
              </span>
            )}
          </Link>

          {/* Mobile close trigger */}
          {!collapsed && (
            <button
              onClick={toggleSidebar}
              className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors md:hidden shrink-0 active:scale-95 border border-transparent hover:border-slate-200 dark:hover:border-slate-800"
              aria-label="Close sidebar"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* ── Main Navigation List ── */}
        <nav
          className={cn(
            'flex-1 overflow-y-auto py-5 scrollbar-none space-y-1.5',
            collapsed ? 'px-2' : 'px-4'
          )}
        >
          {NAV_PRIMARY.map((item) => (
            <NavItem key={item.href} {...item} />
          ))}
        </nav>

        {/* ── Footer / Pinned Content Block ── */}
        <div
          className={cn(
            'shrink-0 border-t border-slate-100 dark:border-slate-900 py-4 space-y-1.5',
            collapsed ? 'px-2' : 'px-4'
          )}
        >
          {NAV_BOTTOM.map((item) => (
            <NavItem key={item.href} {...item} />
          ))}

          {/* Layout Collapse Controller button */}
          <div
            className={cn(
              'hidden md:flex items-center pt-2',
              collapsed ? 'justify-center' : 'justify-between pl-1'
            )}
          >
            <button
              onClick={toggleSidebar}
              className="h-8 w-8 flex items-center justify-center rounded-xl border border-transparent hover:border-slate-200/60 dark:hover:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all duration-200 active:scale-95"
              aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {collapsed
                ? <ChevronRight className="h-4 w-4" />
                : <ChevronLeft className="h-4 w-4" />
              }
            </button>
            {!collapsed && (
              <span className="text-[10px] font-mono tracking-wider font-semibold text-slate-400 dark:text-slate-600 uppercase mr-1">
                v1.0
              </span>
            )}
          </div>
        </div>
      </aside>

      {/* Modern Blended Mobile Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/30 dark:bg-black/60 backdrop-blur-sm md:hidden animate-in fade-in duration-200"
          onClick={toggleSidebar}
        />
      )}
    </>
  );
}