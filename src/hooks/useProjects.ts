import { useCallback, useState } from 'react';
import type { Project, ProjectUpdate } from '../lib/types';
import * as store from '../lib/store';
import { MOCK_PROJECTS } from '../lib/mock';

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>(() => {
    const stored = store.getProjects();
    return stored.length > 0 ? stored : MOCK_PROJECTS;
  });

  const [isMockData, setIsMockData] = useState(() => store.getProjects().length === 0);

  const refresh = useCallback(() => {
    const stored = store.getProjects();
    setProjects(stored.length > 0 ? stored : MOCK_PROJECTS);
  }, []);

  const add = useCallback((data: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'updates'>) => {
    if (isMockData) {
      localStorage.setItem('jg-portfolio-projects', JSON.stringify(MOCK_PROJECTS));
      setIsMockData(false);
    }
    const p = store.addProject(data);
    refresh();
    return p;
  }, [isMockData, refresh]);

  const update = useCallback((id: string, data: Partial<Project>) => {
    const result = store.updateProject(id, data);
    if (result) refresh();
    return result;
  }, [refresh]);

  const remove = useCallback((id: string) => {
    store.deleteProject(id);
    refresh();
  }, [refresh]);

  const addUpdate = useCallback((projectId: string, heading: string, content: string): ProjectUpdate | undefined => {
    const result = store.addProjectUpdate(projectId, heading, content);
    if (result) refresh();
    return result;
  }, [refresh]);

  return { projects, add, update, remove, addUpdate, refresh };
}
