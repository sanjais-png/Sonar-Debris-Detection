import React from 'react';
import { Card } from './Card';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive?: boolean;
  };
  highlight?: boolean;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  highlight = false,
}) => {
  return (
    <Card className={highlight ? 'border-primary/40 bg-primary-tint/30' : ''}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">{title}</p>
          <h3 className="text-2xl font-bold text-text mt-1.5 tabular-nums">{value}</h3>
          {subtitle && <p className="text-xs text-muted mt-1">{subtitle}</p>}
          {trend && (
            <div className="flex items-center gap-1.5 mt-2 text-xs font-medium">
              <span className={trend.isPositive ? 'text-success' : 'text-danger'}>
                {trend.value}
              </span>
              <span className="text-muted">vs last month</span>
            </div>
          )}
        </div>
        <div className="p-2.5 rounded-lg bg-primary-tint text-primary shrink-0">
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </Card>
  );
};
