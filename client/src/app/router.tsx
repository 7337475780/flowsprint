import { createBrowserRouter } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout.js';
import ProtectedRoute from '../components/common/ProtectedRoute.js';
import Loader from '../components/common/Loader.js';
import NotFoundPage from '../pages/NotFoundPage.js';

// Lazy-load feature pages to keep the initial bundle lean
const LoginPage    = lazy(() => import('../features/auth/pages/LoginPage.js'));
const RegisterPage = lazy(() => import('../features/auth/pages/RegisterPage.js'));
const DashboardPage = lazy(() => import('../pages/DashboardPage.js'));
const ProjectsPage  = lazy(() => import('../pages/ProjectsPage.js'));
const TasksPage     = lazy(() => import('../pages/TasksPage.js'));
const SprintsPage   = lazy(() => import('../pages/SprintsPage.js'));
const TeamPage      = lazy(() => import('../pages/TeamPage.js'));
const SettingsPage  = lazy(() => import('../pages/SettingsPage.js'));
const ProfilePage   = lazy(() => import('../pages/ProfilePage.js'));
const NotificationsPage = lazy(() => import('../pages/NotificationsPage.js'));
const AnalyticsPage = lazy(() => import('../pages/AnalyticsPage.js'));

const wrap = (el: React.ReactNode) => (
  <Suspense fallback={<Loader fullscreen />}>{el}</Suspense>
);

export const router = createBrowserRouter(
  [
    // ─── Public auth routes ───────────────────────────────────────────────
    {
      path: '/login',
      element: wrap(<LoginPage />),
    },
    {
      path: '/register',
      element: wrap(<RegisterPage />),
    },

    // ─── Protected workspace ─────────────────────────────────────────────
    {
      element: (
        <ProtectedRoute>
          <DashboardLayout />
        </ProtectedRoute>
      ),
      children: [
        { path: '/',          element: wrap(<DashboardPage />) },
        { path: '/dashboard', element: wrap(<DashboardPage />) },
        { path: '/projects',  element: wrap(<ProjectsPage />) },
        { path: '/tasks',     element: wrap(<TasksPage />) },
        { path: '/sprints',   element: wrap(<SprintsPage />) },
        { path: '/team',      element: wrap(<TeamPage />) },
        { path: '/settings',  element: wrap(<SettingsPage />) },
        { path: '/profile',   element: wrap(<ProfilePage />) },
        { path: '/notifications', element: wrap(<NotificationsPage />) },
        { path: '/analytics', element: wrap(<AnalyticsPage />) },
      ],
    },

    // ─── 404 fallback ────────────────────────────────────────────────────
    { path: '*', element: <NotFoundPage /> },
  ],
  {
    future: {
      v7_startTransition: true,
      v7_relativeSplatPath: true,
    } as any,
  }
);
