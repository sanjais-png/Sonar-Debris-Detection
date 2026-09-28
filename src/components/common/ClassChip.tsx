import React from 'react';
import { getDebrisClassInfo } from '../../config/classes';

interface ClassChipProps {
  className: string;
  color?: string;
  size?: 'sm' | 'md';
}

export const ClassChip: React.FC<ClassChipProps> = React.memo(({ className: classId, color, size = 'md' }) => {
  const info = getDebrisClassInfo(classId);
  const hexColor = color || info.color;
  const isSm = size === 'sm';
  const padding = isSm ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-md border border-border bg-surface text-text ${padding}`}
    >
      <span
        className="w-2.5 h-2.5 rounded-full shrink-0"
        style={{ backgroundColor: hexColor }}
      />
      <span>{info.label}</span>
    </span>
  );
});

ClassChip.displayName = 'ClassChip';
