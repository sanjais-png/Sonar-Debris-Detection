import React, { useRef } from 'react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { Detection } from '../../types/sonar';
import { ZoomIn, ZoomOut, RotateCcw, Maximize2, Download } from 'lucide-react';
import { ClassChip } from '../common/ClassChip';
import { ConfidenceBadge } from '../common/ConfidenceBadge';

interface SonarImageViewerProps {
  imageUrl: string;
  imageWidth: number;
  imageHeight: number;
  detections: Detection[];
  hoveredDetectionId: string | null;
  selectedDetectionId: string | null;
  onSelectDetection: (id: string) => void;
  onHoverDetection: (id: string | null) => void;
  showLabels?: boolean;
  confidenceThreshold?: number;
}

export const SonarImageViewer: React.FC<SonarImageViewerProps> = ({
  imageUrl,
  imageWidth,
  imageHeight,
  detections,
  hoveredDetectionId,
  selectedDetectionId,
  onSelectDetection,
  onHoverDetection,
  showLabels = true,
  confidenceThreshold = 0,
}) => {
  const transformRef = useRef<any>(null);

  // Filter detections by threshold slider
  const visibleDetections = detections.filter(
    (d) => d.confidence >= confidenceThreshold
  );

  const getStatusOutlineColor = (status: string, isHovered: boolean, isSelected: boolean) => {
    if (isSelected) return 'stroke-primary stroke-[3] fill-primary/20';
    if (isHovered) return 'stroke-primary stroke-[2.5] fill-primary/15';

    switch (status) {
      case 'verified':
      case 'auto_accepted':
        return 'stroke-success stroke-[2] fill-success/10';
      case 'pending_review':
        return 'stroke-warning stroke-[2] stroke-dasharray-[4_2] fill-warning/10';
      case 'corrected':
        return 'stroke-primary stroke-[2] fill-primary/10';
      case 'rejected':
        return 'stroke-danger stroke-[1.5] stroke-dasharray-[2_2] fill-danger/5 opacity-50';
      default:
        return 'stroke-muted stroke-[1.5] fill-muted/10';
    }
  };

  return (
    <div className="relative w-full h-[520px] md:h-[620px] bg-[#0A131C] rounded-card border border-border overflow-hidden group select-none flex flex-col">
      {/* Zoom / Pan Viewer Area */}
      <TransformWrapper
        ref={transformRef}
        initialScale={1}
        minScale={0.5}
        maxScale={8}
        centerOnInit
      >
        {({ zoomIn, zoomOut, resetTransform }) => (
          <>
            {/* Overlay Control Bar */}
            <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5 p-1.5 bg-surface/90 backdrop-blur-md rounded-button border border-border shadow-popover">
              <button
                onClick={() => zoomIn()}
                className="p-1.5 text-text hover:text-primary rounded hover:bg-background transition-colors"
                title="Zoom In (+)"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={() => zoomOut()}
                className="p-1.5 text-text hover:text-primary rounded hover:bg-background transition-colors"
                title="Zoom Out (-)"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <div className="w-[1px] h-4 bg-border mx-0.5" />
              <button
                onClick={() => resetTransform()}
                className="p-1.5 text-text hover:text-primary rounded hover:bg-background transition-colors"
                title="Fit to Screen"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            {/* Image Canvas with SVG Overlay */}
            <TransformComponent
              wrapperStyle={{ width: '100%', height: '100%' }}
              contentStyle={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <div className="relative inline-block max-w-full max-h-full">
                {/* Sonar Base Image */}
                <img
                  src={imageUrl}
                  alt="Side-Scan Sonar Analysis"
                  className="block w-full h-auto object-contain pointer-events-none"
                  style={{ maxHeight: '580px' }}
                />

                {/* SVG Overlay for Bounding Boxes */}
                <svg
                  className="absolute inset-0 w-full h-full pointer-events-none"
                  viewBox="0 0 1 1"
                  preserveAspectRatio="none"
                >
                  {visibleDetections.map((d) => {
                    const isHovered = hoveredDetectionId === d.id;
                    const isSelected = selectedDetectionId === d.id;

                    return (
                      <g key={d.id} className="pointer-events-auto">
                        <rect
                          x={d.bbox.x}
                          y={d.bbox.y}
                          width={d.bbox.w}
                          height={d.bbox.h}
                          rx={0.005}
                          className={`cursor-pointer transition-all duration-150 ${getStatusOutlineColor(
                            d.status,
                            isHovered,
                            isSelected
                          )}`}
                          onClick={() => onSelectDetection(d.id)}
                          onMouseEnter={() => onHoverDetection(d.id)}
                          onMouseLeave={() => onHoverDetection(null)}
                        />
                      </g>
                    );
                  })}
                </svg>

                {/* Absolute HTML Label Chips overlaid over boxes */}
                {showLabels &&
                  visibleDetections.map((d) => {
                    const isHovered = hoveredDetectionId === d.id;
                    const isSelected = selectedDetectionId === d.id;

                    return (
                      <div
                        key={`label-${d.id}`}
                        style={{
                          left: `${(d.bbox.x + d.bbox.w / 2) * 100}%`,
                          top: `${d.bbox.y * 100}%`,
                          transform: 'translate(-50%, -100%)',
                        }}
                        className={`absolute z-10 pointer-events-none mb-1 transition-all duration-150 flex items-center gap-1 ${
                          isHovered || isSelected ? 'scale-110' : 'scale-90 opacity-90'
                        }`}
                      >
                        <div className="px-1.5 py-0.5 rounded bg-surface/90 backdrop-blur-xs border border-border shadow-popover flex items-center gap-1 text-[10px] font-semibold text-text whitespace-nowrap">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                          <span>{d.class}</span>
                          <span className="text-muted font-mono">{Math.round(d.confidence * 100)}%</span>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </TransformComponent>
          </>
        )}
      </TransformWrapper>

      {/* Bottom Range Scale & Status Info Bar */}
      <div className="px-4 py-2 bg-surface/95 border-t border-border flex items-center justify-between text-xs text-muted font-mono z-10">
        <span>Acoustic Waterfall Target Overlay</span>
        <span>
          Showing <strong className="text-text">{visibleDetections.length}</strong> / {detections.length} Detections
        </span>
      </div>
    </div>
  );
};
