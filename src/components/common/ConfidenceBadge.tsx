import React from 'react';

interface ConfidenceBadgeProps {
  confidence: number; // 0..1
  showLabel?: boolean;
  size?: 'sm' | 'md';
}

export const ConfidenceBadge: React.FC<ConfidenceBadgeProps> = React.memo(({
  confidence,
  showLabel = true,
  size = 'md',
}) => {
  const percent = Math.round(confidence * 100);
  const isSm = size === 'sm';
  const padding = isSm ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs';

  let tierStyle = '';
  let label = 'Low';

  if (percent >= 80) {
    tierStyle = 'bg-success-tint text-success border-success/30';
    label = 'High';
  } else if (percent >= 50) {
    tierStyle = 'bg-warning-tint text-warning border-warning/30';
    label = 'Med';
  } else {
    tierStyle = 'bg-danger-tint text-danger border-danger/30';
    label = 'Low';
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-semibold rounded-full border tabular-nums ${padding} ${tierStyle}`}
    >
      <span>{percent}%</span>
      {showLabel && <span className="font-normal opacity-80 text-[11px] uppercase tracking-wider">({label})</span>}
    </span>
  );
});

ConfidenceBadge.displayName = 'ConfidenceBadge';
