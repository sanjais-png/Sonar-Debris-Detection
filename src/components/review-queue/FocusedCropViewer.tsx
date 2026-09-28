import React, { useState } from 'react';
import { Detection, BoundingBox } from '../../types/sonar';
import { Card } from '../common/Card';
import { AnnotatedImage } from '../common/AnnotatedImage';
import { MapPin, Maximize2, Move, Eye, FileImage } from 'lucide-react';
import { formatCoordinate } from '../../lib/coordinates';
import { useSonarContext } from '../../context/SonarContext';

interface FocusedCropViewerProps {
  imageUrl: string;
  detection: Detection;
  isAdjustingBox: boolean;
  onToggleAdjustBox: () => void;
  onBBoxChange?: (newBBox: BoundingBox) => void;
}

export const FocusedCropViewer: React.FC<FocusedCropViewerProps> = React.memo(({
  imageUrl,
  detection,
  isAdjustingBox,
  onToggleAdjustBox,
  onBBoxChange,
}) => {
  const { settings } = useSonarContext();
  const [showFullImage, setShowFullImage] = useState<boolean>(false);

  const { bbox, class: className, confidence, lat, lon } = detection;

  return (
    <Card padding="none" className="relative flex flex-col h-full bg-[#0A131C] overflow-hidden">
      {/* Header status bar */}
      <div className="p-3 bg-surface border-b border-border flex items-center justify-between text-xs font-semibold text-text">
        <div className="flex items-center gap-2">
          <FileImage className="w-4 h-4 text-primary" />
          <span>{detection.analysisName || detection.analysisId}</span>
        </div>

        {/* Show Full Image Toggle */}
        <button
          type="button"
          onClick={() => setShowFullImage(!showFullImage)}
          className={`px-2.5 py-1 text-xs rounded border transition-colors flex items-center gap-1.5 ${
            showFullImage
              ? 'bg-primary-tint text-primary border-primary/40 font-semibold'
              : 'bg-background text-text border-border hover:bg-surface'
          }`}
        >
          <Eye className="w-3.5 h-3.5" />
          <span>{showFullImage ? 'Focused View' : 'Show Full Image'}</span>
        </button>
      </div>

      {/* Center Image Viewport using reusable AnnotatedImage */}
      <div className="relative flex-1 w-full h-full overflow-hidden select-none">
        <AnnotatedImage
          imageUrl={imageUrl}
          detections={[detection]}
          selectedDetectionId={detection.id}
          onSelectDetection={() => {}}
          showLabels={true}
          isInteractive={true}
          maxHeight={showFullImage ? '600px' : '440px'}
        />
      </div>

      {/* Footer scale & spatial coordinate readout */}
      <div className="p-3 bg-surface border-t border-border flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
        <div className="flex items-center gap-1.5 text-text">
          <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
          <span className="font-bold tabular-nums">
            {formatCoordinate(lat, lon, settings.coordFormat)}
          </span>
        </div>
        <div className="text-muted text-[11px]">
          <span>Normalized BBox: [{bbox.x.toFixed(2)}, {bbox.y.toFixed(2)}, {bbox.w.toFixed(2)}, {bbox.h.toFixed(2)}]</span>
        </div>
      </div>
    </Card>
  );
});

FocusedCropViewer.displayName = 'FocusedCropViewer';
