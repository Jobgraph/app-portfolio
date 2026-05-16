import { FolderKanban, PlusCircle, BarChart3, Settings } from 'lucide-react';
import type { View } from '../../lib/types';

interface SidebarProps {
  currentView: View;
  onNavigate: (view: View) => void;
  projectCount: number;
}

const NAV_ITEMS: { view: View; label: string; icon: typeof FolderKanban }[] = [
  { view: 'portfolio', label: 'Portfolio', icon: FolderKanban },
  { view: 'submit', label: 'Submit Project', icon: PlusCircle },
];

export function Sidebar({ currentView, onNavigate, projectCount }: SidebarProps) {
  return (
    <aside className="w-64 border-r border-border bg-card flex flex-col h-full shrink-0">
      <nav className="flex-1 py-2">
        {NAV_ITEMS.map(({ view, label, icon: Icon }) => (
          <button
            key={view}
            onClick={() => onNavigate(view)}
            className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors ${
              currentView === view || (currentView === 'detail' && view === 'portfolio')
                ? 'bg-primary/10 text-foreground'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span className="truncate">{label}</span>
            {view === 'portfolio' && (
              <span className="ml-auto text-xs px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">
                {projectCount}
              </span>
            )}
          </button>
        ))}
      </nav>

      <div className="p-3 border-t border-border space-y-1">
        <button className="w-full flex items-center gap-3 px-3 py-2 text-xs text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-muted">
          <BarChart3 className="h-3.5 w-3.5" />
          Analytics
        </button>
        <button className="w-full flex items-center gap-3 px-3 py-2 text-xs text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-muted">
          <Settings className="h-3.5 w-3.5" />
          Settings
        </button>
      </div>
    </aside>
  );
}
