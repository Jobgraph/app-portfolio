import { useState } from 'react';
import { Mail, Phone, Pencil, Trash2, Plus, Clock, User, Building2, Shield, Briefcase, ExternalLink, Download, CheckCircle2, XCircle, HelpCircle, Minus } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Project, Person, ComplianceStatus } from '../../lib/types';
import { TIER_LABELS, COMPLIANCE_LABELS } from '../../lib/types';
import { relativeTime } from '../../lib/utils';
import { downloadProjectMarkdown } from '../../lib/export';
import { StageBadge } from './StageBadge';
import { TierBadge } from './TierBadge';

interface ProjectPanelProps {
  project: Project;
  onDelete: (id: string) => void;
  onAddUpdate: (projectId: string, heading: string, content: string) => void;
  onEdit: (id: string, data: Partial<Project>) => void;
  onOpenEditor: (id: string) => void;
}

function PersonCard({ person, role }: { person: Person; role: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
        <User className="h-4 w-4 text-primary" />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-foreground">{person.name}</p>
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

function GovernanceChip({ label, status, link }: { label: string; status: ComplianceStatus; link?: string }) {
  const iconMap: Record<ComplianceStatus, typeof CheckCircle2> = {
    yes: CheckCircle2, no: XCircle, in_progress: Clock, not_sure: HelpCircle, na: Minus,
  };
  const colorMap: Record<ComplianceStatus, string> = {
    yes: 'text-emerald-600', no: 'text-red-500', in_progress: 'text-amber-500', not_sure: 'text-neutral-400', na: 'text-neutral-300',
  };
  const Icon = iconMap[status];
  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-muted/20">
      <Icon className={`h-4 w-4 shrink-0 ${colorMap[status]}`} />
      <div className="min-w-0">
        <p className="text-[11px] font-medium text-foreground">{label}</p>
        <p className="text-[10px] text-muted-foreground">{COMPLIANCE_LABELS[status]}</p>
      </div>
      {link && (
        <a href={link} target="_blank" rel="noreferrer" className="ml-auto text-primary hover:underline">
          <ExternalLink className="h-3 w-3" />
        </a>
      )}
    </div>
  );
}

export function ProjectPanel({ project, onDelete, onAddUpdate, onEdit: _onEdit, onOpenEditor }: ProjectPanelProps) {
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [updateHeading, setUpdateHeading] = useState('');
  const [updateContent, setUpdateContent] = useState('');
  const [showAllUpdates, setShowAllUpdates] = useState(false);

  const handleAddUpdate = () => {
    if (!updateHeading.trim() || !updateContent.trim()) return;
    onAddUpdate(project.id, updateHeading.trim(), updateContent.trim());
    setUpdateHeading('');
    setUpdateContent('');
    setShowUpdateForm(false);
  };

  const visibleUpdates = showAllUpdates ? project.updates : project.updates.slice(0, 3);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-extrabold text-foreground mb-2">{project.name}</h2>
        <div className="flex items-center gap-2 flex-wrap mb-3">
          <StageBadge stage={project.projectStage} size="md" />
          {project.capability && (
            <span className="inline-flex items-center gap-1 rounded-full border border-border px-2.5 py-0.5 text-[11px] font-medium text-foreground bg-muted/30">
              {project.capability}
            </span>
          )}
          <TierBadge tier={project.governanceTier} />
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-2 mb-4">
          <button
            onClick={() => onOpenEditor(project.id)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border text-xs font-medium text-muted-foreground hover:bg-[#f7eef2] hover:text-[#5f4a52] hover:border-[#e3c0ce] transition-colors"
          >
            <Pencil className="h-3 w-3" />
            Edit
          </button>
          <button
            onClick={() => downloadProjectMarkdown(project)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border text-xs font-medium text-muted-foreground hover:bg-[#217346]/10 hover:text-[#217346] hover:border-[#217346]/30 transition-colors"
          >
            <Download className="h-3 w-3" />
            Export
          </button>
          <button
            onClick={() => { if (confirm('Delete this project?')) onDelete(project.id); }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border text-xs font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition-colors"
          >
            <Trash2 className="h-3 w-3" />
            Delete
          </button>
        </div>

        <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">{project.description}</p>
      </div>

      {/* Delivery area */}
      {(project.group || project.directorate || (project.businessAreas && project.businessAreas.length > 0)) && (
        <div className="mb-6">
          <div className="flex items-center gap-4 text-sm">
            {project.group && (
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <Building2 className="h-3.5 w-3.5" />
                {project.group.name}
              </span>
            )}
            {project.directorate && (
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <Briefcase className="h-3.5 w-3.5" />
                {project.directorate.name}
              </span>
            )}
          </div>
          {project.businessAreas && project.businessAreas.length > 0 && (
            <div className="flex items-center gap-1.5 mt-2 flex-wrap">
              {project.businessAreas.map(ba => (
                <span key={ba.id} className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-muted text-muted-foreground border border-border">
                  {ba.name}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="border-t border-border my-6" />

      {/* People */}
      {(project.owner || project.businessLead || project.legalLead || (project.deliveryOwners && project.deliveryOwners.length > 0)) && (
        <>
          <div className="mb-6">
            <h3 className="text-sm font-bold text-foreground mb-3">People</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {project.owner && <PersonCard person={project.owner} role="Project Owner (SRO)" />}
              {project.businessLead && <PersonCard person={project.businessLead} role="Business Lead" />}
              {project.legalLead && <PersonCard person={project.legalLead} role="Legal Lead" />}
            </div>
            {project.deliveryOwners && project.deliveryOwners.length > 0 && (
              <div className="mt-3 flex items-center gap-2 flex-wrap">
                <span className="text-[11px] text-muted-foreground">Delivery owners:</span>
                {project.deliveryOwners.map(p => (
                  <span key={p.id} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-muted text-foreground border border-border">
                    {p.name}
                    {p.email && (
                      <a href={`mailto:${p.email}`} className="text-primary"><Mail className="h-3 w-3" /></a>
                    )}
                  </span>
                ))}
              </div>
            )}
          </div>
          <div className="border-t border-border my-6" />
        </>
      )}

      {/* Governance & Compliance */}
      <div className="mb-6">
        <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
          <Shield className="h-4 w-4" />
          Governance and assurance
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          <GovernanceChip label="Risk Register" status={project.riskRegister} />
          <GovernanceChip label="Governance Body" status={project.governanceBody} />
          <GovernanceChip label="DPIA" status={project.dpiaInPlace} />
          <GovernanceChip label="ATRS Assessment" status={project.actsInPlace} />
          <GovernanceChip label="Ethics Framework" status={project.ethicsFramework} />
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-muted/20">
            <Shield className="h-4 w-4 text-muted-foreground shrink-0" />
            <div>
              <p className="text-[11px] font-medium text-foreground">Tier</p>
              <p className="text-[10px] text-muted-foreground">{TIER_LABELS[project.governanceTier]}</p>
            </div>
          </div>
        </div>
        {project.governanceBodyName && (
          <p className="mt-2 text-xs text-muted-foreground">Governance body: {project.governanceBodyName}</p>
        )}
      </div>

      {/* Action Plan Links */}
      {project.linkedActions && project.linkedActions.length > 0 && (
        <>
          <div className="border-t border-border my-6" />
          <div className="mb-6">
            <h3 className="text-sm font-bold text-foreground mb-3">Action Plan Links</h3>
            <div className="flex items-center gap-2 flex-wrap">
              {project.linkedActions.map(a => (
                <span key={a.id} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-border bg-muted/20 text-xs">
                  <span className="text-muted-foreground font-mono">{a.actionNo}</span>
                  <span className="text-foreground font-medium truncate max-w-[200px]">{a.name}</span>
                </span>
              ))}
            </div>
          </div>
        </>
      )}

      <div className="border-t border-border my-6" />

      {/* Updates */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-foreground">Updates</h3>
          <button
            onClick={() => setShowUpdateForm(!showUpdateForm)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary text-primary-foreground text-[11px] font-medium hover:opacity-90 transition-opacity"
          >
            <Plus className="h-3 w-3" />
            Add update
          </button>
        </div>

        {showUpdateForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mb-4 p-4 rounded-lg border border-border bg-muted/20"
          >
            <input
              type="text"
              value={updateHeading}
              onChange={(e) => setUpdateHeading(e.target.value)}
              placeholder="Update heading"
              className="w-full px-3 py-2 rounded-lg border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30 mb-2"
            />
            <textarea
              value={updateContent}
              onChange={(e) => setUpdateContent(e.target.value)}
              placeholder="What's new with this project?"
              rows={4}
              className="w-full px-3 py-2 rounded-lg border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30 resize-none mb-3"
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowUpdateForm(false)} className="px-3 py-1.5 rounded-lg text-xs text-muted-foreground hover:text-foreground transition-colors">Cancel</button>
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
          </div>
        ) : (
          <ol className="relative border-l-2 border-border ml-2 space-y-0">
            {visibleUpdates.map((update, i) => (
              <motion.li
                key={update.id}
                initial={i === 0 ? { opacity: 0, y: -10 } : false}
                animate={{ opacity: 1, y: 0 }}
                className="pl-6 pb-6 relative"
              >
                <div className="absolute -left-[9px] top-0 h-4 w-4 rounded-full border-4 border-card bg-muted-foreground/30" />
                <time className="text-[10px] text-muted-foreground">{new Date(update.timestamp).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</time>
                <h4 className="text-sm font-semibold text-foreground mt-0.5">{update.heading}</h4>
                <p className="text-sm text-muted-foreground leading-relaxed mt-1 line-clamp-3">{update.content}</p>
              </motion.li>
            ))}
          </ol>
        )}

        {project.updates.length > 3 && (
          <button
            onClick={() => setShowAllUpdates(!showAllUpdates)}
            className="text-xs text-primary hover:underline font-medium"
          >
            {showAllUpdates ? 'Show fewer updates' : `View all ${project.updates.length} updates`}
          </button>
        )}
      </div>

      {/* Meta info */}
      {(project.supplier || project.activeUsers || project.fundingSource || project.githubUrl) && (
        <>
          <div className="border-t border-border my-6" />
          <div className="grid grid-cols-2 gap-3 text-sm">
            {project.supplier && <div><p className="text-[11px] text-muted-foreground">Supplier</p><p className="font-medium text-foreground">{project.supplier}</p></div>}
            {project.activeUsers && <div><p className="text-[11px] text-muted-foreground">Active users</p><p className="font-medium text-foreground">{project.activeUsers}</p></div>}
            {project.fundingSource && <div><p className="text-[11px] text-muted-foreground">Funding source</p><p className="font-medium text-foreground">{project.fundingSource}</p></div>}
            {project.githubUrl && <div><p className="text-[11px] text-muted-foreground">GitHub</p><a href={project.githubUrl} target="_blank" rel="noreferrer" className="text-primary hover:underline text-xs">{project.githubUrl}</a></div>}
          </div>
        </>
      )}

      <div className="border-t border-border my-6" />
      <div className="flex items-center gap-4 text-[10px] text-muted-foreground">
        <span>Created {relativeTime(project.createdAt)}</span>
        <span>Updated {relativeTime(project.updatedAt)}</span>
      </div>
    </div>
  );
}
