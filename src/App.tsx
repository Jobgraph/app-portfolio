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
import { ProjectDetail } from './components/portfolio/ProjectDetail';

export default function App() {
  const themeCtx = useThemeProvider();
  const { config, loading: configLoading } = useConfig();
  const { projects, add, update, remove, addUpdate } = useProjects();
  const [view, setView] = useState<View>('portfolio');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleSelect = useCallback((id: string) => {
    setSelectedId(id);
    setView('detail');
  }, []);

  const handleBack = useCallback(() => {
    setSelectedId(null);
    setView('portfolio');
  }, []);

  const handleSubmit = useCallback((data: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'updates'>) => {
    const p = add(data);
    toast.success(`"${p.name}" added to portfolio`);
    setSelectedId(p.id);
    setView('detail');
  }, [add]);

  const handleDelete = useCallback((id: string) => {
    remove(id);
    toast.success('Project deleted');
    setSelectedId(null);
    setView('portfolio');
  }, [remove]);

  const handleAddUpdate = useCallback((projectId: string, heading: string, content: string) => {
    addUpdate(projectId, heading, content);
    toast.success('Update posted');
  }, [addUpdate]);

  const handleEdit = useCallback((id: string, data: Partial<Project>) => {
    update(id, data);
  }, [update]);

  const navigate = useCallback((v: View) => {
    if (v === 'portfolio') {
      setSelectedId(null);
    }
    setView(v);
  }, []);

  if (configLoading || !config) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
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
          />
        )}

        {view === 'submit' && (
          <ProjectSubmitForm
            onSubmit={handleSubmit}
            onCancel={handleBack}
          />
        )}

        {view === 'detail' && selectedProject && (
          <ProjectDetail
            project={selectedProject}
            onBack={handleBack}
            onDelete={handleDelete}
            onAddUpdate={handleAddUpdate}
            onEdit={handleEdit}
          />
        )}

        {view === 'detail' && !selectedProject && (
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            <p className="text-sm">Project not found.</p>
          </div>
        )}
      </AppShell>
    </ThemeContext>
  );
}
