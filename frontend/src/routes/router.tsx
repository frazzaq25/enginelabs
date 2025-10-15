import { createBrowserRouter } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout';
import { DashboardPage } from './screens/DashboardPage';
import { HomePage } from './screens/HomePage';
import { SettingsPage } from './screens/SettingsPage';
import { RouteErrorBoundary } from './screens/RouteErrorBoundary';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    errorElement: <RouteErrorBoundary />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'dashboard', element: <DashboardPage /> },
      { path: 'settings', element: <SettingsPage /> }
    ]
  }
]);
