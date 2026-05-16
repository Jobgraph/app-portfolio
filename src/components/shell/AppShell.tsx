import { useState, type ReactNode } from 'react';
import type { AppConfig } from '../../lib/config';
import type { View } from '../../lib/types';
import { Header } from './Header';
import { Sidebar } from './Sidebar';

interface AppShellProps {
  config: AppConfig;
  currentView: View;
  onNavigate: (view: View) => void;
  projectCount: number;
  children: ReactNode;
}

export function AppShell({ config, currentView, onNavigate, projectCount, children }: AppShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Header config={config} onMenuClick={() => setMobileOpen(!mobileOpen)} />

      <div className="flex flex-1 overflow-hidden relative">
        <div className="hidden md:flex">
          <Sidebar
            currentView={currentView}
            onNavigate={onNavigate}
            projectCount={projectCount}
            onCollapsedChange={setSidebarCollapsed}
          />
        </div>

        {mobileOpen && (
          <>
            <div
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <div className="fixed inset-y-0 left-0 z-50 md:hidden">
              <Sidebar
                currentView={currentView}
                onNavigate={(v) => { onNavigate(v); setMobileOpen(false); }}
                projectCount={projectCount}
              />
            </div>
          </>
        )}

        <main className={`flex-1 overflow-y-auto transition-[margin-left] duration-200 ease-in-out ${sidebarCollapsed ? 'md:ml-0' : ''}`}>
          {children}
        </main>
      </div>
    </div>
  );
}
