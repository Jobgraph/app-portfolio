import { useState } from 'react';
import { ChevronLeft, Mail, Phone, Pencil, Trash2, Plus, Clock, User, Building2, Shield, Briefcase } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Project, Person, ProjectStage } from '../../lib/types';
import { STAGE_LABELS } from '../../lib/types';
import { relativeTime } from '../../lib/utils';
import { StageBadge } from './StageBadge';
import { TierBadge } from './TierBadge';
import { ComplianceIndicator } from './ComplianceIndicator';

interface ProjectDetailProps {
  project: Project;
  onBack: () => void;
  onDelete: (id: string) => void;
  onAddUpdate: (projectId: string, heading: string, content: string) => void;
  onEdit: (id: string, data: Partial<Project>) => void;
}

function PersonCard({ person, role }: { person: Person; role: string }) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/40">
      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
        <User className="h-4 w-4 text-primary" />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-medium text-foreground">{person.name}</p>
        <p className="text-[11px] text-muted-foreground">{role}</p>
        {person.email && (
          <a href={`mailto:${person.email}`} className="flex items-center gap-1 text-[11px] text-primary hover:underline mt-0.5">
            <Mail className="h-3 w-3" /> {person.email}
          </a>
        )}
        {person.phone && (
          <span className="flex items-center gap-1 text-[11px] text-muted-foreground mt-0.5">
            <Phone className="h-3 w-3" /> {person.phone}
          </span>
        )}
      </div>
    </div>
  );
}

export function ProjectDetail({ project, onBack, onDelete, onAddUpdate, onEdit }: ProjectDetailProps) {
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [updateHeading, setUpdateHeading] = useState('');
  const [updateContent, setUpdateContent] = useState('');
  const [editingStage, setEditingStage] = useState(false);

  const handleAddUpdate = () => {
    if (!updateHeading.trim() || !updateContent.trim()) return;
    onAddUpdate(project.id, updateHeading.trim(), updateContent.trim());
    setUpdateHeading('');
    setUpdateContent('');
    setShowUpdateForm(false);
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      {/* Back & actions */}
      <div className="flex items-center justify-between mb-6">
        <button onClick={onBack} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ChevronLeft className="h-4 w-4" />
          Back to portfolio
        </button>
        <button
          onClick={() => { if (confirm('Delete this project?')) onDelete(project.id); }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-destructive hover:bg-destructive/10 transition-colors"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Delete
        </button>
      </div>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2 flex-wrap">
          <h2 className="text-2xl font-bold text-foreground">{project.name}</h2>
          <StageBadge stage={project.projectStage} size="md" />
          <TierBadge tier={project.governanceTier} />
          {!editingStage && (
            <button
              onClick={() => setEditingStage(true)}
              className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        {editingStage && (
          <div className="flex items-center gap-2 mb-3">
            <select
              value={project.projectStage}
              onChange={(e) => {
                onEdit(project.id, { projectStage: e.target.value as ProjectStage });
                setEditingStage(false);
              }}
              className="px-2 py-1 rounded border border-border bg-card text-sm text-foreground"
            >
              {(Object.entries(STAGE_LABELS) as [ProjectStage, string][]).map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
            <button onClick={() => setEditingStage(false)} className="text-xs text-muted-foreground hover:text-foreground">Cancel</button>
          </div>
        )}
        <p className="text-sm text-muted-foreground leading-relaxed">{project.description}</p>
        <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
          <span>Created {relativeTime(project.createdAt)}</span>
          <span>Updated {relativeTime(project.updatedAt)}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Updates */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-foreground">Updates</h3>
              <button
                onClick={() => setShowUpdateForm(!showUpdateForm)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:opacity-90 transition-opacity"
              >
                <Plus className="h-3.5 w-3.5" />
                Add update
              </button>
            </div>

            {showUpdateForm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mb-4 p-4 rounded-lg border border-border bg-card"
              >
                <input
                  type="text"
                  value={updateHeading}
                  onChange={(e) => setUpdateHeading(e.target.value)}
                  placeholder="Update heading"
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30 mb-2"
                />
                <textarea
                  value={updateContent}
                  onChange={(e) => setUpdateContent(e.target.value)}
                  placeholder="What's new with this project?"
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30 resize-none mb-3"
                />
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setShowUpdateForm(false)}
                    className="px-3 py-1.5 rounded-lg text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddUpdate}
                    disabled={!updateHeading.trim() || !updateContent.trim()}
                    className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
                  >
                    Post update
                  </button>
                </div>
              </motion.div>
            )}

            {project.updates.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="h-8 w-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No updates yet</p>
                <p className="text-xs mt-1">Add the first update for this project.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {project.updates.map((update, i) => (
                  <motion.div
                    key={update.id}
                    initial={i === 0 ? { opacity: 0, y: -10 } : false}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-lg border border-border bg-card"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="text-sm font-semibold text-foreground">{update.heading}</h4>
                      <span className="text-[10px] text-muted-foreground ml-auto">{relativeTime(update.timestamp)}</span>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{update.content}</p>
                  </motion.div>
                ))}
              </div>
            )}
          </section>

          {/* Organisation Details */}
          {(project.group || project.directorate || (project.businessAreas && project.businessAreas.length > 0)) && (
            <section>
              <h3 className="text-base font-bold text-foreground mb-3">Organisation</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {project.group && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/40">
                    <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
                    <div>
                      <p className="text-[11px] text-muted-foreground">Group</p>
                      <p className="text-sm font-medium text-foreground">{project.group.name}</p>
                    </div>
                  </div>
                )}
                {project.directorate && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/40">
                    <Briefcase className="h-4 w-4 text-muted-foreground shrink-0" />
                    <div>
                      <p className="text-[11px] text-muted-foreground">Directorate</p>
                      <p className="text-sm font-medium text-foreground">{project.directorate.name}</p>
                    </div>
                  </div>
                )}
              </div>
            </section>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* People */}
          <section>
            <h3 className="text-sm font-bold text-foreground mb-3">People</h3>
            <div className="space-y-2">
              {project.owner && <PersonCard person={project.owner} role="Project Owner (SRO)" />}
              {project.businessLead && <PersonCard person={project.businessLead} role="Business Lead" />}
              {project.legalLead && <PersonCard person={project.legalLead} role="Legal Lead" />}
              {project.deliveryOwners?.map((p) => (
                <PersonCard key={p.id} person={p} role="Delivery Owner" />
              ))}
              {!project.owner && !project.businessLead && !project.legalLead && (
                <p className="text-xs text-muted-foreground">No people assigned yet.</p>
              )}
            </div>
          </section>

          {/* Governance & Compliance */}
          <section>
            <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Governance & Compliance
            </h3>
            <div className="p-3 rounded-lg border border-border bg-card space-y-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground">Governance Tier</span>
                <TierBadge tier={project.governanceTier} />
              </div>
              <ComplianceIndicator status={project.riskRegister} label="Risk Register" />
              <ComplianceIndicator status={project.dpiaInPlace} label="DPIA" />
              <ComplianceIndicator status={project.actsInPlace} label="ATRS Assessment" />
              <ComplianceIndicator status={project.ethicsFramework} label="Ethics Framework" />
              <ComplianceIndicator status={project.governanceBody} label="Governance Body" />
              {project.governanceBodyName && (
                <p className="text-xs text-muted-foreground pl-6">{project.governanceBodyName}</p>
              )}
            </div>
          </section>

          {/* Project Info */}
          <section>
            <h3 className="text-sm font-bold text-foreground mb-3">Project Info</h3>
            <div className="p-3 rounded-lg border border-border bg-card space-y-2 text-sm">
              {project.capability && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Capability</span>
                  <span className="text-foreground font-medium">{project.capability}</span>
                </div>
              )}
              {project.supplier && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Supplier</span>
                  <span className="text-foreground font-medium">{project.supplier}</span>
                </div>
              )}
              {project.activeUsers && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Active Users</span>
                  <span className="text-foreground font-medium">{project.activeUsers}</span>
                </div>
              )}
              {project.fundingSource && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Funding</span>
                  <span className="text-foreground font-medium">{project.fundingSource}</span>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
