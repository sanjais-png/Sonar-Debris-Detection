import React, { useState } from 'react';
import { Detection } from '../../types/sonar';
import { Card } from '../common/Card';
import { ClassChip } from '../common/ClassChip';
import { ConfidenceGauge } from '../common/ConfidenceGauge';
import { DEBRIS_CLASSES, getDebrisClassInfo } from '../../config/classes';
import { Check, X, Move, FileText, ChevronLeft, ChevronRight, User } from 'lucide-react';
import { formatDate } from '../../lib/utils';

interface DecisionPanelProps {
  detection: Detection;
  currentIndex: number;
  totalCount: number;
  onConfirm: () => void;
  onReject: () => void;
  onChangeClass: (newClass: string) => void;
  onPrev: () => void;
  onNext: () => void;
  isAdjustingBox: boolean;
  onToggleAdjustBox: () => void;
  note: string;
  onNoteChange: (val: string) => void;
}

export const DecisionPanel: React.FC<DecisionPanelProps> = React.memo(({
  detection,
  currentIndex,
  totalCount,
  onConfirm,
  onReject,
  onChangeClass,
  onPrev,
  onNext,
  isAdjustingBox,
  onToggleAdjustBox,
  note,
  onNoteChange,
}) => {
  const [selectedClassOverride, setSelectedClassOverride] = useState<string>(detection.class);

  return (
    <Card padding="none" className="flex flex-col h-full justify-between overflow-hidden">
      <div>
        {/* Navigation & Target Counter Header */}
        <div className="p-4 border-b border-border bg-surface flex items-center justify-between">
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted">Hydrographer Verification</h3>
            <p className="text-sm font-bold text-text mt-0.5 tabular-nums">
              Target {currentIndex + 1} of {totalCount}
            </p>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={onPrev}
              disabled={currentIndex === 0}
              className="p-1.5 text-text hover:bg-background border border-border rounded disabled:opacity-30"
              title="Previous target (Left Arrow)"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onNext}
              disabled={currentIndex === totalCount - 1}
              className="p-1.5 text-text hover:bg-background border border-border rounded disabled:opacity-30"
              title="Next target (Right Arrow)"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Model Prediction & Confidence Gauge */}
        <div className="p-4 space-y-4">
          <div className="space-y-2">
            <span className="text-[11px] font-semibold text-muted uppercase tracking-wider block">
              Neural Prediction
            </span>
            <div className="flex items-center justify-between">
              <ClassChip className={detection.class} size="md" />
            </div>
            {/* Confidence Gauge Component */}
            <ConfidenceGauge confidence={detection.confidence} />
          </div>

          {/* Top Candidate Alternatives */}
          {detection.alternatives && detection.alternatives.length > 0 && (
            <div className="p-3 rounded-card bg-background border border-border space-y-2">
              <span className="text-[11px] font-semibold text-muted uppercase tracking-wider block">
                Top Candidate Alternatives
              </span>
              <div className="space-y-1.5">
                {detection.alternatives.map((alt, i) => {
                  const altInfo = getDebrisClassInfo(alt.class);
                  return (
                    <div key={i} className="flex items-center justify-between text-xs">
                      <span className="text-text font-medium">{altInfo.label}</span>
                      <span className="font-mono text-muted tabular-nums">{Math.round(alt.confidence * 100)}%</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Change Class Dropdown */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-text">Override Target Classification</label>
            <div className="flex gap-2">
              <select
                value={selectedClassOverride}
                onChange={(e) => setSelectedClassOverride(e.target.value)}
                className="flex-1 px-3 py-1.5 text-xs text-text bg-background border border-border rounded-input"
              >
                {DEBRIS_CLASSES.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.label}
                  </option>
                ))}
              </select>
              {selectedClassOverride !== detection.class && (
                <button
                  type="button"
                  onClick={() => onChangeClass(selectedClassOverride)}
                  className="px-3 py-1.5 text-xs font-semibold text-white bg-primary hover:bg-primary-hover rounded-button transition-colors flex items-center gap-1"
                >
                  <span>Apply</span>
                  <span className="text-[10px] opacity-75 font-mono">[C]</span>
                </button>
              )}
            </div>
          </div>

          {/* BBox Adjustment Toggle */}
          <div>
            <button
              type="button"
              onClick={onToggleAdjustBox}
              className={`w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold border rounded-button transition-colors ${
                isAdjustingBox
                  ? 'bg-warning-tint text-warning border-warning/40'
                  : 'bg-background text-text border-border hover:bg-surface'
              }`}
            >
              <Move className="w-3.5 h-3.5" />
              <span>{isAdjustingBox ? 'Done Adjusting BBox' : 'Adjust Bounding Box Mode'}</span>
            </button>
          </div>

          {/* Verification Audit Note Input */}
          <div>
            <label className="block text-xs font-semibold text-text mb-1 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-muted" /> Optional Hydrographer Note
            </label>
            <textarea
              rows={2}
              value={note}
              onChange={(e) => onNoteChange(e.target.value)}
              placeholder="Add optional hydrographer observation..."
              className="w-full px-3 py-2 text-xs text-text bg-background border border-border rounded-input focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>
      </div>

      {/* Decision Action Buttons with Keyboard Shortcut Hints */}
      <div className="p-4 border-t border-border bg-surface space-y-3">
        <div className="grid grid-cols-2 gap-2">
          {/* Confirm Primary Button */}
          <button
            type="button"
            onClick={onConfirm}
            className="flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-white bg-success hover:bg-success/90 rounded-button transition-colors shadow-subtle"
          >
            <Check className="w-4 h-4" />
            <span>Confirm</span>
            <span className="text-[10px] font-mono opacity-80 bg-white/20 px-1 py-0.2 rounded">[A]</span>
          </button>

          {/* Reject False Positive Outlined Danger-Tint Button */}
          <button
            type="button"
            onClick={onReject}
            className="flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-danger bg-danger-tint border border-danger/40 hover:bg-danger hover:text-white rounded-button transition-colors shadow-subtle"
          >
            <X className="w-4 h-4" />
            <span>Reject</span>
            <span className="text-[10px] font-mono opacity-80 border border-current px-1 py-0.2 rounded">[R]</span>
          </button>
        </div>

        {/* Audit Line */}
        <div className="pt-2 text-[11px] text-muted flex items-center justify-between border-t border-border">
          <span className="flex items-center gap-1">
            <User className="w-3 h-3 text-primary" /> Hydrographer Reviewer
          </span>
          <span className="font-mono">{formatDate(new Date().toISOString()).split(',')[0]}</span>
        </div>
      </div>
    </Card>
  );
});

DecisionPanel.displayName = 'DecisionPanel';
