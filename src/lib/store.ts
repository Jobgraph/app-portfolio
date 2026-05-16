import type { Project, ProjectUpdate } from './types';
import { generateId } from './utils';

const STORAGE_KEY = 'jg-portfolio-projects';
const MAX_PROJECTS = 200;

function read(): Project[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function write(projects: Project[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects.slice(0, MAX_PROJECTS)));
}

export function getProjects(): Project[] {
  return read();
}

export function getProject(id: string): Project | undefined {
  return read().find(p => p.id === id);
}

export function addProject(data: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'updates'>): Project {
  const projects = read();
  const project: Project = {
    ...data,
    id: generateId(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    updates: [],
  };
  projects.unshift(project);
  write(projects);
  return project;
}

export function updateProject(id: string, data: Partial<Project>): Project | undefined {
  const projects = read();
  const idx = projects.findIndex(p => p.id === id);
  if (idx === -1) return undefined;
  const { id: _id, createdAt: _ca, updates: _u, ...safe } = data;
  projects[idx] = { ...projects[idx], ...safe, updatedAt: new Date().toISOString() };
  write(projects);
  return projects[idx];
}

export function deleteProject(id: string): boolean {
  const projects = read();
  const filtered = projects.filter(p => p.id !== id);
  if (filtered.length === projects.length) return false;
  write(filtered);
  return true;
}

export function addProjectUpdate(projectId: string, heading: string, content: string): ProjectUpdate | undefined {
  const projects = read();
  const idx = projects.findIndex(p => p.id === projectId);
  if (idx === -1) return undefined;
  const update: ProjectUpdate = {
    id: generateId(),
    heading,
    content,
    timestamp: new Date().toISOString(),
  };
  projects[idx].updates.unshift(update);
  projects[idx].updatedAt = new Date().toISOString();
  write(projects);
  return update;
}
