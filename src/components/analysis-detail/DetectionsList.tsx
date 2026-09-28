import React, { useState, useRef, useEffect } from 'react';
import { Detection } from '../../types/sonar';
import { ClassChip } from '../common/ClassChip';
import { ConfidenceBadge } from '../common/ConfidenceBadge';
import { StatusBadge } from '../common/StatusBadge';
import { Card } from '../common/Card';
import { formatCoordinate } from '../../lib/coordinates';
import { MapPin, Copy, Check, User, Calendar, FileText, ChevronDown, ChevronUp } from 'lucide-react';
import { useSonarContext } from '../../context/SonarContext';
import { formatDate } from '../../lib/utils';

interface DetectionsListProps {
  detections: Detection[];
  hoveredDetectionId: string | null;
  selectedDetectionId: string | null;
  onSelectDetection: (id: string) => void;
  onHoverDetection: (id: string | null) => void;
  confidenceThreshold?: number;
}

export const DetectionsList: React.FC<DetectionsListProps> = React.memo(({
  detections,
  hoveredDetectionId,
  selectedDetectionId,
  onSelectDetection,
  onHoverDetection,
  confidenceThreshold = 0,
}) => {
  const { settings } = useSonarContext();
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const selectedRef = useRef<HTMLDivElement>(null);

  // Auto scroll into view when selected from map or image viewer
  useEffect(() => {
    if (selectedDetectionId && selectedRef.current) {
      selectedRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [selectedDetectionId]);

  const filtered = detections.filter((d) => {
    if (d.confidence < confidenceThreshold) return false;
    if (statusFilter !== 'ALL' && d.status !== statusFilter) return false;
    return true;
  });

  const handleCopyCoords = (d: Detection, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(`${d.lat.toFixed(6)}, ${d.lon.toFixed(6)}`);
    setCopiedId(d.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <Card padding="none" className="flex flex-col h-[520px] md:h-[620px]">
      {/* Header with Count & Status Filter */}
      <div className="p-4 border-b border-border bg-surface flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold text-text">Detected Targets</h3>
          <p className="text-xs text-muted">
            {filtered.length} target{filtered.length === 1 ? '' : 's'} shown
          </p>
        </div>

        {/* Status filter dropdown */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-2.5 py-1 text-xs text-text bg-background border border-border rounded-input focus:outline-none focus:ring-1 focus:ring-primary"
        >
          <option value="ALL">All Statuses</option>
          <option value="auto_accepted">Auto Accepted</option>
          <option value="pending_review">Pending Review</option>
          <option value="verified">Verified</option>
          <option value="corrected">Corrected</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {/* Detections List */}
      <div className="flex-1 overflow-y-auto divide-y divide-border p-2 space-y-1">
        {filtered.map((d) => {
          const isHovered = hoveredDetectionId === d.id;
          const isSelected = selectedDetectionId === d.id;

          return (
            <div
              key={d.id}
              ref={isSelected ? selectedRef : undefined}
              onClick={() => onSelectDetection(d.id)}
              onMouseEnter={() => onHoverDetection(d.id)}
              onMouseLeave={() => onHoverDetection(null)}
              className={`p-3 rounded-button border transition-all duration-150 cursor-pointer ${
                isSelected
                  ? 'bg-primary-tint border-primary shadow-subtle'
                  : isHovered
                  ? 'bg-background border-primary/40'
                  : 'bg-surface border-transparent hover:bg-background'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <ClassChip className={d.class} size="sm" />
                <ConfidenceBadge confidence={d.confidence} size="sm" />
              </div>

              <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-border/60 text-xs">
                <div className="flex items-center gap-1.5 text-muted font-mono">
                  <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                  <span>{formatCoordinate(d.lat, d.lon, settings.coordFormat)}</span>
                </div>
                <StatusBadge status={d.status} size="sm" />
              </div>

              {/* Expanded Details Section when Selected */}
              {isSelected && (
                <div className="mt-3 pt-3 border-t border-border/80 text-xs space-y-2.5 animate-in fade-in duration-150">
                  {/* Coordinates with Copy button */}
                  <div className="p-2.5 rounded bg-surface border border-border flex items-center justify-between">
                    <div className="font-mono text-text">
                      <span className="text-[11px] text-muted block">Exact Coordinates:</span>
                      <span className="font-bold">{d.lat.toFixed(6)}°, {d.lon.toFixed(6)}°</span>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => handleCopyCoords(d, e)}
                      className="flex items-center gap-1 px-2 py-1 text-xs font-semibold text-primary hover:underline bg-background rounded border border-border"
                    >
                      {copiedId === d.id ? (
                        <>
                          <Check className="w-3 h-3 text-success" />
                          <span className="text-success">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Top-3 Alternatives if available */}
                  {d.alternatives && d.alternatives.length > 0 && (
                    <div className="p-2 bg-background rounded border border-border space-y-1">
                      <span className="text-[10px] font-semibold uppercase text-muted block">Model Alternatives</span>
                      {d.alternatives.map((alt, i) => (
                        <div key={i} className="flex justify-between text-[11px]">
                          <span className="text-text">{alt.class}</span>
                          <span className="font-mono text-muted">{Math.round(alt.confidence * 100)}%</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Reviewer info if reviewed */}
                  {d.reviewedBy && (
                    <div className="p-2 bg-primary-tint/40 border border-primary/20 rounded text-[11px] space-y-0.5">
                      <p className="font-semibold text-primary flex items-center gap-1">
                        <User className="w-3 h-3" /> Reviewed by {d.reviewedBy}
                      </p>
                      {d.reviewedAt && (
                        <p className="text-muted font-mono">{formatDate(d.reviewedAt)}</p>
                      )}
                      {d.note && <p className="text-text italic mt-1">"{d.note}"</p>}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
});

DetectionsList.displayName = 'DetectionsList';
