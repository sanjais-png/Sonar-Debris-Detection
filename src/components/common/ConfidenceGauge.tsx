import React from 'react';

interface ConfidenceGaugeProps {
  confidence: number; // 0..1
  showValue?: boolean;
}

export const ConfidenceGauge: React.FC<ConfidenceGaugeProps> = React.memo(({
  confidence,
  showValue = true,
}) => {
  const percent = Math.round(confidence * 100);

  let barColor = '#BC6A66'; // Danger red (<50%)
  let textColor = 'text-danger';
  let label = 'Low Confidence';

  if (percent >= 80) {
    barColor = '#5E9C7E'; // Success green (80%+)
    textColor = 'text-success';
    label = 'High Confidence';
  } else if (percent >= 50) {
    barColor = '#C79A4B'; // Warning amber (50-79%)
    textColor = 'text-warning';
    label = 'Medium Confidence';
  }

  return (
    <div className="w-full space-y-1.5 select-none">
      <div className="flex items-center justify-between text-xs">
        <span className={`font-semibold ${textColor}`}>{label}</span>
        {showValue && (
          <span className="font-mono font-bold text-text tabular-nums text-sm">
            {percent}%
          </span>
        )}
      </div>
      <div className="w-full bg-border/60 rounded-full h-2 overflow-hidden">
        <div
          className="h-full transition-all duration-300 rounded-full"
          style={{
            width: `${percent}%`,
            backgroundColor: barColor,
          }}
        />
      </div>
    </div>
  );
});

ConfidenceGauge.displayName = 'ConfidenceGauge';
