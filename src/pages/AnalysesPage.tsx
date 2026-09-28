import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { PageHeader } from '../components/common/PageHeader';
import { DataTable, Column } from '../components/common/DataTable';
import { FilterBar } from '../components/common/FilterBar';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { StatusBadge } from '../components/common/StatusBadge';
import { useAnalyses } from '../hooks/useAnalyses';
import { Analysis, FilterOptions } from '../types/sonar';
import { formatDate, formatShortDate } from '../lib/utils';
import { ChevronRight, Trash2, PlusCircle, Download, Eye, AlertTriangle, RefreshCw, FileImage } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { useSonarContext } from '../context/SonarContext';

export const AnalysesPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { showToast } = useToast();
  const { settings } = useSonarContext();

  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  // Parse filters, page size & pagination from URL query string for full persistence
  const filters: FilterOptions = {
    search: searchParams.get('search') || '',
    status: searchParams.get('status') || 'ALL',
    dateFrom: searchParams.get('dateFrom') || '',
    dateTo: searchParams.get('dateTo') || '',
    hasLowConfidence: searchParams.get('hasLowConfidence') === 'true',
  };

  const pageSize = Number(searchParams.get('pageSize')) || 10;

  const { analyses, isLoading, isError, refetch, deleteAnalysis, isDeleting } = useAnalyses(filters);

  // Update query string state seamlessly
  const handleFilterChange = (newFilters: Partial<FilterOptions>) => {
    const updated = new URLSearchParams(searchParams);
    Object.entries(newFilters).forEach(([key, val]) => {
      if (val === undefined || val === '' || val === 'ALL' || val === false) {
        updated.delete(key);
      } else {
        updated.set(key, String(val));
      }
    });
    setSearchParams(updated);
  };

  const handlePageSizeChange = (newSize: number) => {
    const updated = new URLSearchParams(searchParams);
    updated.set('pageSize', String(newSize));
    setSearchParams(updated);
  };

  const handleResetFilters = () => {
    setSearchParams({});
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTargetId) return;
    try {
      await deleteAnalysis(deleteTargetId);
      showToast({
        type: 'success',
        title: 'Analysis Deleted',
        description: 'Survey campaign record and telemetry removed successfully.',
      });
    } catch (e) {
      showToast({
        type: 'danger',
        title: 'Delete Failed',
        description: 'Could not delete the selected campaign.',
      });
    } finally {
      setDeleteTargetId(null);
    }
  };

  const handleDownloadAnnotated = (analysis: Analysis) => {
    const a = document.createElement('a');
    a.href = analysis.imageUrl || analysis.thumbnailUrl || '';
    a.download = `${analysis.name.replace(/[^a-z0-9]/gi, '_')}_annotated.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    showToast({
      type: 'info',
      title: 'Download Started',
      description: `Downloading annotated image for ${analysis.name}.`,
    });
  };

  // Determine if total campaign list is empty vs filtered search return is empty
  const hasActiveFilters = Object.entries(filters).some(
    ([key, val]) => val !== undefined && val !== '' && val !== 'ALL' && val !== false
  );

  const columns: Column<Analysis>[] = [
    {
      key: 'thumbnail',
      header: 'Image',
      render: (a) => (
        <div className="w-14 h-9 rounded bg-background border border-border overflow-hidden shrink-0 flex items-center justify-center">
          {a.thumbnailUrl || a.imageUrl ? (
            <img
              src={a.thumbnailUrl || a.imageUrl}
              alt={a.name}
              width={56}
              height={36}
              loading="lazy"
              className="w-full h-full object-cover"
            />
          ) : (
            <FileImage className="w-4 h-4 text-muted" />
          )}
        </div>
      ),
    },
    {
      key: 'name',
      header: 'Survey Campaign',
      sortable: true,
      render: (a) => (
        <div>
          <span className="font-semibold text-text hover:text-primary transition-colors">{a.name}</span>
          <span className="text-[11px] text-muted block mt-0.5">
            {a.vessel || 'RV Oceanus'} • {a.sonarType || 'Klein 4900'}
          </span>
        </div>
      ),
    },
    {
      key: 'surveyDate',
      header: 'Survey Date',
      sortable: true,
      render: (a) => <span className="text-muted font-mono text-xs">{formatShortDate(a.surveyDate)}</span>,
    },
    {
      key: 'createdAt',
      header: 'Analyzed Date',
      sortable: true,
      render: (a) => <span className="text-muted font-mono text-xs">{formatDate(a.createdAt)}</span>,
    },
    {
      key: 'detections',
      header: 'Total Targets',
      sortable: true,
      render: (a) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-semibold bg-background border border-border font-mono text-text">
          {a.detections.length} objects
        </span>
      ),
    },
    {
      key: 'lowConfidence',
      header: 'Low Confidence',
      render: (a) => {
        const lowCount = a.detections.filter((d) => d.confidence < settings.reviewThreshold).length;
        if (lowCount === 0) {
          return <span className="text-xs text-muted font-mono">0</span>;
        }
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-warning-tint text-warning border border-warning/30 font-mono">
            <AlertTriangle className="w-3 h-3" />
            <span>{lowCount}</span>
          </span>
        );
      },
    },
    {
      key: 'status',
      header: 'Status',
      render: (a) => {
        const pending = a.detections.filter((d) => d.status === 'pending_review').length;
        return pending > 0 ? (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-warning-tint text-warning border border-warning/30">
            {pending} Pending Review
          </span>
        ) : (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-success-tint text-success border border-success/30">
            Completed
          </span>
        );
      },
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: (a) => (
        <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => navigate(`/analyses/${a.id}`)}
            className="p-1.5 text-muted hover:text-primary rounded hover:bg-background transition-colors"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDownloadAnnotated(a)}
            className="p-1.5 text-muted hover:text-primary rounded hover:bg-background transition-colors"
            title="Download Annotated Image"
          >
            <Download className="w-4 h-4" />
          </button>
          <button
            onClick={() => setDeleteTargetId(a.id)}
            className="p-1.5 text-muted hover:text-danger rounded hover:bg-background transition-colors"
            title="Delete Analysis"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  if (isError) {
    return (
      <div className="space-y-6">
        <PageHeader title="Analyses Archive" />
        <div className="p-8 text-center bg-surface rounded-card border border-border space-y-4">
          <p className="text-sm font-semibold text-danger">Failed to load analyses campaigns</p>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 text-xs font-semibold text-white bg-primary rounded-button flex items-center gap-2 mx-auto"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry Loading</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Analyses"
        subtitle="Manage, search, and inspect all processed side-scan sonar survey campaigns"
        action={
          <button
            onClick={() => navigate('/new-analysis')}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-primary hover:bg-primary-hover rounded-button transition-colors shadow-subtle"
          >
            <PlusCircle className="w-4 h-4" />
            <span>New Analysis</span>
          </button>
        }
      />

      {/* Filter Bar with URL Search Parameters persistence */}
      <FilterBar
        filters={filters}
        onFilterChange={handleFilterChange}
        onReset={handleResetFilters}
        showClassFilter={false}
        showStatusFilter={true}
        showDateRangeFilter={true}
        showLowConfidenceToggle={true}
        statusOptions={[
          { label: 'All Statuses', value: 'ALL' },
          { label: 'Completed', value: 'completed' },
          { label: 'Analyzing', value: 'analyzing' },
        ]}
      />

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={analyses}
        isLoading={isLoading}
        onRowClick={(a) => navigate(`/analyses/${a.id}`)}
        emptyTitle={hasActiveFilters ? 'No matching analyses' : 'No analyses yet'}
        emptyDescription={
          hasActiveFilters
            ? 'Try adjusting your search query or clear active filters.'
            : 'Upload your first sonar image to begin automated debris detection.'
        }
        emptyAction={
          hasActiveFilters
            ? { label: 'Clear Filters', onClick: handleResetFilters }
            : { label: 'Start your first analysis', onClick: () => navigate('/new-analysis') }
        }
        pageSize={pageSize}
        onPageSizeChange={handlePageSizeChange}
        pageSizeOptions={[10, 25, 50]}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!deleteTargetId}
        onOpenChange={(open) => !open && setDeleteTargetId(null)}
        title="Delete Sonar Analysis Campaign?"
        description="This action cannot be undone. All bounding box annotations and target detection telemetry associated with this survey will be permanently deleted."
        confirmLabel="Delete Campaign"
        isDanger={true}
        onConfirm={handleDeleteConfirm}
        isLoading={isDeleting}
      />
    </div>
  );
};
