import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar.js';
import Navbar from './Navbar.js';

/**
 * Root layout shell for all authenticated workspace pages.
 * Composes the fixed Sidebar and sticky Navbar around the page Outlet.
 */
export default function DashboardLayout() {
  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar />

      {/* Right column — navbar + scrollable page content */}
      <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
        <Navbar />

        <main className="flex-1 overflow-y-auto p-6">
          <div className="mx-auto max-w-[1400px] w-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
