import { useMemo, useState } from 'react';
import { Search, SlidersHorizontal, FolderKanban, Users, Shield, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Project, ProjectStage, GovernanceTier } from '../../lib/types';
import { STAGE_LABELS, TIER_LABELS } from '../../lib/types';
import { relativeTime } from '../../lib/utils';
import { StageBadge } from './StageBadge';
import { TierBadge } from './TierBadge';

interface PortfolioListProps {
  projects: Project[];
  onSelect: (id: string) => void;
  onSubmitNew: () => void;
}

interface Filters {
  q: string;
  stage: string;
  group: string;
  governanceTier: string;
}

const STAGES: ProjectStage[] = ['idea', 'scan', 'pilot', 'scale', 'stalled', 'sunset'];
const TIERS: GovernanceTier[] = ['tier_1', 'tier_2', 'tier_3', 'to_be_completed'];

export function PortfolioList({ projects, onSelect, onSubmitNew }: PortfolioListProps) {
  const [filters, setFilters] = useState<Filters>({ q: '', stage: 'all', group: 'all', governanceTier: 'all' });
  const [showFilters, setShowFilters] = useState(false);

  const groups = useMemo(() => {
    const set = new Set<string>();
    for (const p of projects) {
      if (p.group?.name) set.add(p.group.name);
    }
    return Array.from(set).sort();
  }, [projects]);

  const filtered = useMemo(() => {
    return projects.filter((p) => {
      if (filters.q) {
        const q = filters.q.toLowerCase();
        const searchable = [p.name, p.description, p.owner?.name, p.group?.name, p.directorate?.name, p.capability].filter(Boolean).join(' ').toLowerCase();
        if (!searchable.includes(q)) return false;
      }
      if (filters.stage !== 'all' && p.projectStage !== filters.stage) return false;
      if (filters.group !== 'all' && p.group?.name !== filters.group) return false;
      if (filters.governanceTier !== 'all' && p.governanceTier !== filters.governanceTier) return false;
      return true;
    });
  }, [projects, filters]);

  const stageCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const p of projects) counts[p.projectStage] = (counts[p.projectStage] || 0) + 1;
    return counts;
  }, [projects]);

  const activeFilterCount = [filters.stage, filters.group, filters.governanceTier].filter(f => f !== 'all').length;

  const clearFilters = () => setFilters({ q: '', stage: 'all', group: 'all', governanceTier: 'all' });

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-foreground">Project Portfolio</h2>
          <p className="text-sm text-muted-foreground mt-0.5">{projects.length} projects across your organisation</p>
        </div>
        <button
          onClick={onSubmitNew}
          className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
        >
          Submit project
        </button>
      </div>

      {/* Stage summary cards */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-6">
        {STAGES.map((stage) => (
          <button
            key={stage}
            onClick={() => setFilters(f => ({ ...f, stage: f.stage === stage ? 'all' : stage }))}
            className={`px-3 py-2 rounded-lg border text-center transition-all ${
              filters.stage === stage
                ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
                : 'border-border bg-card hover:bg-muted'
            }`}
          >
            <div className="text-lg font-bold text-foreground">{stageCounts[stage] || 0}</div>
            <div className="text-[11px] font-medium text-muted-foreground capitalize">{STAGE_LABELS[stage]}</div>
          </button>
        ))}
      </div>

      {/* Search & filter bar */}
      <div className="flex items-center gap-2 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={filters.q}
            onChange={(e) => setFilters(f => ({ ...f, q: e.target.value }))}
            placeholder="Search projects..."
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${
            showFilters || activeFilterCount > 0
              ? 'border-primary bg-primary/5 text-primary'
              : 'border-border bg-card text-muted-foreground hover:text-foreground'
          }`}
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filters
          {activeFilterCount > 0 && (
            <span className="px-1.5 py-0.5 rounded-full bg-primary text-primary-foreground text-[10px]">
              {activeFilterCount}
            </span>
          )}
        </button>
        {activeFilterCount > 0 && (
          <button onClick={clearFilters} className="p-2 text-muted-foreground hover:text-destructive transition-colors">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Expanded filters */}
      {showFilters && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6 p-4 rounded-lg border border-border bg-card">
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Stage</label>
            <select
              value={filters.stage}
              onChange={(e) => setFilters(f => ({ ...f, stage: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground"
            >
              <option value="all">All stages</option>
              {STAGES.map(s => <option key={s} value={s}>{STAGE_LABELS[s]}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Group</label>
            <select
              value={filters.group}
              onChange={(e) => setFilters(f => ({ ...f, group: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground"
            >
              <option value="all">All groups</option>
              {groups.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Governance Tier</label>
            <select
              value={filters.governanceTier}
              onChange={(e) => setFilters(f => ({ ...f, governanceTier: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground"
            >
              <option value="all">All tiers</option>
              {TIERS.map(t => <option key={t} value={t}>{TIER_LABELS[t]}</option>)}
            </select>
          </div>
        </div>
      )}

      {/* Results */}
      <div className="text-xs text-muted-foreground mb-3">
        Showing {filtered.length} of {projects.length} projects
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <FolderKanban className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm font-medium">No projects match your filters</p>
          <p className="text-xs mt-1">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="space-y-2">
          <AnimatePresence mode="popLayout">
            {filtered.map((project) => (
              <motion.div
                key={project.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <button
                  onClick={() => onSelect(project.id)}
                  className="w-full text-left p-4 rounded-lg border border-border bg-card hover:bg-muted/50 transition-colors group"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                          {project.name}
                        </h3>
                        <StageBadge stage={project.projectStage} />
                        <TierBadge tier={project.governanceTier} />
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{project.description}</p>
                      <div className="flex items-center gap-4 text-[11px] text-muted-foreground">
                        {project.group && (
                          <span className="flex items-center gap-1">
                            <FolderKanban className="h-3 w-3" />
                            {project.group.name}
                          </span>
                        )}
                        {project.owner && (
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {project.owner.name}
                          </span>
                        )}
                        {project.capability && (
                          <span className="flex items-center gap-1">
                            <Shield className="h-3 w-3" />
                            {project.capability}
                          </span>
                        )}
                        <span>Updated {relativeTime(project.updatedAt)}</span>
                      </div>
                    </div>
                    {project.updates.length > 0 && (
                      <div className="shrink-0 text-right">
                        <span className="text-[10px] text-muted-foreground">{project.updates.length} update{project.updates.length !== 1 ? 's' : ''}</span>
                      </div>
                    )}
                  </div>
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
