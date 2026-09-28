import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Detection, Analysis } from '../../types/sonar';
import { Drawer } from '../common/Drawer';
import { ClassChip } from '../common/ClassChip';
import { ConfidenceBadge } from '../common/ConfidenceBadge';
import { StatusBadge } from '../common/StatusBadge';
import { formatCoordinate } from '../../lib/coordinates';
import { useSonarContext } from '../../context/SonarContext';
import { Copy, ExternalLink, CheckSquare, MapPin, Calendar, FileText, Check } from 'lucide-react';
import { formatDate } from '../../lib/utils';

interface DetectionDrawerProps {
  detection: Detection | null;
  analysis: Analysis | null;
  isOpen: boolean;
  onClose: () => void;
}

export const DetectionDrawer: React.FC<DetectionDrawerProps> = ({
  detection,
  analysis,
  isOpen,
  onClose,
}) => {
  const navigate = useNavigate();
  const { settings } = useSonarContext();
  const [copied, setCopied] = useState(false);

  if (!detection) return null;

  const coordStr = formatCoordinate(detection.lat, detection.lon, settings.coordFormat);

  const handleCopyCoords = () => {
    navigator.clipboard.writeText(`${detection.lat.toFixed(6)}, ${detection.lon.toFixed(6)}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Drawer
      isOpen={isOpen}
      onOpenChange={(open) => !open && onClose()}
      title="Sonar Target Spatial Details"
      subtitle={`ID: ${detection.id}`}
    >
      <div className="space-y-5">
        {/* Sonar Crop Image Thumbnail */}
        {analysis?.imageUrl && (
          <div className="relative w-full h-52 bg-[#0A131C] rounded-card border border-border overflow-hidden flex items-center justify-center">
            <img
              src={analysis.imageUrl}
              alt="Sonar Crop"
              className="max-w-full max-h-full object-contain"
            />
            {/* SVG Box */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 1 1" preserveAspectRatio="none">
              <rect
                x={detection.bbox.x}
                y={detection.bbox.y}
                width={detection.bbox.w}
                height={detection.bbox.h}
                className="stroke-primary stroke-[3] fill-primary/20"
              />
            </svg>
          </div>
        )}

        {/* Classification & Confidence Header */}
        <div className="p-4 rounded-card bg-background border border-border space-y-3">
          <div className="flex items-center justify-between">
            <ClassChip className={detection.class} size="md" />
            <ConfidenceBadge confidence={detection.confidence} size="md" />
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-border">
            <span className="text-xs text-muted font-medium">Verification Status:</span>
            <StatusBadge status={detection.status} size="md" />
          </div>
        </div>

        {/* Spatial Coordinates Card */}
        <div className="p-4 rounded-card bg-surface border border-border space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-text flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-primary" /> Spatial Position
            </span>
            <button
              onClick={handleCopyCoords}
              className="flex items-center gap-1 text-xs text-primary font-medium hover:underline"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-success" />
                  <span className="text-success">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Coords</span>
                </>
              )}
            </button>
          </div>
          <p className="text-sm font-mono font-bold text-text tabular-nums">{coordStr}</p>
        </div>

        {/* Campaign Info */}
        <div className="p-4 rounded-card bg-surface border border-border space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-muted">Survey Name:</span>
            <span className="font-semibold text-text">{detection.analysisName || detection.analysisId}</span>
          </div>
          {analysis && (
            <>
              <div className="flex items-center justify-between">
                <span className="text-muted">Vessel:</span>
                <span className="font-medium text-text">{analysis.vessel || 'RV Oceanus'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted">Sonar System:</span>
                <span className="font-medium text-text">{analysis.sonarType || 'Klein 4900'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted">Date Analyzed:</span>
                <span className="font-mono text-text">{formatDate(analysis.createdAt)}</span>
              </div>
            </>
          )}
        </div>

        {/* Audit notes if reviewed */}
        {detection.reviewedBy && (
          <div className="p-3 bg-primary-tint/40 border border-primary/20 rounded-card text-xs space-y-1">
            <p className="font-semibold text-primary">Reviewed by {detection.reviewedBy}</p>
            {detection.reviewedAt && (
              <p className="text-[11px] text-muted font-mono">{formatDate(detection.reviewedAt)}</p>
            )}
            {detection.note && <p className="text-text mt-1 italic">"{detection.note}"</p>}
          </div>
        )}

        {/* Navigation Actions */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            onClick={() => {
              onClose();
              navigate(`/analyses/${detection.analysisId}?det=${detection.id}`);
            }}
            className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-text bg-background border border-border hover:bg-surface rounded-button transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5 text-primary" />
            <span>View in Image</span>
          </button>

          <button
            onClick={() => {
              onClose();
              navigate(`/review-queue?det=${detection.id}`);
            }}
            className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-primary hover:bg-primary-hover rounded-button transition-colors"
          >
            <CheckSquare className="w-3.5 h-3.5" />
            <span>Review Target</span>
          </button>
        </div>
      </div>
    </Drawer>
  );
};
