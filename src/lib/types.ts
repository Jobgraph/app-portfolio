export type ProjectStage = 'idea' | 'scan' | 'pilot' | 'scale' | 'stalled' | 'sunset';
export type GovernanceTier = 'tier_1' | 'tier_2' | 'tier_3' | 'to_be_completed';
export type ComplianceStatus = 'yes' | 'no' | 'in_progress' | 'not_sure' | 'na';

export interface Person {
  id: string;
  name: string;
  email?: string;
  phone?: string;
}

export interface OrgUnit {
  id: string;
  name: string;
}

export interface ProjectUpdate {
  id: string;
  heading: string;
  content: string;
  timestamp: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  projectStage: ProjectStage;
  governanceTier: GovernanceTier;
  createdAt: string;
  updatedAt: string;

  group?: OrgUnit;
  directorate?: OrgUnit;
  businessAreas?: OrgUnit[];
  capability?: string;

  owner?: Person;
  businessLead?: Person;
  deliveryOwners?: Person[];
  legalLead?: Person;

  riskRegister: ComplianceStatus;
  dpiaInPlace: ComplianceStatus;
  actsInPlace: ComplianceStatus;
  ethicsFramework: ComplianceStatus;
  governanceBody: ComplianceStatus;
  governanceBodyName?: string;

  supplier?: string;
  activeUsers?: string;
  fundingSource?: string;
  additionalContext?: string;

  updates: ProjectUpdate[];
}

export type View = 'portfolio' | 'submit' | 'detail';

export interface StageStyle {
  badge: string;
  text: string;
  bg: string;
  border: string;
}

export const STAGE_STYLES: Record<ProjectStage, StageStyle> = {
  idea:    { badge: 'bg-amber-50 text-amber-700 border-amber-200', text: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200' },
  scan:    { badge: 'bg-blue-50 text-blue-700 border-blue-200', text: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200' },
  pilot:   { badge: 'bg-orange-50 text-orange-700 border-orange-200', text: 'text-orange-700', bg: 'bg-orange-50', border: 'border-orange-200' },
  scale:   { badge: 'bg-emerald-50 text-emerald-700 border-emerald-200', text: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200' },
  stalled: { badge: 'bg-red-50 text-red-700 border-red-200', text: 'text-red-700', bg: 'bg-red-50', border: 'border-red-200' },
  sunset:  { badge: 'bg-neutral-100 text-neutral-500 border-neutral-200', text: 'text-neutral-500', bg: 'bg-neutral-100', border: 'border-neutral-200' },
};

export const STAGE_LABELS: Record<ProjectStage, string> = {
  idea: 'Idea',
  scan: 'Scan',
  pilot: 'Pilot',
  scale: 'Scale',
  stalled: 'Stalled',
  sunset: 'Sunset',
};

export const TIER_LABELS: Record<GovernanceTier, string> = {
  tier_1: 'Tier 1',
  tier_2: 'Tier 2',
  tier_3: 'Tier 3',
  to_be_completed: 'To be completed',
};

export const COMPLIANCE_LABELS: Record<ComplianceStatus, string> = {
  yes: 'Yes',
  no: 'No',
  in_progress: 'In progress',
  not_sure: 'Not sure',
  na: 'N/A',
};
