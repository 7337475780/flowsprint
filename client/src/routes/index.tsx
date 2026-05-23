import { createBrowserRouter } from 'react-router-dom';
import AppLayout from '../layouts/AppLayout.js';
import Dashboard from '../pages/Dashboard.js';
import Tasks from '../pages/Tasks.js';
import Settings from '../pages/Settings.js';
import NotFound from '../pages/NotFound.js';

/**
 * Modern declarative router configuration for FlowSprint.
 * Houses the AppLayout shell as the parent and pages as active sub-outlets.
 */
export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    errorElement: <NotFound />, // React Router catch-all error fallback
    children: [
      {
        index: true,
        element: <Dashboard />,
      },
      {
        path: 'tasks',
        element: <Tasks />,
      },
      {
        path: 'settings',
        element: <Settings />,
      },
      {
        path: '*',
        element: <NotFound />,
      },
    ],
  },
]);
