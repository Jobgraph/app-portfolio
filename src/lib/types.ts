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

export interface ActionLink {
  id: string;
  actionNo: string;
  name: string;
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
  githubUrl?: string;
  additionalContext?: string;

  linkedActions?: ActionLink[];
  updates: ProjectUpdate[];
}

export type View = 'portfolio' | 'submit' | 'detail' | 'edit' | 'action-plan' | 'analytics';

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

export const RISK_THEMES = [
  { id: 'TH-01', theme: 'Accuracy / Inc. Hallucination', desc: 'Risk that outputs are wrong, inconsistent, or degrade over time, leading to harmful decisions or loss of confidence.' },
  { id: 'TH-02', theme: 'Supply chain', desc: 'Risk we cannot adequately commission, assure and contract manage 3rd parties providing products.' },
  { id: 'TH-03', theme: 'Data protection & privacy', desc: 'Risk that data processing lacks appropriate safeguards and privacy controls, resulting in non-compliance or harm.' },
  { id: 'TH-04', theme: 'Environmental & sustainability', desc: 'Risk we fail to understand or meet sustainability obligations at scale.' },
  { id: 'TH-05', theme: 'Ethical acceptability', desc: 'Risk we pursue use-cases that are ethically unacceptable.' },
  { id: 'TH-06', theme: 'Fairness and bias', desc: 'Risk that outcomes are systematically worse for certain groups or contexts.' },
  { id: 'TH-07', theme: 'Human authority & oversight', desc: 'Risk that humans do not meaningfully review or override outputs as designed.' },
  { id: 'TH-08', theme: 'Legal defensibility', desc: "Risk we don't operate within the law." },
  { id: 'TH-09', theme: 'People capability & adoption', desc: "Risk workforce can't or won't use tools safely, or impacts are not managed appropriately." },
  { id: 'TH-10', theme: 'Resilience & business continuity', desc: 'Risk services fail in operation, creating operational harm at scale.' },
  { id: 'TH-11', theme: 'Security & adversarial threats', desc: 'Risk of compromise via vulnerabilities, attacks, manipulation, or weak security operations.' },
  { id: 'TH-12', theme: 'Transparency & explainability', desc: "Risk we can't explain the role of technology, evidence accountability, or reconstruct what happened." },
  { id: 'TH-13', theme: 'Value for money / impact', desc: 'Risk we spend resources but do not deliver value, undermining credibility.' },
];

export const PROJECT_CARD_COLORS = [
  { chip: '#EEF3F8', chipBorder: '#D7E0EA' },
  { chip: '#F7EFF4', chipBorder: '#E7D2DE' },
  { chip: '#F6F1EC', chipBorder: '#E5DACD' },
  { chip: '#F1F5F2', chipBorder: '#D8E4DB' },
  { chip: '#F0F1F4', chipBorder: '#DBDCE2' },
];
