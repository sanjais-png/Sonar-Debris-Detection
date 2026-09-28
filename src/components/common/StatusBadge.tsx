import React from 'react';
import { DetectionStatus } from '../../types/sonar';

interface StatusBadgeProps {
  status: DetectionStatus;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = React.memo(({ status, size = 'md' }) => {
  const isSm = size === 'sm';
  const sizeClasses = isSm ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs';

  switch (status) {
    case 'auto_accepted':
      return (
        <span className={`inline-flex items-center font-medium rounded-full bg-success-tint text-success border border-success/20 ${sizeClasses}`}>
          Auto Accepted
        </span>
      );
    case 'pending_review':
      return (
        <span className={`inline-flex items-center font-medium rounded-full bg-warning-tint text-warning border border-warning/20 ${sizeClasses}`}>
          Pending Review
        </span>
      );
    case 'verified':
      return (
        <span className={`inline-flex items-center font-medium rounded-full bg-primary-tint text-primary border border-primary/20 ${sizeClasses}`}>
          Verified
        </span>
      );
    case 'corrected':
      return (
        <span className={`inline-flex items-center font-medium rounded-full bg-primary-tint text-primary border border-primary/30 ${sizeClasses}`}>
          Corrected
        </span>
      );
    case 'rejected':
      return (
        <span className={`inline-flex items-center font-medium rounded-full bg-danger-tint text-danger border border-danger/20 ${sizeClasses}`}>
          Rejected
        </span>
      );
    default:
      return (
        <span className={`inline-flex items-center font-medium rounded-full bg-background text-muted border border-border ${sizeClasses}`}>
          {status}
        </span>
      );
  }
});

StatusBadge.displayName = 'StatusBadge';
