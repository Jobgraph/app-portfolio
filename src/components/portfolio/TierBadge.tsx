import type { GovernanceTier } from '../../lib/types';
import { TIER_LABELS } from '../../lib/types';

const TIER_STYLES: Record<GovernanceTier, string> = {
  tier_1: 'bg-green-50 text-green-700 border-green-200',
  tier_2: 'bg-blue-50 text-blue-700 border-blue-200',
  tier_3: 'bg-purple-50 text-purple-700 border-purple-200',
  to_be_completed: 'bg-neutral-100 text-neutral-500 border-neutral-200',
};

interface TierBadgeProps {
  tier: GovernanceTier;
}

export function TierBadge({ tier }: TierBadgeProps) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${TIER_STYLES[tier]}`}>
      {TIER_LABELS[tier]}
    </span>
  );
}
