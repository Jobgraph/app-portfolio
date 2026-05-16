import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { ThemeContext } from './lib/theme';
import { useThemeProvider } from './hooks/useTheme';
import { useConfig } from './hooks/useConfig';
import { useProjects } from './hooks/useProjects';
import type { View, Project } from './lib/types';
import { AppShell } from './components/shell/AppShell';
import { PortfolioList } from './components/portfolio/PortfolioList';
import { ProjectSubmitForm } from './components/portfolio/ProjectSubmitForm';
import { ProjectDossier } from './components/portfolio/ProjectDossier';
import { EditStudio } from './components/portfolio/EditStudio';

export default function App() {
  const themeCtx = useThemeProvider();
  const { config, loading: configLoading } = useConfig();
  const { projects, add, update, remove, addUpdate } = useProjects();
  const [view, setView] = useState<View>('portfolio');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editProjectId, setEditProjectId] = useState<string | null>(null);

  const handleSelect = useCallback((id: string) => {
    setSelectedId(id);
  }, []);

  const handleCloseDossier = useCallback(() => {
    setSelectedId(null);
  }, []);

  const handleSubmit = useCallback((data: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'updates'>) => {
    const p = add(data);
    toast.success(`"${p.name}" added to portfolio`);
    setSelectedId(p.id);
    setView('portfolio');
  }, [add]);

  const handleDelete = useCallback((id: string) => {
    remove(id);
    toast.success('Project deleted');
    setSelectedId(null);
  }, [remove]);

  const handleAddUpdate = useCallback((projectId: string, heading: string, content: string) => {
    addUpdate(projectId, heading, content);
    toast.success('Update posted');
  }, [addUpdate]);

  const handleEdit = useCallback((id: string, data: Partial<Project>) => {
    update(id, data);
  }, [update]);

  const handleOpenEditor = useCallback((id: string) => {
    setEditProjectId(id);
    setSelectedId(null);
    setView('edit');
  }, []);

  const navigate = useCallback((v: View) => {
    if (v !== 'detail') {
      setSelectedId(null);
    }
    setView(v);
  }, []);

  if (configLoading || !config) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="relative">
            <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-1.5 w-1.5 bg-primary rounded-full animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  const selectedProject = selectedId ? projects.find(p => p.id === selectedId) : null;

  return (
    <ThemeContext value={themeCtx}>
      <AppShell
        config={config}
        currentView={view}
        onNavigate={navigate}
        projectCount={projects.length}
      >
        {view === 'portfolio' && (
          <PortfolioList
            projects={projects}
            onSelect={handleSelect}
            onSubmitNew={() => setView('submit')}
            onEdit={() => setView('edit')}
          />
        )}

        {view === 'submit' && (
          <ProjectSubmitForm
            onSubmit={handleSubmit}
            onCancel={() => setView('portfolio')}
          />
        )}

        {view === 'edit' && (
          <EditStudio
            projects={projects}
            initialProjectId={editProjectId}
            onSave={handleEdit}
            onDelete={handleDelete}
            onAddUpdate={handleAddUpdate}
            onBack={() => { setView('portfolio'); setEditProjectId(null); }}
          />
        )}

        {view === 'analytics' && (
          <div className="max-w-4xl mx-auto p-6">
            <div className="border border-border rounded-xl bg-card p-8 text-center">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground mb-2">Coming soon</p>
              <h2 className="text-2xl font-extrabold text-foreground mb-2">Analytics</h2>
              <p className="text-sm text-muted-foreground">Portfolio analytics and reporting dashboards will appear here.</p>
            </div>
          </div>
        )}

        {/* Dossier overlay */}
        {selectedProject && (
          <ProjectDossier
            project={selectedProject}
            projects={projects}
            onClose={handleCloseDossier}
            onSwitch={handleSelect}
            onDelete={(id) => { handleDelete(id); handleCloseDossier(); }}
            onAddUpdate={handleAddUpdate}
            onEdit={handleEdit}
            onOpenEditor={handleOpenEditor}
          />
        )}
      </AppShell>
    </ThemeContext>
  );
}
