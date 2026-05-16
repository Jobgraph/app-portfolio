import { useState, useLayoutEffect, useCallback } from 'react';
import { FolderKanban, PlusCircle, BarChart3, Pencil, HelpCircle, User, PanelLeftClose } from 'lucide-react';
import type { View } from '../../lib/types';

interface SidebarProps {
  currentView: View;
  onNavigate: (view: View) => void;
  projectCount: number;
  collapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
}

const NAV_ITEMS: { view: View; label: string; icon: typeof FolderKanban }[] = [
  { view: 'portfolio', label: 'Portfolio', icon: FolderKanban },
  { view: 'submit', label: 'Submit Project', icon: PlusCircle },
  { view: 'edit', label: 'Edit Portfolio', icon: Pencil },
  { view: 'analytics', label: 'Analytics', icon: BarChart3 },
];

const FOOTER_ITEMS: { id: string; label: string; icon: typeof HelpCircle }[] = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'help', label: 'Help', icon: HelpCircle },
];

export function Sidebar({ currentView, onNavigate, projectCount, collapsed: controlledCollapsed, onCollapsedChange }: SidebarProps) {
  const [internalCollapsed, setInternalCollapsed] = useState(false);
  const collapsed = controlledCollapsed ?? internalCollapsed;

  useLayoutEffect(() => {
    const stored = localStorage.getItem('jg-portfolio-sidebar');
    if (stored === 'true') {
      setInternalCollapsed(true);
      onCollapsedChange?.(true);
    }
  }, [onCollapsedChange]);

  const toggle = useCallback(() => {
    const next = !collapsed;
    setInternalCollapsed(next);
    onCollapsedChange?.(next);
    localStorage.setItem('jg-portfolio-sidebar', next.toString());
  }, [collapsed, onCollapsedChange]);

  if (collapsed) {
    return (
      <button
        onClick={toggle}
        className="absolute top-[4.75rem] left-2 z-30 p-2 rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted shadow-sm transition-colors"
      >
        <PanelLeftClose className="h-4 w-4 rotate-180" />
      </button>
    );
  }

  return (
    <aside className="w-56 border-r border-border bg-card flex flex-col h-full shrink-0">
      <div className="p-3 flex items-center justify-between">
        <span className="text-xs font-semibold text-foreground">Navigation</span>
        <button onClick={toggle} className="p-1 rounded text-muted-foreground hover:text-foreground transition-colors">
          <PanelLeftClose className="h-3.5 w-3.5" />
        </button>
      </div>
      <nav className="flex-1 py-1">
        {NAV_ITEMS.map(({ view, label, icon: Icon }) => {
          const isActive = currentView === view || (currentView === 'detail' && view === 'portfolio');
          return (
            <button
              key={view}
              onClick={() => onNavigate(view)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-muted text-foreground'
                  : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
              }`}
            >
              <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-foreground' : 'text-muted-foreground/60'}`} />
              <span className="truncate">{label}</span>
              {view === 'portfolio' && (
                <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">
                  {projectCount}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="border-t border-border py-2">
        {FOOTER_ITEMS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            className="w-full flex items-center gap-3 px-4 py-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </button>
        ))}
      </div>

      {/* User card */}
      <div className="p-3 border-t border-border">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-zinc-700 to-zinc-900 flex items-center justify-center text-white text-[10px] font-bold shrink-0">
            U
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-foreground truncate">User</p>
            <p className="text-[10px] text-muted-foreground truncate">user@organisation.gov.uk</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
