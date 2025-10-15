import type { PropsWithChildren, ReactNode } from 'react';

interface AppShellProps extends PropsWithChildren {
  header: ReactNode;
  sidebar: ReactNode;
  isSidebarOpen: boolean;
  onCloseSidebar: () => void;
}

export function AppShell({ header, sidebar, children, isSidebarOpen, onCloseSidebar }: AppShellProps) {
  return (
    <div className="min-h-screen bg-surface-muted text-neutral-900">
      <div className="flex min-h-screen flex-col">
        <header className="border-b border-neutral-200 bg-surface shadow-sm">{header}</header>
        <div className="flex flex-1">
          <aside className="hidden w-64 border-r border-neutral-200 bg-surface lg:block">{sidebar}</aside>
          <main className="flex-1 px-6 py-6 lg:px-12 lg:py-10">
            <div className="mx-auto w-full max-w-6xl space-y-6">{children}</div>
          </main>
        </div>
      </div>

      {isSidebarOpen ? (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="w-72 max-w-[80vw] border-r border-neutral-200 bg-surface shadow-xl">
            {sidebar}
          </div>
          <button
            type="button"
            aria-label="Close navigation"
            className="flex-1 bg-neutral-900/40"
            onClick={onCloseSidebar}
          />
        </div>
      ) : null}
    </div>
  );
}
