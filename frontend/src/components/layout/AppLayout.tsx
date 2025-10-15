import { Outlet } from 'react-router-dom';
import { useCallback, useState } from 'react';
import { AppShell } from './AppShell';
import { Header } from './Header';
import { Sidebar } from './Sidebar';

export function AppLayout() {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = useCallback(() => {
    setSidebarOpen((prev) => !prev);
  }, []);

  const closeSidebar = useCallback(() => {
    setSidebarOpen(false);
  }, []);

  return (
    <AppShell
      header={<Header onToggleSidebar={toggleSidebar} />}
      sidebar={<Sidebar />}
      isSidebarOpen={isSidebarOpen}
      onCloseSidebar={closeSidebar}
    >
      <Outlet />
    </AppShell>
  );
}
