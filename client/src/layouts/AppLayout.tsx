import { Outlet, Link, useLocation } from 'react-router-dom';
import { useUIStore } from '../store/useUIStore.js';
import { Button } from '../components/ui/Button.js';
import { 
  LayoutDashboard, 
  ListTodo, 
  Settings, 
  Menu, 
  X, 
  Sun, 
  Moon, 
  ChevronLeft, 
  ChevronRight,
  Zap,
  ChevronDown
} from 'lucide-react';

export default function AppLayout() {
  const location = useLocation();
  const { sidebarOpen, toggleSidebar, theme, toggleTheme } = useUIStore();

  const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Tasks Backlog', href: '/tasks', icon: ListTodo },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/': return 'Dashboard';
      case '/tasks': return 'Tasks Backlog';
      case '/settings': return 'Settings';
      default: return 'Workspace';
    }
  };

  return (
    <div className="min-h-screen flex bg-background text-foreground transition-colors duration-200">
      
      {/* 1. Sidebar Panel */}
      <aside 
        className={`fixed inset-y-0 left-0 z-20 flex flex-col w-64 border-r bg-card transition-transform duration-300 md:translate-x-0 md:static ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:w-20'
        }`}
      >
        {/* Sidebar Header Brand Area */}
        <div className="h-16 flex items-center justify-between px-4 border-b">
          <Link to="/" className="flex items-center gap-2 font-heading font-extrabold text-lg text-primary tracking-tight">
            <div className="p-1.5 bg-primary/10 text-primary rounded-lg">
              <Zap className="h-5 w-5 fill-current" />
            </div>
            {sidebarOpen && <span className="animate-pulse-subtle">FlowSprint</span>}
          </Link>
          
          {/* Mobile close button only */}
          <button className="p-1.5 rounded-lg md:hidden hover:bg-secondary" onClick={toggleSidebar}>
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Sidebar Nav Links */}
        <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors group ${
                  isActive 
                    ? 'bg-primary text-primary-foreground' 
                    : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                }`}
              >
                <Icon className={`h-5 w-5 shrink-0 ${isActive ? '' : 'text-muted-foreground group-hover:text-foreground'}`} />
                {sidebarOpen && <span>{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer collapse handle (Desktop only) */}
        <div className="hidden md:flex p-4 border-t items-center justify-between">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleSidebar} 
            className="h-8 w-8 hover:bg-secondary rounded-lg"
          >
            {sidebarOpen ? <ChevronLeft className="h-4.5 w-4.5" /> : <ChevronRight className="h-4.5 w-4.5" />}
          </Button>
          {sidebarOpen && <span className="text-xs text-muted-foreground font-mono">v1.0.0-MVP</span>}
        </div>
      </aside>

      {/* Backdrop overlay for mobiles */}
      {sidebarOpen && (
        <div 
          onClick={toggleSidebar} 
          className="fixed inset-0 z-10 bg-black/40 md:hidden backdrop-blur-xs transition-opacity duration-300"
        />
      )}

      {/* 2. Content Container */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Navbar */}
        <header className="h-16 flex items-center justify-between px-4 border-b bg-card">
          <div className="flex items-center gap-3">
            {/* Hamburger (Mobile/Desktop collapsed toggle) */}
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleSidebar} 
              className="h-9 w-9 hover:bg-secondary md:hidden"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <span className="text-sm text-muted-foreground hidden md:inline">Workspace /</span>
            <span className="text-sm font-semibold tracking-tight">{getPageTitle()}</span>
          </div>

          <div className="flex items-center gap-4">
            {/* Dark mode switcher */}
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleTheme} 
              className="h-9 w-9 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg"
              title="Toggle Theme"
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>

            {/* Profile Dropdown indicator */}
            <div className="flex items-center gap-2.5 pl-3 border-l h-8 cursor-pointer group">
              <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                AM
              </div>
              <div className="hidden sm:block text-left">
                <span className="text-xs font-semibold block leading-tight group-hover:text-primary transition-colors">Alex Mercer</span>
                <span className="text-3xs text-muted-foreground block leading-tight">Project Owner</span>
              </div>
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
            </div>
          </div>
        </header>

        {/* Router Outlet for page injection */}
        <main className="flex-1 p-6 overflow-y-auto max-w-[1440px] mx-auto w-full">
          <Outlet />
        </main>
      </div>

    </div>
  );
}
