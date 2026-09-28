import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, ArrowRight } from 'lucide-react';

interface NeedsReviewBannerProps {
  analysisId: string;
  pendingCount: number;
  reviewThreshold: number;
}

export const NeedsReviewBanner: React.FC<NeedsReviewBannerProps> = ({
  analysisId,
  pendingCount,
  reviewThreshold,
}) => {
  const navigate = useNavigate();

  if (pendingCount === 0) return null;

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 p-4 mb-4 rounded-card bg-warning-tint border border-warning/30 text-warning shadow-subtle">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-full bg-warning/20 shrink-0">
          <AlertTriangle className="w-5 h-5 text-warning" />
        </div>
        <div>
          <h4 className="text-sm font-semibold text-text">Human Verification Required</h4>
          <p className="text-xs text-muted mt-0.5">
            This sonar campaign contains <strong className="text-warning font-semibold">{pendingCount}</strong> detection
            {pendingCount === 1 ? '' : 's'} with prediction confidence below{' '}
            <strong className="text-text">{Math.round(reviewThreshold * 100)}%</strong>.
          </p>
        </div>
      </div>

      <button
        onClick={() => navigate(`/review-queue?analysisId=${analysisId}`)}
        className="px-4 py-2 text-xs font-semibold text-white bg-warning hover:bg-warning/90 rounded-button transition-colors flex items-center gap-1.5 shrink-0 shadow-subtle"
      >
        <span>Review Now</span>
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
};
