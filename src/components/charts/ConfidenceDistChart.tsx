import React, { useState } from 'react';
import { Detection } from '../../types/sonar';
import { Card } from '../common/Card';
import { useSonarContext } from '../../context/SonarContext';
import { Skeleton } from '../common/SkeletonLoader';
import { EmptyState } from '../common/EmptyState';
import { Percent } from 'lucide-react';

interface ConfidenceDistChartProps {
  detections: Detection[];
  isLoading?: boolean;
}

export const ConfidenceDistChart: React.FC<ConfidenceDistChartProps> = ({ detections, isLoading = false }) => {
  const { settings } = useSonarContext();
  const [hoveredBin, setHoveredBin] = useState<{ label: string; count: number; pct: number; isAbove: boolean } | null>(null);

  const reviewThresholdPct = Math.round(settings.reviewThreshold * 100);

  // Bins: <50%, 50-69%, 70-84%, 85-100%
  const bins = [
    { label: '< 50%', min: 0, max: 0.49, isAbove: 50 >= reviewThresholdPct },
    { label: '50 - 69%', min: 0.5, max: 0.69, isAbove: 60 >= reviewThresholdPct },
    { label: '70 - 84%', min: 0.7, max: 0.84, isAbove: 75 >= reviewThresholdPct },
    { label: '85 - 100%', min: 0.85, max: 1.0, isAbove: 90 >= reviewThresholdPct },
  ];

  const totalDetections = detections.length;

  const binData = bins.map((b) => {
    const count = detections.filter((d) => d.confidence >= b.min && d.confidence <= b.max).length;
    const pct = totalDetections > 0 ? Math.round((count / totalDetections) * 100) : 0;
    const isAboveThreshold = b.min * 100 >= reviewThresholdPct || b.max * 100 >= reviewThresholdPct;
    return { ...b, count, pct, isAbove: isAboveThreshold };
  });

  const maxCount = Math.max(...binData.map((b) => b.count), 1);

  if (isLoading) {
    return (
      <Card className="h-[380px] flex flex-col justify-between">
        <div className="space-y-2">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-3 w-48" />
        </div>
        <Skeleton className="h-48 w-full" />
      </Card>
    );
  }

  if (detections.length === 0) {
    return (
      <Card className="h-[380px] flex flex-col items-center justify-center">
        <EmptyState
          icon={Percent}
          title="No Confidence Telemetry"
          description="Upload a sonar campaign to view model confidence distribution."
        />
      </Card>
    );
  }

  return (
    <Card className="h-[380px] flex flex-col justify-between p-6">
      {/* Header Pattern */}
      <div>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-text">Confidence distribution</h3>
            <p className="text-xs text-muted">All detections</p>
          </div>
        </div>

        {/* Summary Line */}
        <div className="flex items-baseline gap-1.5 mt-2 mb-4">
          <span className="text-2xl font-bold font-mono text-text tabular-nums leading-none">
            {totalDetections}
          </span>
          <span className="text-xs text-muted">detections analyzed</span>
        </div>
      </div>

      {/* Main Bar Visualization Container */}
      <div className="relative flex-1 flex flex-col justify-end w-full select-none pt-6 pb-2">
        {/* Review Threshold Marker Line */}
        <div
          className="absolute left-0 right-0 z-10 border-t border-dashed border-warning flex items-center justify-end pr-2 pointer-events-none"
          style={{ bottom: '48px' }}
        >
          <span className="text-[10px] font-bold font-mono text-warning bg-surface px-1.5 py-0.5 rounded border border-warning/30 shadow-subtle">
            Review threshold {reviewThresholdPct}%
          </span>
        </div>

        {/* Vertical Bars Flex Grid (no axes or gridlines) */}
        <div className="flex items-end justify-between gap-4 h-48 px-4">
          {binData.map((bin) => {
            const heightPct = (bin.count / maxCount) * 100;
            const isHovered = hoveredBin?.label === bin.label;

            return (
              <div
                key={bin.label}
                role="button"
                tabIndex={0}
                aria-label={`Bin ${bin.label}: ${bin.count} detections, ${bin.pct} percent`}
                onMouseEnter={() => setHoveredBin(bin)}
                onMouseLeave={() => setHoveredBin(null)}
                onFocus={() => setHoveredBin(bin)}
                onBlur={() => setHoveredBin(null)}
                className="group relative flex-1 flex flex-col items-center justify-end h-full cursor-pointer focus-visible:outline-none"
              >
                {/* Hover Popover Tooltip */}
                {isHovered && (
                  <div className="absolute -top-12 z-30 pointer-events-none bg-surface/95 backdrop-blur-md px-3 py-1.5 rounded-card border border-border shadow-popover text-xs text-center animate-in fade-in duration-150 shrink-0">
                    <p className="font-bold text-text font-mono">{bin.label}</p>
                    <p className="text-[11px] text-muted">
                      <strong className="text-text font-mono">{bin.count}</strong> targets ({bin.pct}%)
                    </p>
                  </div>
                )}

                {/* Count Badge above bar */}
                <span className="text-[11px] font-mono font-semibold text-muted mb-1 tabular-nums">
                  {bin.count}
                </span>

                {/* Bar with 4px Top Radius */}
                <div
                  className={`w-full rounded-t-[4px] transition-all duration-400 ease-out prefers-reduced-motion:transition-none ${
                    bin.isAbove ? 'bg-primary hover:bg-primary-hover' : 'bg-warning hover:bg-warning/90'
                  }`}
                  style={{ height: `${Math.max(8, heightPct)}%` }}
                />

                {/* Bin Range Label */}
                <span className="text-[11px] font-mono text-muted font-medium mt-2">
                  {bin.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Small Legend Below */}
      <div className="flex items-center gap-4 pt-3 border-t border-border text-[11px] text-muted">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-2 rounded-xs bg-primary" />
          <span>Above threshold</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-2 rounded-xs bg-warning" />
          <span>Below threshold (Awaiting review)</span>
        </div>
      </div>
    </Card>
  );
};
