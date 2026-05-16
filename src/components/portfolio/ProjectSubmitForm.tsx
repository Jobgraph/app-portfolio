import { useState, useMemo } from 'react';
import { ArrowLeft, ArrowRight, Check, ChevronLeft } from 'lucide-react';
import type { Project, ProjectStage, GovernanceTier, ComplianceStatus } from '../../lib/types';
import { STAGE_LABELS, TIER_LABELS } from '../../lib/types';

type TierAnswer = 'tier1' | 'tier2' | 'tier3' | '';

interface FormState {
  tier_scope: TierAnswer;
  tier_userBase: TierAnswer;
  tier_thirdParty: TierAnswer;
  tier_publicTrust: TierAnswer;
  tier_legalImplications: TierAnswer;
  tier_complexity: TierAnswer;
  tier_decisionMaking: TierAnswer;
  tier_dataType: TierAnswer;

  name: string;
  description: string;
  projectStage: ProjectStage | '';
  capability: string;
  supplier: string;
  activeUsers: string;

  groupName: string;
  directorateName: string;

  ownerName: string;
  ownerEmail: string;
  businessLeadName: string;
  businessLeadEmail: string;
  legalLeadName: string;
  legalLeadEmail: string;

  riskRegister: ComplianceStatus | '';
  dpiaInPlace: ComplianceStatus | '';
  actsInPlace: ComplianceStatus | '';
  ethicsFramework: ComplianceStatus | '';
  governanceBody: ComplianceStatus | '';
  governanceBodyName: string;

  fundingSource: string;
  additionalContext: string;
}

const INITIAL: FormState = {
  tier_scope: '', tier_userBase: '', tier_thirdParty: '', tier_publicTrust: '',
  tier_legalImplications: '', tier_complexity: '', tier_decisionMaking: '', tier_dataType: '',
  name: '', description: '', projectStage: '', capability: '', supplier: '', activeUsers: '',
  groupName: '', directorateName: '',
  ownerName: '', ownerEmail: '', businessLeadName: '', businessLeadEmail: '', legalLeadName: '', legalLeadEmail: '',
  riskRegister: '', dpiaInPlace: '', actsInPlace: '', ethicsFramework: '', governanceBody: '', governanceBodyName: '',
  fundingSource: '', additionalContext: '',
};

const SECTIONS = [
  { title: 'Governance Tiering', description: 'Answer these questions to determine the governance tier for your project.' },
  { title: 'Project Details', description: 'Tell us about the project.' },
  { title: 'Organisation', description: 'Which part of the organisation is delivering this?' },
  { title: 'People', description: 'Who is involved in this project?' },
  { title: 'Governance & Compliance', description: 'What governance and compliance measures are in place?' },
  { title: 'Additional Information', description: 'Any other details about the project.' },
];

const TIER_QUESTIONS: { key: keyof FormState; question: string; options: { value: TierAnswer; label: string }[] }[] = [
  {
    key: 'tier_scope',
    question: 'What is the scope of this project?',
    options: [
      { value: 'tier1', label: 'Internal tool with limited scope' },
      { value: 'tier2', label: 'Department-wide system' },
      { value: 'tier3', label: 'Cross-department or public-facing' },
    ],
  },
  {
    key: 'tier_userBase',
    question: 'How large is the user base?',
    options: [
      { value: 'tier1', label: 'Small team (< 50 users)' },
      { value: 'tier2', label: 'Department-wide (50-1000 users)' },
      { value: 'tier3', label: 'Large scale (1000+ users or public)' },
    ],
  },
  {
    key: 'tier_thirdParty',
    question: 'Does this involve third-party suppliers?',
    options: [
      { value: 'tier1', label: 'No third-party involvement' },
      { value: 'tier2', label: 'Third-party tools or services used' },
      { value: 'tier3', label: 'Critical third-party dependency' },
    ],
  },
  {
    key: 'tier_publicTrust',
    question: 'Are there public trust implications?',
    options: [
      { value: 'tier1', label: 'No public trust implications' },
      { value: 'tier2', label: 'Some public interest' },
      { value: 'tier3', label: 'Significant public trust at stake' },
    ],
  },
  {
    key: 'tier_legalImplications',
    question: 'Are there legal or regulatory implications?',
    options: [
      { value: 'tier1', label: 'Minimal regulatory impact' },
      { value: 'tier2', label: 'Some regulatory considerations' },
      { value: 'tier3', label: 'Significant legal/regulatory requirements' },
    ],
  },
  {
    key: 'tier_complexity',
    question: 'What is the technical complexity?',
    options: [
      { value: 'tier1', label: 'Low complexity, standard tooling' },
      { value: 'tier2', label: 'Moderate complexity' },
      { value: 'tier3', label: 'High complexity, novel technology' },
    ],
  },
  {
    key: 'tier_decisionMaking',
    question: 'Does this involve automated decision-making?',
    options: [
      { value: 'tier1', label: 'No automated decisions' },
      { value: 'tier2', label: 'Assists human decision-making' },
      { value: 'tier3', label: 'Automated decisions affecting individuals' },
    ],
  },
  {
    key: 'tier_dataType',
    question: 'What type of data is involved?',
    options: [
      { value: 'tier1', label: 'Non-sensitive, aggregated data' },
      { value: 'tier2', label: 'Personal or operational data' },
      { value: 'tier3', label: 'Sensitive personal data or classified information' },
    ],
  },
];

const COMPLIANCE_OPTIONS: { value: ComplianceStatus; label: string }[] = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' },
  { value: 'in_progress', label: 'In progress' },
  { value: 'not_sure', label: 'Not sure' },
  { value: 'na', label: 'N/A' },
];

interface ProjectSubmitFormProps {
  onSubmit: (data: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'updates'>) => void;
  onCancel: () => void;
}

export function ProjectSubmitForm({ onSubmit, onCancel }: ProjectSubmitFormProps) {
  const [form, setForm] = useState<FormState>(INITIAL);
  const [section, setSection] = useState(0);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const calculatedTier = useMemo((): GovernanceTier => {
    const answers = [
      form.tier_scope, form.tier_userBase, form.tier_thirdParty, form.tier_publicTrust,
      form.tier_legalImplications, form.tier_complexity, form.tier_decisionMaking, form.tier_dataType,
    ].filter(Boolean);
    if (answers.length === 0) return 'to_be_completed';
    if (answers.some(a => a === 'tier3')) return 'tier_3';
    if (answers.some(a => a === 'tier2')) return 'tier_2';
    return 'tier_1';
  }, [form]);

  const canAdvance = (): boolean => {
    if (section === 0) return true;
    if (section === 1) return form.name.trim().length >= 3;
    return true;
  };

  const handleSubmit = () => {
    const data: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'updates'> = {
      name: form.name.trim(),
      description: form.description.trim(),
      projectStage: (form.projectStage || 'idea') as ProjectStage,
      governanceTier: calculatedTier,
      group: form.groupName ? { id: form.groupName.toLowerCase().replace(/\s+/g, '-'), name: form.groupName } : undefined,
      directorate: form.directorateName ? { id: form.directorateName.toLowerCase().replace(/\s+/g, '-'), name: form.directorateName } : undefined,
      capability: form.capability || undefined,
      owner: form.ownerName ? { id: form.ownerName.toLowerCase().replace(/\s+/g, '-'), name: form.ownerName, email: form.ownerEmail || undefined } : undefined,
      businessLead: form.businessLeadName ? { id: form.businessLeadName.toLowerCase().replace(/\s+/g, '-'), name: form.businessLeadName, email: form.businessLeadEmail || undefined } : undefined,
      legalLead: form.legalLeadName ? { id: form.legalLeadName.toLowerCase().replace(/\s+/g, '-'), name: form.legalLeadName, email: form.legalLeadEmail || undefined } : undefined,
      riskRegister: (form.riskRegister || 'not_sure') as ComplianceStatus,
      dpiaInPlace: (form.dpiaInPlace || 'not_sure') as ComplianceStatus,
      actsInPlace: (form.actsInPlace || 'not_sure') as ComplianceStatus,
      ethicsFramework: (form.ethicsFramework || 'not_sure') as ComplianceStatus,
      governanceBody: (form.governanceBody || 'not_sure') as ComplianceStatus,
      governanceBodyName: form.governanceBodyName || undefined,
      supplier: form.supplier || undefined,
      activeUsers: form.activeUsers || undefined,
      fundingSource: form.fundingSource || undefined,
      additionalContext: form.additionalContext || undefined,
    };
    onSubmit(data);
  };

  const goTo = (s: number) => {
    if (s >= 0 && s < SECTIONS.length) setSection(s);
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      {/* Back button */}
      <button onClick={onCancel} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
        <ChevronLeft className="h-4 w-4" />
        Back to portfolio
      </button>

      <h2 className="text-xl font-bold text-foreground mb-1">Submit a Project</h2>
      <p className="text-sm text-muted-foreground mb-8">Register a new project in the portfolio. All fields except project name are optional.</p>

      {/* Progress bar */}
      <div className="flex items-center gap-1 mb-8">
        {SECTIONS.map((s, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className={`flex-1 h-1.5 rounded-full transition-colors ${
              i <= section ? 'bg-primary' : 'bg-border'
            }`}
            title={s.title}
          />
        ))}
      </div>

      {/* Section header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-medium text-primary">Step {section + 1} of {SECTIONS.length}</span>
          {calculatedTier !== 'to_be_completed' && section === 0 && (
            <span className="text-xs font-medium text-muted-foreground">
              Calculated tier: {TIER_LABELS[calculatedTier]}
            </span>
          )}
        </div>
        <h3 className="text-lg font-bold text-foreground">{SECTIONS[section].title}</h3>
        <p className="text-sm text-muted-foreground">{SECTIONS[section].description}</p>
      </div>

      {/* Section content */}
      <div className="space-y-5 mb-8">
        {section === 0 && (
          <>
            {TIER_QUESTIONS.map((tq) => (
              <div key={tq.key}>
                <label className="block text-sm font-medium text-foreground mb-2">{tq.question}</label>
                <div className="space-y-1.5">
                  {tq.options.map((opt) => (
                    <label
                      key={opt.value}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border cursor-pointer transition-colors ${
                        form[tq.key] === opt.value
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:bg-muted/50'
                      }`}
                    >
                      <input
                        type="radio"
                        name={tq.key}
                        value={opt.value}
                        checked={form[tq.key] === opt.value}
                        onChange={() => set(tq.key, opt.value as TierAnswer)}
                        className="sr-only"
                      />
                      <div className={`h-4 w-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                        form[tq.key] === opt.value ? 'border-primary' : 'border-border'
                      }`}>
                        {form[tq.key] === opt.value && <div className="h-2 w-2 rounded-full bg-primary" />}
                      </div>
                      <span className="text-sm text-foreground">{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </>
        )}

        {section === 1 && (
          <>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Project name <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => set('name', e.target.value)}
                placeholder="e.g. Document Processing Pipeline"
                className="w-full px-3 py-2 rounded-lg border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => set('description', e.target.value)}
                rows={4}
                placeholder="What does this project do and why does it matter?"
                className="w-full px-3 py-2 rounded-lg border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30 resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Project stage</label>
              <select
                value={form.projectStage}
                onChange={(e) => set('projectStage', e.target.value as ProjectStage)}
                className="w-full px-3 py-2 rounded-lg border border-border bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
              >
                <option value="">Select stage...</option>
                {(Object.entries(STAGE_LABELS) as [ProjectStage, string][]).map(([v, l]) => (
                  <option key={v} value={v}>{l}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Capability</label>
              <input
                type="text"
                value={form.capability}
                onChange={(e) => set('capability', e.target.value)}
                placeholder="e.g. Document Processing, Predictive Analytics"
                className="w-full px-3 py-2 rounded-lg border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Supplier</label>
                <input
                  type="text"
                  value={form.supplier}
                  onChange={(e) => set('supplier', e.target.value)}
                  placeholder="e.g. In-house, Acme Corp"
                  className="w-full px-3 py-2 rounded-lg border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Active users</label>
                <input
                  type="text"
                  value={form.activeUsers}
                  onChange={(e) => set('activeUsers', e.target.value)}
                  placeholder="e.g. 150"
                  className="w-full px-3 py-2 rounded-lg border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
                />
              </div>
            </div>
          </>
        )}

        {section === 2 && (
          <>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Delivery group / business area</label>
              <input
                type="text"
                value={form.groupName}
                onChange={(e) => set('groupName', e.target.value)}
                placeholder="e.g. Digital Services, Operations, Policy"
                className="w-full px-3 py-2 rounded-lg border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Directorate</label>
              <input
                type="text"
                value={form.directorateName}
                onChange={(e) => set('directorateName', e.target.value)}
                placeholder="e.g. Technology & Innovation"
                className="w-full px-3 py-2 rounded-lg border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
              />
            </div>
          </>
        )}

        {section === 3 && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Project owner (SRO)</label>
                <input
                  type="text"
                  value={form.ownerName}
                  onChange={(e) => set('ownerName', e.target.value)}
                  placeholder="Full name"
                  className="w-full px-3 py-2 rounded-lg border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Owner email</label>
                <input
                  type="email"
                  value={form.ownerEmail}
                  onChange={(e) => set('ownerEmail', e.target.value)}
                  placeholder="email@example.gov.uk"
                  className="w-full px-3 py-2 rounded-lg border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Business lead</label>
                <input
                  type="text"
                  value={form.businessLeadName}
                  onChange={(e) => set('businessLeadName', e.target.value)}
                  placeholder="Full name"
                  className="w-full px-3 py-2 rounded-lg border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Business lead email</label>
                <input
                  type="email"
                  value={form.businessLeadEmail}
                  onChange={(e) => set('businessLeadEmail', e.target.value)}
                  placeholder="email@example.gov.uk"
                  className="w-full px-3 py-2 rounded-lg border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Legal lead</label>
                <input
                  type="text"
                  value={form.legalLeadName}
                  onChange={(e) => set('legalLeadName', e.target.value)}
                  placeholder="Full name"
                  className="w-full px-3 py-2 rounded-lg border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Legal lead email</label>
                <input
                  type="email"
                  value={form.legalLeadEmail}
                  onChange={(e) => set('legalLeadEmail', e.target.value)}
                  placeholder="email@example.gov.uk"
                  className="w-full px-3 py-2 rounded-lg border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
                />
              </div>
            </div>
          </>
        )}

        {section === 4 && (
          <>
            {([
              { key: 'riskRegister' as const, label: 'Is this on a risk register?' },
              { key: 'dpiaInPlace' as const, label: 'Is a DPIA in place?' },
              { key: 'actsInPlace' as const, label: 'Has an ATRS assessment been completed?' },
              { key: 'ethicsFramework' as const, label: 'Has an ethics framework review been done?' },
              { key: 'governanceBody' as const, label: 'Is there a governance body overseeing this?' },
            ]).map(({ key, label }) => (
              <div key={key}>
                <label className="block text-sm font-medium text-foreground mb-2">{label}</label>
                <div className="flex flex-wrap gap-2">
                  {COMPLIANCE_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => set(key, opt.value)}
                      className={`px-3 py-1.5 rounded-lg border text-sm transition-colors ${
                        form[key] === opt.value
                          ? 'border-primary bg-primary/5 text-primary font-medium'
                          : 'border-border text-muted-foreground hover:text-foreground hover:bg-muted/50'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
            {form.governanceBody === 'yes' && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Governance body name</label>
                <input
                  type="text"
                  value={form.governanceBodyName}
                  onChange={(e) => set('governanceBodyName', e.target.value)}
                  placeholder="e.g. Digital Board"
                  className="w-full px-3 py-2 rounded-lg border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
                />
              </div>
            )}
          </>
        )}

        {section === 5 && (
          <>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Funding source</label>
              <input
                type="text"
                value={form.fundingSource}
                onChange={(e) => set('fundingSource', e.target.value)}
                placeholder="e.g. Central Digital Fund, departmental budget"
                className="w-full px-3 py-2 rounded-lg border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Additional context</label>
              <textarea
                value={form.additionalContext}
                onChange={(e) => set('additionalContext', e.target.value)}
                rows={4}
                placeholder="Any other information about this project..."
                className="w-full px-3 py-2 rounded-lg border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30 resize-none"
              />
            </div>

            {/* Summary */}
            <div className="p-4 rounded-lg border border-border bg-muted/30">
              <h4 className="text-sm font-semibold text-foreground mb-3">Submission Summary</h4>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Project</dt>
                  <dd className="font-medium text-foreground">{form.name || '—'}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Stage</dt>
                  <dd className="font-medium text-foreground">{form.projectStage ? STAGE_LABELS[form.projectStage as ProjectStage] : '—'}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Governance Tier</dt>
                  <dd className="font-medium text-foreground">{TIER_LABELS[calculatedTier]}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Owner</dt>
                  <dd className="font-medium text-foreground">{form.ownerName || '—'}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Group</dt>
                  <dd className="font-medium text-foreground">{form.groupName || '—'}</dd>
                </div>
              </dl>
            </div>
          </>
        )}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-4 border-t border-border">
        <button
          onClick={() => section === 0 ? onCancel() : goTo(section - 1)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          {section === 0 ? 'Cancel' : 'Previous'}
        </button>

        {section < SECTIONS.length - 1 ? (
          <button
            onClick={() => goTo(section + 1)}
            disabled={!canAdvance()}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
            <ArrowRight className="h-4 w-4" />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={form.name.trim().length < 3}
            className="flex items-center gap-2 px-5 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Check className="h-4 w-4" />
            Submit Project
          </button>
        )}
      </div>
    </div>
  );
}
