import React, { useState, useEffect } from 'react';
import { SlidersHorizontal, Eye, Download } from 'lucide-react';
import { formatPercent } from '../../lib/utils';
import { useDebounce } from '../../hooks/useDebounce';

interface ViewerToolbarProps {
  confidenceThreshold: number;
  onThresholdChange: (val: number) => void;
  showLabels: boolean;
  onToggleLabels: () => void;
  onDownloadAnnotated: () => void;
}

export const ViewerToolbar: React.FC<ViewerToolbarProps> = React.memo(({
  confidenceThreshold,
  onThresholdChange,
  showLabels,
  onToggleLabels,
  onDownloadAnnotated,
}) => {
  const [sliderVal, setSliderVal] = useState<number>(confidenceThreshold);
  const debouncedSlider = useDebounce(sliderVal, 250);

  useEffect(() => {
    if (debouncedSlider !== confidenceThreshold) {
      onThresholdChange(debouncedSlider);
    }
  }, [debouncedSlider, confidenceThreshold, onThresholdChange]);

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 p-3.5 bg-surface border border-border rounded-card mb-4">
      {/* Debounced Confidence Threshold Slider */}
      <div className="flex items-center gap-3">
        <SlidersHorizontal className="w-4 h-4 text-primary" />
        <span className="text-xs font-semibold text-text">Confidence Filter:</span>
        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={sliderVal}
          onChange={(e) => setSliderVal(parseFloat(e.target.value))}
          className="w-32 md:w-48 accent-primary cursor-pointer"
        />
        <span className="text-xs font-mono font-semibold text-primary bg-primary-tint px-2 py-0.5 rounded border border-primary/20">
          ≥ {formatPercent(sliderVal)}
        </span>
      </div>

      {/* Toggles & Download Actions */}
      <div className="flex items-center gap-3">
        <label className="flex items-center gap-2 text-xs font-medium text-text cursor-pointer select-none px-2.5 py-1 bg-background rounded-input border border-border">
          <input
            type="checkbox"
            checked={showLabels}
            onChange={onToggleLabels}
            className="rounded border-border text-primary focus:ring-primary"
          />
          <Eye className="w-3.5 h-3.5 text-muted" />
          <span>Show BBox Overlay Chips</span>
        </label>

        <button
          onClick={onDownloadAnnotated}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-text bg-surface border border-border hover:bg-background rounded-button transition-colors shadow-subtle"
        >
          <Download className="w-3.5 h-3.5 text-primary" />
          <span>Export BBox Image</span>
        </button>
      </div>
    </div>
  );
});

ViewerToolbar.displayName = 'ViewerToolbar';
