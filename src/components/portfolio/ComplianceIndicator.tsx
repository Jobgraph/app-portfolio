import { CheckCircle2, XCircle, Clock, HelpCircle, Minus } from 'lucide-react';
import type { ComplianceStatus } from '../../lib/types';
import { COMPLIANCE_LABELS } from '../../lib/types';

const STATUS_CONFIG: Record<ComplianceStatus, { icon: typeof CheckCircle2; color: string }> = {
  yes: { icon: CheckCircle2, color: 'text-emerald-600' },
  no: { icon: XCircle, color: 'text-red-500' },
  in_progress: { icon: Clock, color: 'text-amber-500' },
  not_sure: { icon: HelpCircle, color: 'text-neutral-400' },
  na: { icon: Minus, color: 'text-neutral-300' },
};

interface ComplianceIndicatorProps {
  status: ComplianceStatus;
  label: string;
}

export function ComplianceIndicator({ status, label }: ComplianceIndicatorProps) {
  const config = STATUS_CONFIG[status];
  const Icon = config.icon;
  return (
    <div className="flex items-center gap-2">
      <Icon className={`h-4 w-4 shrink-0 ${config.color}`} />
      <span className="text-sm text-foreground">{label}</span>
      <span className="text-xs text-muted-foreground ml-auto">{COMPLIANCE_LABELS[status]}</span>
    </div>
  );
}
