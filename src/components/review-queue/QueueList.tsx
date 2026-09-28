import React from 'react';
import { Detection } from '../../types/sonar';
import { ClassChip } from '../common/ClassChip';
import { ConfidenceBadge } from '../common/ConfidenceBadge';
import { Card } from '../common/Card';
import { FileImage, SlidersHorizontal } from 'lucide-react';

interface QueueListProps {
  queue: Detection[];
  totalReviewed: number;
  totalInitialCount: number;
  activeDetectionId: string | null;
  onSelectDetection: (id: string) => void;
  filterClass: string;
  onFilterClassChange: (c: string) => void;
  filterSurvey: string;
  onFilterSurveyChange: (s: string) => void;
  minConfidence: number;
  onMinConfidenceChange: (val: number) => void;
  surveyOptions: string[];
  classOptions: string[];
}

export const QueueList: React.FC<QueueListProps> = React.memo(({
  queue,
  totalReviewed,
  totalInitialCount,
  activeDetectionId,
  onSelectDetection,
  filterClass,
  onFilterClassChange,
  filterSurvey,
  onFilterSurveyChange,
  minConfidence,
  onMinConfidenceChange,
  surveyOptions,
  classOptions,
}) => {
  // Sort queue by lowest confidence first by default
  const sortedQueue = [...queue].sort((a, b) => a.confidence - b.confidence);

  const progressPercent =
    totalInitialCount > 0
      ? Math.round((totalReviewed / totalInitialCount) * 100)
      : 0;

  return (
    <Card padding="none" className="flex flex-col h-full overflow-hidden w-full lg:w-[320px] shrink-0">
      {/* Progress Header */}
      <div className="p-4 border-b border-border bg-surface space-y-2">
        <div className="flex items-center justify-between text-xs font-semibold">
          <span className="text-text">Triage Progress</span>
          <span className="font-mono text-primary tabular-nums">
            {totalReviewed} of {totalInitialCount} reviewed
          </span>
        </div>
        {/* Slim progress bar */}
        <div className="w-full bg-border rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-primary h-full transition-all duration-300 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Filter Controls */}
      <div className="p-3 border-b border-border bg-background space-y-2 text-xs">
        <div className="grid grid-cols-2 gap-2">
          {/* Class Filter */}
          <select
            value={filterClass}
            onChange={(e) => onFilterClassChange(e.target.value)}
            className="w-full px-2 py-1 bg-surface border border-border rounded-input text-text"
          >
            <option value="ALL">All Classes</option>
            {classOptions.map((cls) => (
              <option key={cls} value={cls}>
                {cls}
              </option>
            ))}
          </select>

          {/* Survey Filter */}
          <select
            value={filterSurvey}
            onChange={(e) => onFilterSurveyChange(e.target.value)}
            className="w-full px-2 py-1 bg-surface border border-border rounded-input text-text truncate"
          >
            <option value="ALL">All Surveys</option>
            {surveyOptions.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        {/* Min Confidence Slider */}
        <div className="flex items-center gap-2 pt-1">
          <SlidersHorizontal className="w-3.5 h-3.5 text-muted shrink-0" />
          <span className="text-[11px] text-muted">Min Conf:</span>
          <input
            type="range"
            min="0"
            max="0.9"
            step="0.05"
            value={minConfidence}
            onChange={(e) => onMinConfidenceChange(parseFloat(e.target.value))}
            className="flex-1 accent-primary cursor-pointer h-1"
          />
          <span className="font-mono text-[11px] font-bold text-primary tabular-nums">
            {Math.round(minConfidence * 100)}%
          </span>
        </div>
      </div>

      {/* Queue Items (Lowest Confidence First) */}
      <div className="flex-1 overflow-y-auto divide-y divide-border p-2 space-y-1">
        {sortedQueue.map((item, idx) => {
          const isActive = activeDetectionId === item.id;
          return (
            <div
              key={item.id}
              onClick={() => onSelectDetection(item.id)}
              className={`p-2.5 rounded-button border transition-all duration-150 cursor-pointer ${
                isActive
                  ? 'bg-primary-tint border-primary shadow-subtle'
                  : 'bg-surface border-transparent hover:bg-background'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-mono font-bold text-muted">#{idx + 1}</span>
                <ClassChip className={item.class} size="sm" />
                <ConfidenceBadge confidence={item.confidence} size="sm" />
              </div>

              <div className="mt-2 text-xs text-muted truncate flex items-center gap-1.5">
                <FileImage className="w-3 h-3 text-primary shrink-0" />
                <span className="truncate">{item.analysisName || item.analysisId}</span>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
});

QueueList.displayName = 'QueueList';
