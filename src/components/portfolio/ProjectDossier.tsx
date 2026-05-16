import { useState, useRef, useEffect, useCallback } from 'react';
import { X, Search, ChevronRight } from 'lucide-react';
import type { Project } from '../../lib/types';
import { ProjectPanel } from './ProjectPanel';

interface ProjectDossierProps {
  project: Project;
  projects: Project[];
  onClose: () => void;
  onSwitch: (id: string) => void;
  onDelete: (id: string) => void;
  onAddUpdate: (projectId: string, heading: string, content: string) => void;
  onEdit: (id: string, data: Partial<Project>) => void;
  onOpenEditor: (id: string) => void;
}

export function ProjectDossier({ project, projects, onClose, onSwitch, onDelete, onAddUpdate, onEdit, onOpenEditor }: ProjectDossierProps) {
  const [showSwitcher, setShowSwitcher] = useState(false);
  const [switcherSearch, setSwitcherSearch] = useState('');
  const backdropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  const filteredProjects = projects.filter(p => {
    if (!switcherSearch) return true;
    const q = switcherSearch.toLowerCase();
    return p.name.toLowerCase().includes(q) || p.owner?.name?.toLowerCase().includes(q) || p.group?.name?.toLowerCase().includes(q);
  });

  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === backdropRef.current) onClose();
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal>
      {/* Backdrop */}
      <div ref={backdropRef} onClick={handleBackdropClick} className="absolute inset-0 bg-black/20 animate-in fade-in duration-200" />

      {/* Panel */}
      <div className="absolute inset-y-0 right-0 w-full max-w-[min(960px,94vw)] flex animate-in slide-in-from-right duration-300">
        {/* Project switcher sidebar */}
        {showSwitcher && (
          <div className="w-72 border-r border-border bg-card flex flex-col shrink-0 overflow-hidden">
            <div className="p-4 border-b border-border">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-foreground">Projects</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">{projects.length}</span>
              </div>
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <input
                  value={switcherSearch}
                  onChange={(e) => setSwitcherSearch(e.target.value)}
                  placeholder="Search projects..."
                  className="w-full pl-8 pr-3 py-2 rounded-full border border-border bg-muted/30 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              {filteredProjects.map(p => (
                <button
                  key={p.id}
                  onClick={() => { onSwitch(p.id); setSwitcherSearch(''); }}
                  className={`w-full text-left px-4 py-2.5 border-l-2 transition-colors ${
                    p.id === project.id
                      ? 'border-l-foreground bg-muted/50 text-foreground'
                      : 'border-l-transparent text-muted-foreground hover:bg-muted/30 hover:text-foreground'
                  }`}
                >
                  <p className="text-xs font-medium truncate">{p.name}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{p.group?.name || 'No group'}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Main dossier */}
        <div className="flex-1 bg-card flex flex-col overflow-hidden shadow-2xl">
          {/* Header */}
          <div className="h-12 px-4 flex items-center gap-3 border-b border-border shrink-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Project dossier</p>
            <div className="flex-1" />
            <button
              onClick={() => setShowSwitcher(!showSwitcher)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                showSwitcher ? 'bg-foreground text-background' : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              <ChevronRight className={`h-3 w-3 transition-transform ${showSwitcher ? 'rotate-180' : ''}`} />
              Projects
            </button>
            <button onClick={onClose} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto">
            <ProjectPanel
              project={project}
              onDelete={onDelete}
              onAddUpdate={onAddUpdate}
              onEdit={onEdit}
              onOpenEditor={onOpenEditor}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
