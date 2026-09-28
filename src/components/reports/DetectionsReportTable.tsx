import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Detection } from '../../types/sonar';
import { DataTable, Column } from '../common/DataTable';
import { ClassChip } from '../common/ClassChip';
import { ConfidenceBadge } from '../common/ConfidenceBadge';
import { StatusBadge } from '../common/StatusBadge';
import { formatCoordinate } from '../../lib/coordinates';
import { useSonarContext } from '../../context/SonarContext';
import { ExternalLink, SlidersHorizontal, Check } from 'lucide-react';
import { formatDate } from '../../lib/utils';

interface DetectionsReportTableProps {
  detections: Detection[];
  isLoading: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  onResetFilters?: () => void;
}

type ColumnKey = 'id' | 'analysisName' | 'class' | 'confidence' | 'spatial' | 'status' | 'reviewedBy' | 'date' | 'actions';

export const DetectionsReportTable: React.FC<DetectionsReportTableProps> = ({
  detections,
  isLoading,
  emptyTitle = 'No detections matching report criteria',
  emptyDescription = 'Try adjusting search parameters or filter options.',
  onResetFilters,
}) => {
  const navigate = useNavigate();
  const { settings } = useSonarContext();
  const [pageSize, setPageSize] = useState<number>(10);

  // Column visibility state
  const [visibleColumns, setVisibleColumns] = useState<Record<ColumnKey, boolean>>({
    id: true,
    class: true,
    confidence: true,
    spatial: true,
    status: true,
    analysisName: true,
    reviewedBy: true,
    date: true,
    actions: true,
  });

  const [isColMenuOpen, setIsColMenuOpen] = useState(false);

  const toggleColumn = (key: ColumnKey) => {
    setVisibleColumns((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const allColumns: { key: ColumnKey; header: string; col: Column<Detection> }[] = [
    {
      key: 'id',
      header: 'Detection ID',
      col: {
        key: 'id',
        header: 'Detection ID',
        sortable: true,
        render: (d) => <span className="font-mono text-xs font-semibold text-text">{d.id}</span>,
      },
    },
    {
      key: 'class',
      header: 'Debris Class',
      col: {
        key: 'class',
        header: 'Debris Class',
        sortable: true,
        render: (d) => <ClassChip className={d.class} size="sm" />,
      },
    },
    {
      key: 'confidence',
      header: 'Confidence',
      col: {
        key: 'confidence',
        header: 'Confidence Score',
        sortable: true,
        render: (d) => <ConfidenceBadge confidence={d.confidence} size="sm" />,
      },
    },
    {
      key: 'spatial',
      header: 'Lat / Lon',
      col: {
        key: 'lat',
        header: 'Latitude / Longitude',
        sortable: true,
        render: (d) => (
          <span className="font-mono text-xs text-muted tabular-nums">
            {formatCoordinate(d.lat, d.lon, settings.coordFormat)}
          </span>
        ),
      },
    },
    {
      key: 'status',
      header: 'Status',
      col: {
        key: 'status',
        header: 'Verification Status',
        sortable: true,
        render: (d) => <StatusBadge status={d.status} size="sm" />,
      },
    },
    {
      key: 'analysisName',
      header: 'Survey Name',
      col: {
        key: 'analysisName',
        header: 'Survey Name',
        sortable: true,
        render: (d) => (
          <span className="font-medium text-text hover:text-primary transition-colors">
            {d.analysisName || d.analysisId}
          </span>
        ),
      },
    },
    {
      key: 'reviewedBy',
      header: 'Reviewed By',
      col: {
        key: 'reviewedBy',
        header: 'Reviewed By',
        sortable: true,
        render: (d) => (
          <span className="text-xs text-muted">
            {d.reviewedBy ? d.reviewedBy : <span className="italic text-muted/60">Automated ML</span>}
          </span>
        ),
      },
    },
    {
      key: 'date',
      header: 'Date',
      col: {
        key: 'reviewedAt',
        header: 'Date / Timestamp',
        sortable: true,
        render: (d) => (
          <span className="font-mono text-[11px] text-muted">
            {formatDate(d.reviewedAt || d.createdAt || '2026-09-28')}
          </span>
        ),
      },
    },
    {
      key: 'actions',
      header: 'Actions',
      col: {
        key: 'actions',
        header: '',
        align: 'right',
        render: (d) => (
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/analyses/${d.analysisId}?det=${d.id}`);
            }}
            className="p-1.5 text-muted hover:text-primary transition-colors rounded hover:bg-background"
            title="Open in Image Viewer"
          >
            <ExternalLink className="w-4 h-4" />
          </button>
        ),
      },
    },
  ];

  const activeColumns = allColumns.filter((c) => visibleColumns[c.key]).map((c) => c.col);

  return (
    <div className="space-y-3">
      {/* Table Toolbar & Column Visibility Menu */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted">
          Showing <strong className="text-text font-bold font-mono">{detections.length}</strong> matching record{detections.length !== 1 ? 's' : ''}
        </span>

        <div className="relative">
          <button
            type="button"
            onClick={() => setIsColMenuOpen(!isColMenuOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-text bg-surface border border-border rounded-button shadow-subtle hover:bg-background transition-colors"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-primary" />
            <span>Column Visibility</span>
          </button>

          {isColMenuOpen && (
            <div className="absolute right-0 mt-1 w-52 bg-surface border border-border rounded-card shadow-popover z-30 p-2 space-y-1">
              <div className="text-[11px] font-bold text-muted uppercase px-2 py-1 border-b border-border">
                Toggle Columns
              </div>
              {allColumns.map((col) => (
                <button
                  key={col.key}
                  type="button"
                  onClick={() => toggleColumn(col.key)}
                  className="w-full flex items-center justify-between px-2 py-1.5 text-xs text-text hover:bg-background rounded transition-colors text-left"
                >
                  <span>{col.header}</span>
                  {visibleColumns[col.key] && <Check className="w-3.5 h-3.5 text-primary" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Data Table */}
      <DataTable
        columns={activeColumns}
        data={detections}
        isLoading={isLoading}
        onRowClick={(d) => navigate(`/analyses/${d.analysisId}?det=${d.id}`)}
        emptyTitle={emptyTitle}
        emptyDescription={emptyDescription}
        emptyAction={onResetFilters ? { label: 'Clear Filters', onClick: onResetFilters } : undefined}
        pageSize={pageSize}
        onPageSizeChange={setPageSize}
        pageSizeOptions={[10, 25, 50]}
      />
    </div>
  );
};
