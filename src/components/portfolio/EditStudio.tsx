import { useState, useMemo, useRef, useEffect } from 'react';
import { ChevronLeft, Plus, Trash2, Search, Save, AlertCircle } from 'lucide-react';
import type { Project, ProjectStage, GovernanceTier, ComplianceStatus } from '../../lib/types';
import { STAGE_LABELS, TIER_LABELS, COMPLIANCE_LABELS } from '../../lib/types';
import { relativeTime } from '../../lib/utils';
import { StageBadge } from './StageBadge';

interface EditStudioProps {
  projects: Project[];
  initialProjectId?: string | null;
  onSave: (id: string, data: Partial<Project>) => void;
  onDelete: (id: string) => void;
  onAddUpdate: (projectId: string, heading: string, content: string) => void;
  onBack: () => void;
}

const STAGES = Object.entries(STAGE_LABELS) as [ProjectStage, string][];
const TIERS = Object.entries(TIER_LABELS) as [GovernanceTier, string][];
const COMPLIANCE = Object.entries(COMPLIANCE_LABELS) as [ComplianceStatus, string][];

export function EditStudio({ projects, initialProjectId, onSave, onDelete, onAddUpdate, onBack }: EditStudioProps) {
  const [selectedId, setSelectedId] = useState<string | null>(initialProjectId || projects[0]?.id || null);
  const [search, setSearch] = useState('');
  const [saveMsg, setSaveMsg] = useState<string | null>(null);
  const [newUpdateHeading, setNewUpdateHeading] = useState('');
  const [newUpdateContent, setNewUpdateContent] = useState('');
  const saveMsgTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(saveMsgTimer.current), []);

  // Reset update form state when switching projects
  useEffect(() => {
    setNewUpdateHeading('');
    setNewUpdateContent('');
  }, [selectedId]);

  const filtered = useMemo(() => {
    if (!search) return projects;
    const q = search.toLowerCase();
    return projects.filter(p => p.name.toLowerCase().includes(q) || p.group?.name?.toLowerCase().includes(q));
  }, [projects, search]);

  const project = projects.find(p => p.id === selectedId);

  const handleSave = (data: Partial<Project>) => {
    if (!project) return;
    onSave(project.id, data);
    clearTimeout(saveMsgTimer.current);
    setSaveMsg('Changes saved');
    saveMsgTimer.current = setTimeout(() => setSaveMsg(null), 2000);
  };

  const handleAddUpdate = () => {
    if (!project || !newUpdateHeading.trim() || !newUpdateContent.trim()) return;
    onAddUpdate(project.id, newUpdateHeading.trim(), newUpdateContent.trim());
    setNewUpdateHeading('');
    setNewUpdateContent('');
  };

  return (
    <div className="h-full flex flex-col">
      {/* Top bar */}
      <div className="h-12 px-4 flex items-center gap-3 border-b border-border shrink-0 bg-card">
        <button onClick={onBack} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
          <ChevronLeft className="h-4 w-4" />
          View portfolio
        </button>
        <div className="flex-1" />
        <h2 className="text-sm font-bold text-foreground">Portfolio Edit Studio</h2>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left sidebar */}
        <div className="w-80 border-r border-border bg-card flex flex-col shrink-0">
          <div className="p-3 border-b border-border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-foreground">Projects</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">{projects.length}</span>
            </div>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search projects..."
                className="w-full pl-8 pr-3 py-2 rounded-full border border-border bg-muted/30 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {filtered.map(p => (
              <button
                key={p.id}
                onClick={() => setSelectedId(p.id)}
                className={`w-full text-left px-4 py-2.5 border-l-2 transition-colors ${
                  p.id === selectedId
                    ? 'border-l-foreground bg-muted/50 text-foreground'
                    : 'border-l-transparent text-muted-foreground hover:bg-muted/30 hover:text-foreground'
                }`}
              >
                <p className="text-xs font-medium truncate">{p.name}</p>
                <p className="text-[10px] text-muted-foreground flex items-center gap-1.5">
                  {STAGE_LABELS[p.projectStage]}
                  {p.group && <span>· {p.group.name}</span>}
                </p>
              </button>
            ))}
            {filtered.length === 0 && (
              <div className="px-4 py-8 text-center text-xs text-muted-foreground">No matching projects.</div>
            )}
          </div>
        </div>

        {/* Main editor */}
        {project ? (
          <div key={project.id} className="flex-1 overflow-y-auto">
            <div className="max-w-3xl mx-auto p-6">
              {/* Header */}
              <div className="flex items-center gap-3 mb-6">
                <StageBadge stage={project.projectStage} size="md" />
                <h2 className="text-xl font-bold text-foreground">{project.name}</h2>
              </div>

              {saveMsg && (
                <div className="mb-4 px-3 py-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium flex items-center gap-2">
                  <Save className="h-3.5 w-3.5" />
                  {saveMsg}
                </div>
              )}

              {/* Section: Header and summary */}
              <SectionCard title="Project details">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <FieldShell label="Project name" required>
                    <input
                      type="text"
                      defaultValue={project.name}
                      onBlur={(e) => { if (e.target.value !== project.name) handleSave({ name: e.target.value }); }}
                      className="w-full px-3 py-2 rounded-xl border border-border bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
                    />
                  </FieldShell>
                  <FieldShell label="Project stage">
                    <select
                      value={project.projectStage}
                      onChange={(e) => handleSave({ projectStage: e.target.value as ProjectStage })}
                      className="w-full px-3 py-2 rounded-xl border border-border bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
                    >
                      {STAGES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                    </select>
                  </FieldShell>
                </div>
                <FieldShell label="Description">
                  <textarea
                    defaultValue={project.description}
                    onBlur={(e) => { if (e.target.value !== project.description) handleSave({ description: e.target.value }); }}
                    rows={4}
                    className="w-full px-3 py-2 rounded-xl border border-border bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30 resize-none"
                  />
                </FieldShell>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <FieldShell label="Capability">
                    <input
                      type="text"
                      defaultValue={project.capability || ''}
                      onBlur={(e) => handleSave({ capability: e.target.value || undefined })}
                      className="w-full px-3 py-2 rounded-xl border border-border bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
                    />
                  </FieldShell>
                  <FieldShell label="GitHub URL">
                    <input
                      type="url"
                      defaultValue={project.githubUrl || ''}
                      onBlur={(e) => handleSave({ githubUrl: e.target.value || undefined })}
                      className="w-full px-3 py-2 rounded-xl border border-border bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
                    />
                  </FieldShell>
                </div>
              </SectionCard>

              {/* Section: Delivery and reach */}
              <SectionCard title="Organisation">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <FieldShell label="Group / Business area">
                    <input
                      type="text"
                      defaultValue={project.group?.name || ''}
                      onBlur={(e) => handleSave({ group: e.target.value ? { id: e.target.value.toLowerCase().replace(/\s+/g, '-'), name: e.target.value } : undefined })}
                      className="w-full px-3 py-2 rounded-xl border border-border bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
                    />
                  </FieldShell>
                  <FieldShell label="Directorate">
                    <input
                      type="text"
                      defaultValue={project.directorate?.name || ''}
                      onBlur={(e) => handleSave({ directorate: e.target.value ? { id: e.target.value.toLowerCase().replace(/\s+/g, '-'), name: e.target.value } : undefined })}
                      className="w-full px-3 py-2 rounded-xl border border-border bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
                    />
                  </FieldShell>
                </div>
              </SectionCard>

              {/* Section: People */}
              <SectionCard title="People and ownership">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <FieldShell label="Owner name">
                    <input
                      type="text"
                      defaultValue={project.owner?.name || ''}
                      onBlur={(e) => {
                        const name = e.target.value.trim();
                        handleSave({ owner: name ? { id: name.toLowerCase().replace(/\s+/g, '-'), name, email: project.owner?.email } : undefined });
                      }}
                      className="w-full px-3 py-2 rounded-xl border border-border bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
                    />
                  </FieldShell>
                  <FieldShell label="Owner email">
                    <input
                      type="email"
                      defaultValue={project.owner?.email || ''}
                      onBlur={(e) => {
                        if (project.owner) handleSave({ owner: { ...project.owner, email: e.target.value || undefined } });
                      }}
                      className="w-full px-3 py-2 rounded-xl border border-border bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
                    />
                  </FieldShell>
                  <FieldShell label="Business lead">
                    <input
                      type="text"
                      defaultValue={project.businessLead?.name || ''}
                      onBlur={(e) => {
                        const name = e.target.value.trim();
                        handleSave({ businessLead: name ? { id: name.toLowerCase().replace(/\s+/g, '-'), name, email: project.businessLead?.email } : undefined });
                      }}
                      className="w-full px-3 py-2 rounded-xl border border-border bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
                    />
                  </FieldShell>
                  <FieldShell label="Legal lead">
                    <input
                      type="text"
                      defaultValue={project.legalLead?.name || ''}
                      onBlur={(e) => {
                        const name = e.target.value.trim();
                        handleSave({ legalLead: name ? { id: name.toLowerCase().replace(/\s+/g, '-'), name, email: project.legalLead?.email } : undefined });
                      }}
                      className="w-full px-3 py-2 rounded-xl border border-border bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
                    />
                  </FieldShell>
                </div>
              </SectionCard>

              {/* Section: Governance */}
              <SectionCard title="Governance and compliance">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <FieldShell label="Governance tier">
                    <select
                      value={project.governanceTier}
                      onChange={(e) => handleSave({ governanceTier: e.target.value as GovernanceTier })}
                      className="w-full px-3 py-2 rounded-xl border border-border bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
                    >
                      {TIERS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                    </select>
                  </FieldShell>
                  <FieldShell label="Risk register">
                    <select
                      value={project.riskRegister}
                      onChange={(e) => handleSave({ riskRegister: e.target.value as ComplianceStatus })}
                      className="w-full px-3 py-2 rounded-xl border border-border bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
                    >
                      {COMPLIANCE.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                    </select>
                  </FieldShell>
                  <FieldShell label="DPIA in place">
                    <select
                      value={project.dpiaInPlace}
                      onChange={(e) => handleSave({ dpiaInPlace: e.target.value as ComplianceStatus })}
                      className="w-full px-3 py-2 rounded-xl border border-border bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
                    >
                      {COMPLIANCE.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                    </select>
                  </FieldShell>
                  <FieldShell label="ATRS assessment">
                    <select
                      value={project.actsInPlace}
                      onChange={(e) => handleSave({ actsInPlace: e.target.value as ComplianceStatus })}
                      className="w-full px-3 py-2 rounded-xl border border-border bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
                    >
                      {COMPLIANCE.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                    </select>
                  </FieldShell>
                  <FieldShell label="Ethics framework">
                    <select
                      value={project.ethicsFramework}
                      onChange={(e) => handleSave({ ethicsFramework: e.target.value as ComplianceStatus })}
                      className="w-full px-3 py-2 rounded-xl border border-border bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
                    >
                      {COMPLIANCE.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                    </select>
                  </FieldShell>
                  <FieldShell label="Governance body">
                    <select
                      value={project.governanceBody}
                      onChange={(e) => handleSave({ governanceBody: e.target.value as ComplianceStatus })}
                      className="w-full px-3 py-2 rounded-xl border border-border bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
                    >
                      {COMPLIANCE.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                    </select>
                  </FieldShell>
                </div>
                {project.governanceBody === 'yes' && (
                  <FieldShell label="Governance body name">
                    <input
                      type="text"
                      defaultValue={project.governanceBodyName || ''}
                      onBlur={(e) => handleSave({ governanceBodyName: e.target.value || undefined })}
                      className="w-full px-3 py-2 rounded-xl border border-border bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
                    />
                  </FieldShell>
                )}
              </SectionCard>

              {/* Section: Updates */}
              <SectionCard title="Updates">
                {project.updates.map((update) => (
                  <div key={update.id} className="p-3 rounded-xl bg-muted/30 border border-border mb-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-foreground">{update.heading}</span>
                      <span className="text-[10px] text-muted-foreground">{relativeTime(update.timestamp)}</span>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">{update.content}</p>
                  </div>
                ))}
                <div className="mt-3 p-3 rounded-xl border-2 border-dashed border-border">
                  <input
                    type="text"
                    value={newUpdateHeading}
                    onChange={(e) => setNewUpdateHeading(e.target.value)}
                    placeholder="Update heading"
                    className="w-full px-3 py-2 rounded-lg border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30 mb-2"
                  />
                  <textarea
                    value={newUpdateContent}
                    onChange={(e) => setNewUpdateContent(e.target.value)}
                    placeholder="Update content..."
                    rows={3}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30 resize-none mb-2"
                  />
                  <button
                    onClick={handleAddUpdate}
                    disabled={!newUpdateHeading.trim() || !newUpdateContent.trim()}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
                  >
                    <Plus className="h-3 w-3" />
                    Add update
                  </button>
                </div>
              </SectionCard>

              {/* Section: Additional */}
              <SectionCard title="Additional details">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <FieldShell label="Supplier">
                    <input
                      type="text"
                      defaultValue={project.supplier || ''}
                      onBlur={(e) => handleSave({ supplier: e.target.value || undefined })}
                      className="w-full px-3 py-2 rounded-xl border border-border bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
                    />
                  </FieldShell>
                  <FieldShell label="Active users">
                    <input
                      type="text"
                      defaultValue={project.activeUsers || ''}
                      onBlur={(e) => handleSave({ activeUsers: e.target.value || undefined })}
                      className="w-full px-3 py-2 rounded-xl border border-border bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
                    />
                  </FieldShell>
                  <FieldShell label="Funding source">
                    <input
                      type="text"
                      defaultValue={project.fundingSource || ''}
                      onBlur={(e) => handleSave({ fundingSource: e.target.value || undefined })}
                      className="w-full px-3 py-2 rounded-xl border border-border bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
                    />
                  </FieldShell>
                </div>
                <FieldShell label="Additional context">
                  <textarea
                    defaultValue={project.additionalContext || ''}
                    onBlur={(e) => handleSave({ additionalContext: e.target.value || undefined })}
                    rows={3}
                    className="w-full px-3 py-2 rounded-xl border border-border bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30 resize-none"
                  />
                </FieldShell>
              </SectionCard>

              {/* Danger zone */}
              <div className="mt-6 p-4 rounded-xl border border-destructive/30 bg-destructive/5">
                <h4 className="text-sm font-bold text-destructive mb-2 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  Danger zone
                </h4>
                <button
                  onClick={() => {
                    if (confirm(`Delete "${project.name}"? This cannot be undone.`)) {
                      onDelete(project.id);
                      const next = projects.find(p => p.id !== project.id);
                      setSelectedId(next?.id || null);
                    }
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-destructive text-destructive-foreground text-xs font-medium hover:opacity-90 transition-opacity"
                >
                  <Trash2 className="h-3 w-3" />
                  Delete project
                </button>
              </div>

              {/* Meta */}
              <div className="mt-6 text-[10px] text-muted-foreground space-y-0.5">
                <p>Last updated: {new Date(project.updatedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                <p>Created: {new Date(project.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                <p>Project ID: {project.id}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <p className="text-sm">Choose a project from the left to start editing.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6 rounded-2xl border border-border bg-card p-5">
      <h3 className="text-sm font-bold text-foreground mb-4">{title}</h3>
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );
}

function FieldShell({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[11px] font-medium text-muted-foreground mb-1">
        {label}
        {required && <span className="text-primary ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}
