import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Analysis } from '../../types/sonar';
import { DataTable, Column } from '../common/DataTable';
import { formatDate } from '../../lib/utils';
import { ChevronRight } from 'lucide-react';

interface RecentAnalysesTableProps {
  analyses: Analysis[];
  isLoading: boolean;
}

export const RecentAnalysesTable: React.FC<RecentAnalysesTableProps> = ({
  analyses,
  isLoading,
}) => {
  const navigate = useNavigate();

  const columns: Column<Analysis>[] = [
    {
      key: 'name',
      header: 'Survey Name',
      sortable: true,
      render: (a) => (
        <div>
          <span className="font-semibold text-text hover:text-primary">{a.name}</span>
          <span className="text-[11px] text-muted block mt-0.5">{a.vessel || 'Survey Vessel'}</span>
        </div>
      ),
    },
    {
      key: 'surveyDate',
      header: 'Date Analyzed',
      sortable: true,
      render: (a) => <span className="text-muted tabular-nums">{formatDate(a.surveyDate)}</span>,
    },
    {
      key: 'detections',
      header: 'Detections',
      sortable: true,
      render: (a) => (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-background border border-border tabular-nums text-text">
          {a.detections.length} objects
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (a) => {
        const pending = a.detections.filter((d) => d.status === 'pending_review').length;
        return (
          <span
            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
              pending > 0
                ? 'bg-warning-tint text-warning border border-warning/20'
                : 'bg-success-tint text-success border border-success/20'
            }`}
          >
            {pending > 0 ? `${pending} Pending Review` : 'Complete'}
          </span>
        );
      },
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: (a) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/analyses/${a.id}`);
          }}
          className="p-1 text-muted hover:text-primary transition-colors"
          title="View Analysis"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={analyses.slice(0, 5)}
      isLoading={isLoading}
      onRowClick={(a) => navigate(`/analyses/${a.id}`)}
      emptyTitle="No recent analyses"
      emptyDescription="Upload your first sonar image to begin debris detection."
    />
  );
};
