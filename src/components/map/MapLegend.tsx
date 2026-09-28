import React from 'react';
import { DEBRIS_CLASSES } from '../../config/classes';

interface MapLegendProps {
  colorBy: 'status' | 'class';
}

export const MapLegend: React.FC<MapLegendProps> = ({ colorBy }) => {
  const statusItems = [
    { label: 'Auto Accepted / Verified', color: '#5E9C7E' },
    { label: 'Pending Review', color: '#C79A4B' },
    { label: 'Corrected', color: '#3D7A94' },
    { label: 'Rejected', color: '#BC6A66' },
  ];

  return (
    <div className="absolute bottom-3 right-3 z-20 p-3 bg-surface/90 backdrop-blur-md border border-border rounded-card shadow-popover max-w-xs select-none">
      <h4 className="text-[11px] font-bold uppercase tracking-wider text-muted mb-2">
        Legend: {colorBy === 'status' ? 'Verification Status' : 'Debris Class'}
      </h4>

      <div className="space-y-1.5 text-xs">
        {colorBy === 'status'
          ? statusItems.map((item) => (
              <div key={item.label} className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full shrink-0 border border-white" style={{ backgroundColor: item.color }} />
                <span className="text-text font-medium">{item.label}</span>
              </div>
            ))
          : DEBRIS_CLASSES.map((cls) => (
              <div key={cls.id} className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full shrink-0 border border-white" style={{ backgroundColor: cls.color }} />
                <span className="text-text font-medium">{cls.label}</span>
              </div>
            ))}
      </div>
    </div>
  );
};
