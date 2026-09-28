import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Detection } from '../../types/sonar';
import { Card } from '../common/Card';
import { DEBRIS_CLASSES } from '../../config/classes';
import { EmptyState } from '../common/EmptyState';
import { Skeleton } from '../common/SkeletonLoader';
import { Compass } from 'lucide-react';

interface DebrisTypeChartProps {
  detections: Detection[];
  isLoading?: boolean;
}

export const DebrisTypeChart: React.FC<DebrisTypeChartProps> = ({ detections, isLoading = false }) => {
  const navigate = useNavigate();
  const [hoveredClassId, setHoveredClassId] = useState<string | null>(null);

  // Filter out rejected detections
  const activeDetections = detections.filter((d) => d.status !== 'rejected');
  const totalCount = activeDetections.length;

  // Group stats by class
  const classStats = DEBRIS_CLASSES.map((cls) => {
    const classDetections = activeDetections.filter(
      (d) => d.class === cls.id || d.class === cls.label || d.class === cls.name
    );
    const count = classDetections.length;
    const confirmedCount = classDetections.filter(
      (d) => d.status === 'auto_accepted' || d.status === 'verified' || d.status === 'corrected'
    ).length;
    const pendingCount = classDetections.filter((d) => d.status === 'pending_review').length;
    const sumConf = classDetections.reduce((acc, d) => acc + d.confidence, 0);
    const avgConf = count > 0 ? sumConf / count : 0;
    const sharePct = totalCount > 0 ? Math.round((count / totalCount) * 100) : 0;

    return {
      cls,
      count,
      confirmedCount,
      pendingCount,
      avgConf,
      sharePct,
    };
  });

  // Sort by count descending
  const sortedStats = [...classStats].sort((a, b) => b.count - a.count);
  const maxCount = Math.max(...sortedStats.map((s) => s.count), 1);

  if (isLoading) {
    return (
      <Card className="h-[380px] flex flex-col justify-between">
        <div className="space-y-2">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-3 w-48" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
        </div>
      </Card>
    );
  }

  if (detections.length === 0) {
    return (
      <Card className="h-[380px] flex flex-col items-center justify-center">
        <EmptyState
          icon={Compass}
          title="No Debris Data"
          description="Upload a sonar analysis campaign to view target distribution."
        />
      </Card>
    );
  }

  return (
    <Card className="h-[380px] flex flex-col justify-between p-6">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-text">Debris by type</h3>
            <p className="text-xs text-muted">All analyses</p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/reports')}
            className="text-xs font-medium text-primary hover:text-primary-hover hover:underline transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
          >
            View report
          </button>
        </div>

        {/* Summary Line */}
        <div className="flex items-baseline gap-1.5 mt-2 mb-4">
          <span className="text-2xl font-bold font-mono text-text tabular-nums leading-none">
            {totalCount}
          </span>
          <span className="text-xs text-muted">detections</span>
        </div>
      </div>

      {/* 4 Ranked Rows (16px gap) */}
      <ul role="list" className="space-y-4 flex-1">
        {sortedStats.map(({ cls, count, confirmedCount, pendingCount, avgConf, sharePct }) => {
          const maxWidthPct = (count / maxCount) * 100;
          const confirmedWidthPct = count > 0 ? (confirmedCount / count) * maxWidthPct : 0;
          const pendingWidthPct = count > 0 ? (pendingCount / count) * maxWidthPct : 0;
          const ariaLabelStr = `${cls.label}: ${count} detections, ${sharePct} percent, ${pendingCount} awaiting review`;

          const isHovered = hoveredClassId === cls.id;

          return (
            <li
              key={cls.id}
              role="listitem"
              aria-label={ariaLabelStr}
              tabIndex={0}
              onClick={() => navigate(`/reports?debrisClass=${cls.id}`)}
              onMouseEnter={() => setHoveredClassId(cls.id)}
              onMouseLeave={() => setHoveredClassId(null)}
              onFocus={() => setHoveredClassId(cls.id)}
              onBlur={() => setHoveredClassId(null)}
              className="group relative p-2 -mx-2 rounded-card hover:bg-background/80 focus-visible:bg-background/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary cursor-pointer transition-colors"
            >
              {/* Row Label & Count */}
              <div className="flex items-center justify-between text-xs mb-1">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0 shadow-xs"
                    style={{ backgroundColor: cls.color }}
                  />
                  <span className="font-medium text-text text-[14px] leading-snug">{cls.label}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-semibold font-mono text-text tabular-nums">{count}</span>
                  <span className="text-muted text-[11px] font-mono w-10 text-right">{sharePct}%</span>
                </div>
              </div>

              {/* Bar Track */}
              <div className="w-full h-2 rounded-full bg-border/40 overflow-hidden flex">
                {/* Confirmed Bar Segment */}
                <div
                  className="h-full transition-all duration-400 ease-out prefers-reduced-motion:transition-none"
                  style={{
                    width: `${confirmedWidthPct}%`,
                    backgroundColor: cls.color,
                  }}
                />
                {/* Awaiting Review Bar Segment (Lighter Tint) */}
                <div
                  className="h-full transition-all duration-400 ease-out prefers-reduced-motion:transition-none opacity-40"
                  style={{
                    width: `${pendingWidthPct}%`,
                    backgroundColor: cls.color,
                  }}
                />
              </div>

              {/* Hover & Focus Popover Tooltip */}
              {isHovered && (
                <div className="absolute right-2 top-0 z-30 pointer-events-none bg-surface/95 backdrop-blur-md p-3 rounded-card border border-border shadow-popover text-xs space-y-1 animate-in fade-in duration-150 min-w-[160px]">
                  <div className="font-bold text-text flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cls.color }} />
                    <span>{cls.label}</span>
                  </div>
                  <div className="pt-1 border-t border-border text-[11px] text-muted space-y-0.5 font-mono">
                    <div className="flex justify-between">
                      <span>Total Targets:</span>
                      <strong className="text-text">{count}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Confirmed:</span>
                      <strong className="text-success">{confirmedCount}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Awaiting Review:</span>
                      <strong className="text-warning">{pendingCount}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Avg Confidence:</span>
                      <strong className="text-primary">{Math.round(avgConf * 100)}%</strong>
                    </div>
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ul>

      {/* Small Legend Below */}
      <div className="flex items-center gap-4 pt-3 border-t border-border text-[11px] text-muted">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-2 rounded-xs bg-primary" />
          <span>Confirmed</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-2 rounded-xs bg-primary/40" />
          <span>Awaiting review</span>
        </div>
      </div>
    </Card>
  );
};
