import { useMemo, useState, useCallback } from 'react';
import { Search, SlidersHorizontal, FolderKanban, Shield, X, Download, ClipboardList, Activity, AlertTriangle, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Project, ProjectStage, GovernanceTier } from '../../lib/types';
import { STAGE_LABELS, TIER_LABELS, RISK_THEMES, PROJECT_CARD_COLORS } from '../../lib/types';
import { relativeTime } from '../../lib/utils';
import { hasComplianceGap, isDpiaInProgress, hasRecentUpdate, generateComplianceBriefing } from '../../lib/signals';
import { exportPortfolioCSV } from '../../lib/export';
import { StageBadge } from './StageBadge';
import { TierBadge } from './TierBadge';

interface PortfolioListProps {
  projects: Project[];
  onSelect: (id: string) => void;
  onSubmitNew: () => void;
  onEdit: () => void;
}

interface Filters {
  q: string;
  stage: string;
  group: string;
  governanceTier: string;
  capability: string;
  owner: string;
}

const STAGES: ProjectStage[] = ['idea', 'scan', 'pilot', 'scale', 'stalled', 'sunset'];
const TIERS: GovernanceTier[] = ['tier_1', 'tier_2', 'tier_3', 'to_be_completed'];

type InsightPanel = 'none' | 'action-plan' | 'stats' | 'compliance' | 'risk-themes';

export function PortfolioList({ projects, onSelect, onSubmitNew, onEdit }: PortfolioListProps) {
  const [filters, setFilters] = useState<Filters>({ q: '', stage: 'all', group: 'all', governanceTier: 'all', capability: 'all', owner: 'all' });
  const [showFilters, setShowFilters] = useState(false);
  const [activePanel, setActivePanel] = useState<InsightPanel>('none');

  const groups = useMemo(() => [...new Set(projects.map(p => p.group?.name).filter(Boolean))].sort() as string[], [projects]);
  const capabilities = useMemo(() => [...new Set(projects.map(p => p.capability).filter(Boolean))].sort() as string[], [projects]);
  const owners = useMemo(() => [...new Set(projects.map(p => p.owner?.name).filter(Boolean))].sort() as string[], [projects]);

  const filtered = useMemo(() => {
    return projects.filter((p) => {
      if (filters.q) {
        const q = filters.q.toLowerCase();
        const searchable = [p.name, p.description, p.owner?.name, p.group?.name, p.directorate?.name, p.capability,
          ...(p.deliveryOwners || []).map(d => d.name), p.businessLead?.name, p.legalLead?.name
        ].filter(Boolean).join(' ').toLowerCase();
        if (!searchable.includes(q)) return false;
      }
      if (filters.stage !== 'all' && p.projectStage !== filters.stage) return false;
      if (filters.group !== 'all' && p.group?.name !== filters.group) return false;
      if (filters.governanceTier !== 'all' && p.governanceTier !== filters.governanceTier) return false;
      if (filters.capability !== 'all' && p.capability !== filters.capability) return false;
      if (filters.owner !== 'all' && p.owner?.name !== filters.owner) return false;
      return true;
    });
  }, [projects, filters]);

  const stageCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const p of projects) counts[p.projectStage] = (counts[p.projectStage] || 0) + 1;
    return counts;
  }, [projects]);

  const linkedProjects = useMemo(() => projects.filter(p => p.linkedActions && p.linkedActions.length > 0), [projects]);
  const recentUpdates = useMemo(() => projects.filter(p => hasRecentUpdate(p, 30)), [projects]);
  const complianceGaps = useMemo(() => projects.filter(hasComplianceGap), [projects]);

  const actionCoverage = useMemo(() => {
    const actions = new Map<string, { actionNo: string; name: string; count: number }>();
    for (const p of projects) {
      for (const a of p.linkedActions || []) {
        const existing = actions.get(a.actionNo);
        if (existing) existing.count++;
        else actions.set(a.actionNo, { actionNo: a.actionNo, name: a.name, count: 1 });
      }
    }
    return [...actions.values()].sort((a, b) => a.actionNo.localeCompare(b.actionNo));
  }, [projects]);

  const complianceStats = useMemo(() => {
    const tracked = projects.filter(p => p.projectStage === 'pilot' || p.projectStage === 'scale');
    const total = tracked.length;
    const dpiaOk = tracked.filter(p => p.dpiaInPlace === 'yes').length;
    const rrOk = tracked.filter(p => p.riskRegister === 'yes').length;
    const govOk = tracked.filter(p => p.governanceBody === 'yes').length;
    const fullyCompliant = tracked.filter(p => p.riskRegister === 'yes' && p.dpiaInPlace === 'yes' && p.governanceBody === 'yes').length;
    const dpiaInProg = tracked.filter(p => isDpiaInProgress(p.dpiaInPlace)).length;
    return { total, dpiaOk, rrOk, govOk, fullyCompliant, dpiaInProg };
  }, [projects]);

  const activeFilterCount = Object.entries(filters).filter(([k, v]) => k !== 'q' && v !== 'all').length;
  const clearFilters = () => setFilters({ q: '', stage: 'all', group: 'all', governanceTier: 'all', capability: 'all', owner: 'all' });

  const togglePanel = useCallback((panel: InsightPanel) => {
    setActivePanel(prev => prev === panel ? 'none' : panel);
  }, []);

  const filterChips = useMemo(() => {
    const chips: { key: string; label: string; clear: () => void }[] = [];
    if (filters.stage !== 'all') chips.push({ key: 'stage', label: `Stage: ${STAGE_LABELS[filters.stage as ProjectStage]}`, clear: () => setFilters(f => ({ ...f, stage: 'all' })) });
    if (filters.group !== 'all') chips.push({ key: 'group', label: `Group: ${filters.group}`, clear: () => setFilters(f => ({ ...f, group: 'all' })) });
    if (filters.governanceTier !== 'all') chips.push({ key: 'tier', label: `Tier: ${TIER_LABELS[filters.governanceTier as GovernanceTier]}`, clear: () => setFilters(f => ({ ...f, governanceTier: 'all' })) });
    if (filters.capability !== 'all') chips.push({ key: 'capability', label: `Capability: ${filters.capability}`, clear: () => setFilters(f => ({ ...f, capability: 'all' })) });
    if (filters.owner !== 'all') chips.push({ key: 'owner', label: `Owner: ${filters.owner}`, clear: () => setFilters(f => ({ ...f, owner: 'all' })) });
    return chips;
  }, [filters]);

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header card */}
      <div className="border border-border rounded-xl bg-card p-6 mb-4">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground mb-1">Delivery portfolio</p>
            <h1 className="text-3xl font-extrabold text-foreground">Portfolio</h1>
            <p className="text-sm text-muted-foreground mt-1">Track and manage projects across your organisation.</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => exportPortfolioCSV(filtered)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-full border border-border text-xs font-medium text-muted-foreground hover:bg-[#217346]/10 hover:text-[#217346] hover:border-[#217346]/30 transition-colors"
            >
              <Download className="h-3.5 w-3.5" />
              Export ({filtered.length})
            </button>
            <button
              onClick={onEdit}
              className="flex items-center gap-1.5 px-3 py-2 rounded-full border border-border text-xs font-medium text-muted-foreground hover:bg-[#f7eef2] hover:text-[#5f4a52] hover:border-[#e3c0ce] transition-colors"
            >
              Edit portfolio
            </button>
            <button
              onClick={onSubmitNew}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-primary text-primary-foreground text-xs font-medium hover:opacity-90 transition-opacity"
            >
              New Project
            </button>
          </div>
        </div>
      </div>

      {/* Filter bar */}
      <div className="border border-border rounded-xl bg-card mb-4">
        <div className="px-4 py-3 flex items-center justify-between border-b border-border">
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground">
              Showing <span className="font-medium text-foreground">{filtered.length}</span> of {projects.length} projects
            </span>
            {activeFilterCount > 0 && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#f7eef2] text-[#5f4a52] border border-[#e3c0ce]">
                Filters applied
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                showFilters ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              Filters
              <ChevronDown className={`h-3 w-3 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>
            {activeFilterCount > 0 && (
              <button onClick={clearFilters} className="text-[10px] text-muted-foreground hover:text-destructive transition-colors">
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Filter controls */}
        {showFilters && (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-px bg-border">
            <FilterCell label="Stage">
              <FilterSelect value={filters.stage} onChange={(v) => setFilters(f => ({ ...f, stage: v }))}>
                <option value="all">All stages</option>
                {STAGES.map(s => <option key={s} value={s}>{STAGE_LABELS[s]}</option>)}
              </FilterSelect>
            </FilterCell>
            <FilterCell label="Group">
              <FilterSelect value={filters.group} onChange={(v) => setFilters(f => ({ ...f, group: v }))}>
                <option value="all">All groups</option>
                {groups.map(g => <option key={g} value={g}>{g}</option>)}
              </FilterSelect>
            </FilterCell>
            <FilterCell label="Governance tier">
              <FilterSelect value={filters.governanceTier} onChange={(v) => setFilters(f => ({ ...f, governanceTier: v }))}>
                <option value="all">All tiers</option>
                {TIERS.map(t => <option key={t} value={t}>{TIER_LABELS[t]}</option>)}
              </FilterSelect>
            </FilterCell>
            <FilterCell label="Owner">
              <FilterSelect value={filters.owner} onChange={(v) => setFilters(f => ({ ...f, owner: v }))}>
                <option value="all">All owners</option>
                {owners.map(o => <option key={o} value={o}>{o}</option>)}
              </FilterSelect>
            </FilterCell>
            <FilterCell label="Capability">
              <FilterSelect value={filters.capability} onChange={(v) => setFilters(f => ({ ...f, capability: v }))}>
                <option value="all">All capabilities</option>
                {capabilities.map(c => <option key={c} value={c}>{c}</option>)}
              </FilterSelect>
            </FilterCell>
            <FilterCell label="Search">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <input
                  type="text"
                  value={filters.q}
                  onChange={(e) => setFilters(f => ({ ...f, q: e.target.value }))}
                  placeholder="Search..."
                  className="w-full pl-8 pr-3 h-11 rounded-[18px] border border-border bg-muted/30 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
                />
              </div>
            </FilterCell>
          </div>
        )}

        {/* Active filter chips */}
        {filterChips.length > 0 && (
          <div className="px-4 py-2 flex items-center gap-2 flex-wrap border-t border-border">
            {filterChips.map(chip => (
              <button
                key={chip.key}
                onClick={chip.clear}
                className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-[#f7eef2] text-[#5f4a52] border border-[#e3c0ce] hover:bg-[#e3c0ce]/50 transition-colors"
              >
                {chip.label}
                <X className="h-3 w-3" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Insight cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-border border border-border rounded-xl overflow-hidden mb-4">
        <InsightCard
          label="Action plan"
          value={linkedProjects.length}
          hint={`${linkedProjects.length} projects linked to action plan items`}
          icon={<ClipboardList className="h-4 w-4" />}
          tone="rose"
          active={activePanel === 'action-plan'}
          onClick={() => togglePanel('action-plan')}
        />
        <InsightCard
          label="Recent activity"
          value={recentUpdates.length}
          hint={`${recentUpdates.length} projects with updates in last 30 days`}
          icon={<Activity className="h-4 w-4" />}
          tone="blue"
          active={activePanel === 'stats'}
          onClick={() => togglePanel('stats')}
        />
        <InsightCard
          label="Compliance"
          value={complianceGaps.length}
          hint={`${complianceGaps.length} pilot/scale projects with compliance gaps`}
          icon={<Shield className="h-4 w-4" />}
          tone="amber"
          active={activePanel === 'compliance'}
          onClick={() => togglePanel('compliance')}
        />
        <InsightCard
          label="Risk themes"
          value={RISK_THEMES.length}
          hint={`${RISK_THEMES.length} cross-cutting risk themes tracked`}
          icon={<AlertTriangle className="h-4 w-4" />}
          tone="red"
          active={activePanel === 'risk-themes'}
          onClick={() => togglePanel('risk-themes')}
        />
      </div>

      {/* Panels */}
      <AnimatePresence mode="wait">
        {activePanel === 'action-plan' && (
          <PanelWrapper key="action-plan">
            <PanelHeader title="Action Plan Coverage" subtitle={`${linkedProjects.length} projects linked to ${actionCoverage.length} actions`} />
            {actionCoverage.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4">No projects are linked to action plan items yet.</p>
            ) : (
              <div className="space-y-1.5 mt-3">
                {actionCoverage.map(a => (
                  <button
                    key={a.actionNo}
                    onClick={() => setFilters(f => ({ ...f, q: a.name }))}
                    className="w-full flex items-center justify-between px-4 py-3 rounded-lg border border-border bg-card hover:bg-muted/50 transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono text-muted-foreground">{a.actionNo}</span>
                      <span className="text-sm font-medium text-foreground">{a.name}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-bold text-foreground">{a.count}</span>
                      <span className="text-xs text-muted-foreground ml-1">project{a.count !== 1 ? 's' : ''}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </PanelWrapper>
        )}

        {activePanel === 'stats' && (
          <PanelWrapper key="stats">
            <PanelHeader title="Portfolio Activity" subtitle="Updates and stage breakdown" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              {/* Donut */}
              <div className="flex items-center gap-4">
                <svg viewBox="0 0 36 36" className="h-24 w-24 shrink-0 -rotate-90">
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke="currentColor" className="text-border" strokeWidth="3.5" />
                  {(() => {
                    const scan = stageCounts['scan'] || 0;
                    const pilot = stageCounts['pilot'] || 0;
                    const scale = stageCounts['scale'] || 0;
                    const total = projects.length || 1;
                    const circumference = 100;
                    let offset = 0;
                    const arcs = [
                      { count: scan, color: '#93c5fd' },
                      { count: pilot, color: '#fcd34d' },
                      { count: scale, color: '#6ee7b7' },
                    ];
                    return arcs.map(({ count, color }, i) => {
                      const pct = (count / total) * circumference;
                      const el = <circle key={i} cx="18" cy="18" r="15.9" fill="none" stroke={color} strokeWidth="3.5" strokeDasharray={`${pct} ${circumference - pct}`} strokeDashoffset={`-${offset}`} />;
                      offset += pct;
                      return el;
                    });
                  })()}
                </svg>
                <div>
                  <p className="text-3xl font-extrabold text-foreground">{projects.length}</p>
                  <p className="text-xs text-muted-foreground">projects</p>
                  <div className="mt-2 space-y-1">
                    {(['scan', 'pilot', 'scale'] as ProjectStage[]).map(s => (
                      <button key={s} onClick={() => setFilters(f => ({ ...f, stage: s }))} className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors">
                        <span className={`h-2 w-2 rounded-full ${s === 'scan' ? 'bg-blue-300' : s === 'pilot' ? 'bg-amber-300' : 'bg-emerald-300'}`} />
                        {STAGE_LABELS[s]} ({stageCounts[s] || 0})
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Top capabilities */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">Top Capabilities</p>
                {(() => {
                  const capMap = new Map<string, number>();
                  for (const p of projects) if (p.capability) capMap.set(p.capability, (capMap.get(p.capability) || 0) + 1);
                  const sorted = [...capMap.entries()].sort((a, b) => b[1] - a[1]).slice(0, 4);
                  const max = sorted[0]?.[1] || 1;
                  return sorted.map(([name, count]) => (
                    <div key={name} className="mb-2">
                      <div className="flex items-center justify-between text-xs text-foreground mb-0.5">
                        <span className="truncate">{name}</span>
                        <span className="text-muted-foreground ml-2">{count}</span>
                      </div>
                      <div className="h-1 bg-border rounded-full">
                        <div className="h-1 bg-muted-foreground/40 rounded-full" style={{ width: `${(count / max) * 100}%` }} />
                      </div>
                    </div>
                  ));
                })()}
              </div>

              {/* Activity pulse */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">Activity Pulse</p>
                <p className="text-3xl font-extrabold text-foreground">{recentUpdates.length}</p>
                <p className="text-xs text-muted-foreground">projects updated in last 30 days</p>
                <div className="mt-3 max-h-48 overflow-y-auto space-y-1.5">
                  {projects
                    .filter(p => p.updates.length > 0)
                    .sort((a, b) => new Date(b.updates[0].timestamp).getTime() - new Date(a.updates[0].timestamp).getTime())
                    .slice(0, 8)
                    .map(p => (
                      <button
                        key={p.id}
                        onClick={() => onSelect(p.id)}
                        className="w-full flex items-center justify-between px-2 py-1.5 rounded text-left hover:bg-muted/50 transition-colors"
                      >
                        <div className="min-w-0">
                          <p className="text-[11px] font-medium text-foreground truncate">{p.name}</p>
                          <p className="text-[10px] text-muted-foreground truncate">{p.updates[0].heading}</p>
                        </div>
                        <span className="text-[10px] text-muted-foreground ml-2 shrink-0">{relativeTime(p.updates[0].timestamp)}</span>
                      </button>
                    ))}
                </div>
              </div>
            </div>
          </PanelWrapper>
        )}

        {activePanel === 'compliance' && (
          <PanelWrapper key="compliance">
            <PanelHeader title="Compliance Gaps" subtitle="Scale & Pilot projects only — excludes DPIA N/A" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
              <ComplianceStat label="DPIA Complete" value={complianceStats.dpiaOk} total={complianceStats.total} color="text-teal-600" />
              <ComplianceStat label="Risk Register" value={complianceStats.rrOk} total={complianceStats.total} color="text-slate-600" />
              <ComplianceStat label="Governance Body" value={complianceStats.govOk} total={complianceStats.total} color="text-indigo-600" />
              <ComplianceStat label="Fully Compliant" value={complianceStats.fullyCompliant} total={complianceStats.total} color="text-purple-600" />
            </div>
            {complianceStats.dpiaInProg > 0 && (
              <p className="mt-3 text-xs text-amber-600 font-medium">{complianceStats.dpiaInProg} project{complianceStats.dpiaInProg !== 1 ? 's' : ''} with DPIA in progress</p>
            )}
            {complianceGaps.length > 0 && (
              <div className="mt-4 space-y-1.5">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Projects with gaps</p>
                {complianceGaps.map(p => (
                  <button
                    key={p.id}
                    onClick={() => onSelect(p.id)}
                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg border border-border bg-card hover:bg-muted/50 transition-colors text-left"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{p.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        {p.riskRegister !== 'yes' && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">Missing RR</span>}
                        {isDpiaInProgress(p.dpiaInPlace) && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700 border border-blue-200">DPIA in progress</span>}
                        {p.dpiaInPlace !== 'yes' && p.dpiaInPlace !== 'na' && !isDpiaInProgress(p.dpiaInPlace) && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-rose-100 text-rose-700 border border-rose-200">Missing DPIA</span>}
                      </div>
                    </div>
                    <StageBadge stage={p.projectStage} />
                  </button>
                ))}
              </div>
            )}
            <div className="mt-4 p-3 rounded-lg bg-muted/30 border border-border">
              <p className="text-xs font-medium text-muted-foreground mb-1">Compliance briefing</p>
              <p className="text-xs text-foreground whitespace-pre-line">{generateComplianceBriefing(projects)}</p>
            </div>
          </PanelWrapper>
        )}

        {activePanel === 'risk-themes' && (
          <PanelWrapper key="risk-themes">
            <PanelHeader title="Cross-cutting Risk Themes" subtitle="Tracked across all portfolio projects" />
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 pr-4 text-xs font-semibold text-muted-foreground w-16">ID</th>
                    <th className="text-left py-2 pr-4 text-xs font-semibold text-muted-foreground w-56">Risk Theme</th>
                    <th className="text-left py-2 text-xs font-semibold text-muted-foreground">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {RISK_THEMES.map(rt => (
                    <tr key={rt.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                      <td className="py-2.5 pr-4 font-mono text-xs text-muted-foreground">{rt.id}</td>
                      <td className="py-2.5 pr-4 font-medium text-foreground">{rt.theme}</td>
                      <td className="py-2.5 text-muted-foreground text-xs">{rt.desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </PanelWrapper>
        )}
      </AnimatePresence>

      {/* Project grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <FolderKanban className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm font-medium">No projects found</p>
          <p className="text-xs mt-1">Try adjusting your search or filters.</p>
        </div>
      ) : (
        <div className="grid gap-px md:grid-cols-2 xl:grid-cols-3 bg-border rounded-xl overflow-hidden border border-border">
          {filtered.map((project, index) => (
            <ProjectCard key={project.id} project={project} index={index} onClick={() => onSelect(project.id)} />
          ))}
        </div>
      )}
    </div>
  );
}

function ProjectCard({ project, index, onClick }: { project: Project; index: number; onClick: () => void }) {
  const colors = PROJECT_CARD_COLORS[index % PROJECT_CARD_COLORS.length];
  const latestUpdate = project.updates[0];

  return (
    <button onClick={onClick} className="bg-card px-7 py-7 text-left hover:bg-muted/30 transition-colors group relative">
      {/* Top row */}
      <div className="flex items-center justify-between mb-2">
        <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground truncate">
          {[project.group?.name, project.directorate?.name].filter(Boolean).join(' · ') || 'Delivery area not set'}
        </p>
        <StageBadge stage={project.projectStage} />
      </div>

      {/* Title & description */}
      <h3 className="text-[1.1rem] font-bold text-foreground leading-tight mb-1.5 line-clamp-2 group-hover:text-primary transition-colors">
        {project.name}
      </h3>
      <p className="text-[13px] text-muted-foreground line-clamp-3 mb-3 leading-relaxed">{project.description}</p>

      {/* Chips */}
      <div className="flex items-center gap-1.5 flex-wrap mb-4">
        {project.capability && (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium border" style={{ background: colors.chip, borderColor: colors.chipBorder }}>
            {project.capability}
          </span>
        )}
        {project.businessAreas && project.businessAreas.length > 0 && (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium border" style={{ background: colors.chip, borderColor: colors.chipBorder }}>
            {project.businessAreas.length === 1 ? project.businessAreas[0].name : `${project.businessAreas.length} business areas`}
          </span>
        )}
        {project.linkedActions && project.linkedActions.length > 0 && (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium border" style={{ background: colors.chip, borderColor: colors.chipBorder }}>
            {project.linkedActions.length} action{project.linkedActions.length !== 1 ? 's' : ''} linked
          </span>
        )}
        <TierBadge tier={project.governanceTier} />
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-border">
        <div>
          <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Delivery lead</p>
          <p className="text-xs font-medium text-foreground">{project.owner?.name || 'Not assigned'}</p>
        </div>
        <div className="text-right">
          <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Last updated</p>
          <p className="text-xs text-muted-foreground">
            {latestUpdate ? new Date(latestUpdate.timestamp).toLocaleDateString('en-GB') : 'No updates yet'}
          </p>
        </div>
      </div>
    </button>
  );
}

function InsightCard({ label, value, hint, icon, tone, active, onClick }: {
  label: string; value: number; hint: string; icon: React.ReactNode;
  tone: 'rose' | 'blue' | 'amber' | 'red'; active: boolean; onClick: () => void;
}) {
  const tones = {
    rose: active ? 'bg-[#f7eef2] text-neutral-950' : 'bg-card text-foreground hover:bg-[#f7eef2]/50',
    blue: active ? 'bg-blue-50 text-blue-950' : 'bg-card text-foreground hover:bg-blue-50/50',
    amber: active ? 'bg-amber-50 text-amber-950' : 'bg-card text-foreground hover:bg-amber-50/50',
    red: active ? 'bg-rose-50 text-rose-950' : 'bg-card text-foreground hover:bg-rose-50/50',
  };
  return (
    <button onClick={onClick} aria-pressed={active} aria-label={`${label}: ${value}. ${hint}`} className={`w-full px-4 py-3.5 text-left transition-colors ${tones[tone]}`}>
      <div className="flex items-center gap-3">
        <div className={`shrink-0 rounded-md border p-1.5 ${active ? 'border-current/20 bg-white/20' : 'border-border bg-muted/30'}`}>
          {icon}
        </div>
        <div className="min-w-0">
          <span className={`text-[10px] font-semibold uppercase tracking-[0.08em] ${active ? 'text-current/80' : 'text-muted-foreground'}`}>{label}</span>
          <p className="text-lg font-bold leading-tight">{value}</p>
        </div>
      </div>
    </button>
  );
}

function PanelWrapper({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.2 }}
      className="overflow-hidden mb-4"
    >
      <div className="border border-border rounded-xl bg-card p-6">
        {children}
      </div>
    </motion.div>
  );
}

function PanelHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div>
      <h3 className="text-base font-bold text-foreground">{title}</h3>
      <p className="text-xs text-muted-foreground">{subtitle}</p>
    </div>
  );
}

function ComplianceStat({ label, value, total, color }: { label: string; value: number; total: number; color: string }) {
  const pct = total === 0 ? 0 : Math.round((value / total) * 100);
  return (
    <div className="p-3 rounded-lg border border-border bg-card">
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <div className="flex items-baseline gap-1.5">
        <span className={`text-xl font-bold ${color}`}>{value}/{total}</span>
        <span className={`text-xs font-medium px-1.5 py-0.5 rounded-full ${
          pct >= 80 ? 'bg-emerald-100 text-emerald-700' : pct >= 50 ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'
        }`}>{pct}%</span>
      </div>
      <div className="mt-1.5 h-1 bg-border rounded-full">
        <div className={`h-1 rounded-full ${pct >= 80 ? 'bg-emerald-400' : pct >= 50 ? 'bg-amber-400' : 'bg-rose-400'}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function FilterCell({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col bg-card px-4 py-2.5 min-h-[84px]">
      <div className="text-[11px] font-medium text-muted-foreground mb-1.5">{label}</div>
      <div className="flex-1">{children}</div>
    </div>
  );
}

function FilterSelect({ value, onChange, children }: { value: string; onChange: (v: string) => void; children: React.ReactNode }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full h-11 rounded-[18px] border border-border bg-muted/30 px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30 appearance-none"
    >
      {children}
    </select>
  );
}
