import { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Menu, Sun, Moon, ChevronDown, LogOut, User } from 'lucide-react';
import { toast } from 'sonner';
import { useUIStore } from '../../store/useUIStore.js';
import { useAuthStore } from '../../store/authStore.js';
import { cn } from '../../lib/utils.js';
import NotificationBell from '../../features/notifications/components/NotificationBell.js';

const PAGE_TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/projects':  'Projects',
  '/tasks':     'Tasks',
  '/sprints':   'Sprints',
  '/team':      'Team',
  '/settings':  'Settings',
};

export default function Navbar() {
  const location   = useLocation();
  const navigate   = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef    = useRef<HTMLDivElement>(null);

  const { toggleSidebar, theme, toggleTheme } = useUIStore();
  const { user, logout } = useAuthStore();

  const pageTitle = PAGE_TITLES[location.pathname] || 'Workspace';

  const initials = user?.name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'U';

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => {
    logout();
    toast.success('Signed out successfully');
    navigate('/login', { replace: true });
  };

  return (
    <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center justify-between border-b bg-card px-4 gap-4">

      {/* Left — hamburger + breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors md:hidden"
          aria-label="Toggle sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-1.5 text-sm">
          <span className="text-muted-foreground hidden sm:inline">Workspace</span>
          <span className="text-muted-foreground hidden sm:inline">/</span>
          <span className="font-semibold">{pageTitle}</span>
        </div>
      </div>

      {/* Right — controls */}
      <div className="flex items-center gap-1">

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun className="h-4.5 w-4.5" /> : <Moon className="h-4.5 w-4.5" />}
        </button>

        {/* Notification bell */}
        <NotificationBell />

        {/* Profile dropdown */}
        <div className="relative ml-1" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className={cn(
              'flex items-center gap-2 pl-2.5 pr-2 py-1.5 rounded-lg border',
              'hover:bg-secondary transition-colors text-sm',
              menuOpen && 'bg-secondary'
            )}
            aria-haspopup="true"
            aria-expanded={menuOpen}
          >
            <div className="h-7 w-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0">
              {initials}
            </div>
            <div className="hidden sm:block text-left leading-tight">
              <span className="block text-xs font-semibold max-w-[100px] truncate">{user?.name}</span>
              <span className="block text-2xs text-muted-foreground capitalize">{user?.role}</span>
            </div>
            <ChevronDown className={cn('h-3.5 w-3.5 text-muted-foreground transition-transform', menuOpen && 'rotate-180')} />
          </button>

          {/* Dropdown menu */}
          {menuOpen && (
            <div className="absolute right-0 top-full mt-2 w-44 rounded-xl border bg-card shadow-lg py-1.5 z-50">
              <button
                onClick={() => { navigate('/settings'); setMenuOpen(false); }}
                className="flex w-full items-center gap-2.5 px-3 py-2 text-sm hover:bg-secondary transition-colors"
              >
                <User className="h-4 w-4 text-muted-foreground" />
                Profile
              </button>
              <div className="my-1 border-t" />
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
