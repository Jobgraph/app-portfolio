import type { ProjectStage } from '../../lib/types';
import { STAGE_STYLES, STAGE_LABELS } from '../../lib/types';

interface StageBadgeProps {
  stage: ProjectStage;
  size?: 'sm' | 'md';
}

export function StageBadge({ stage, size = 'sm' }: StageBadgeProps) {
  const style = STAGE_STYLES[stage];
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 font-medium capitalize ${style.badge} ${
      size === 'sm' ? 'text-[11px]' : 'text-xs'
    }`}>
      {STAGE_LABELS[stage]}
    </span>
  );
}
