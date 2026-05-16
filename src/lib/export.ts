import type { Project } from './types';
import { STAGE_LABELS, TIER_LABELS, COMPLIANCE_LABELS } from './types';

function csvEscape(val: string): string {
  if (val.includes(',') || val.includes('"') || val.includes('\n')) {
    return `"${val.replace(/"/g, '""')}"`;
  }
  return val;
}

export function exportPortfolioCSV(projects: Project[]): void {
  const headers = [
    'Name', 'Stage', 'Governance Tier', 'Group', 'Directorate', 'Capability',
    'Owner', 'Owner Email', 'Business Lead', 'Legal Lead',
    'Risk Register', 'DPIA', 'ATRS', 'Ethics Framework', 'Governance Body',
    'Supplier', 'Active Users', 'Funding Source', 'Last Updated', 'Updates Count',
  ];
  const rows = projects.map(p => [
    p.name,
    STAGE_LABELS[p.projectStage],
    TIER_LABELS[p.governanceTier],
    p.group?.name || '',
    p.directorate?.name || '',
    p.capability || '',
    p.owner?.name || '',
    p.owner?.email || '',
    p.businessLead?.name || '',
    p.legalLead?.name || '',
    COMPLIANCE_LABELS[p.riskRegister],
    COMPLIANCE_LABELS[p.dpiaInPlace],
    COMPLIANCE_LABELS[p.actsInPlace],
    COMPLIANCE_LABELS[p.ethicsFramework],
    COMPLIANCE_LABELS[p.governanceBody],
    p.supplier || '',
    p.activeUsers || '',
    p.fundingSource || '',
    new Date(p.updatedAt).toLocaleDateString('en-GB'),
    p.updates.length.toString(),
  ].map(csvEscape));

  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `portfolio-export-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportProjectMarkdown(project: Project): string {
  const lines: string[] = [];
  lines.push(`# ${project.name}`);
  lines.push('');
  lines.push(`**Stage:** ${STAGE_LABELS[project.projectStage]} | **Tier:** ${TIER_LABELS[project.governanceTier]}`);
  if (project.group) lines.push(`**Group:** ${project.group.name}`);
  if (project.directorate) lines.push(`**Directorate:** ${project.directorate.name}`);
  lines.push('');
  lines.push(project.description);
  lines.push('');

  if (project.owner || project.businessLead || project.legalLead) {
    lines.push('## People');
    if (project.owner) lines.push(`- **Owner:** ${project.owner.name}${project.owner.email ? ` (${project.owner.email})` : ''}`);
    if (project.businessLead) lines.push(`- **Business Lead:** ${project.businessLead.name}`);
    if (project.legalLead) lines.push(`- **Legal Lead:** ${project.legalLead.name}`);
    lines.push('');
  }

  lines.push('## Governance & Compliance');
  lines.push(`- Risk Register: ${COMPLIANCE_LABELS[project.riskRegister]}`);
  lines.push(`- DPIA: ${COMPLIANCE_LABELS[project.dpiaInPlace]}`);
  lines.push(`- ATRS: ${COMPLIANCE_LABELS[project.actsInPlace]}`);
  lines.push(`- Ethics Framework: ${COMPLIANCE_LABELS[project.ethicsFramework]}`);
  lines.push(`- Governance Body: ${COMPLIANCE_LABELS[project.governanceBody]}${project.governanceBodyName ? ` (${project.governanceBodyName})` : ''}`);
  lines.push('');

  if (project.updates.length > 0) {
    lines.push('## Updates');
    for (const u of project.updates) {
      lines.push(`### ${u.heading} — ${new Date(u.timestamp).toLocaleDateString('en-GB')}`);
      lines.push(u.content);
      lines.push('');
    }
  }

  return lines.join('\n');
}

export function downloadProjectMarkdown(project: Project): void {
  const md = exportProjectMarkdown(project);
  const blob = new Blob([md], { type: 'text/markdown;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${project.name.toLowerCase().replace(/\s+/g, '-')}.md`;
  a.click();
  URL.revokeObjectURL(url);
}
