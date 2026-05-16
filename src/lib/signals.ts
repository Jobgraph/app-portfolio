import type { Project } from './types';

export function isDpiaInProgress(value?: string | null): boolean {
  const v = (value || '').trim().toLowerCase();
  return v === 'in_progress' || v === 'in progress';
}

export function isDpiaMissing(value?: string | null): boolean {
  const v = (value || '').trim().toLowerCase();
  if (!v) return true;
  return v !== 'yes' && v !== 'na' && !isDpiaInProgress(v);
}

export function isDpiaIncomplete(value?: string | null): boolean {
  const v = (value || '').trim().toLowerCase();
  if (!v) return true;
  return v !== 'yes' && v !== 'na';
}

export function hasComplianceGap(project: Project): boolean {
  const stage = project.projectStage;
  const isTracked = stage === 'pilot' || stage === 'scale';
  return isTracked && (project.riskRegister !== 'yes' || isDpiaIncomplete(project.dpiaInPlace));
}

export function getLatestUpdateTimestamp(project: Project): number | null {
  const timestamps = (project.updates || [])
    .map((u) => Date.parse(u.timestamp || ''))
    .filter(Number.isFinite);
  return timestamps.length === 0 ? null : Math.max(...timestamps);
}

export function hasRecentUpdate(project: Project, days: number, now = Date.now()): boolean {
  const ts = getLatestUpdateTimestamp(project);
  return ts !== null && ts >= now - days * 86_400_000;
}

export function generateComplianceBriefing(projects: Project[]): string {
  if (projects.length === 0) return 'No eligible projects match the selected criteria.';

  const brief = (stage: string) => {
    const ps = projects.filter(p => p.projectStage === stage);
    if (ps.length === 0) return '';
    const dpiaOk = ps.filter(p => p.dpiaInPlace === 'yes').length;
    const dpiaNa = ps.filter(p => p.dpiaInPlace === 'na').length;
    const dpiaEligible = ps.length - dpiaNa;
    const rrOk = ps.filter(p => p.riskRegister === 'yes').length;
    const rrNa = ps.filter(p => p.riskRegister === 'na').length;
    const rrEligible = ps.length - rrNa;
    const pct = (n: number, t: number) => t === 0 ? '0' : Math.round((n / t) * 100).toString();
    return `${dpiaOk}/${dpiaEligible} eligible ${stage} projects have a completed DPIA (${pct(dpiaOk, dpiaEligible)}%). ${rrOk}/${rrEligible} eligible ${stage} projects have a risk register (${pct(rrOk, rrEligible)}%).`;
  };

  const result = [brief('pilot'), brief('scale')].filter(Boolean).join('\n\n');
  return result || 'No pilot or scale projects in the current portfolio.';
}
