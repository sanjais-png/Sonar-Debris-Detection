import React, { useState, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { PageHeader } from '../components/common/PageHeader';
import { FilterBar } from '../components/common/FilterBar';
import { DetectionsReportTable } from '../components/reports/DetectionsReportTable';
import { useDetections } from '../hooks/useDetections';
import { useAnalyses } from '../hooks/useAnalyses';
import { FilterOptions } from '../types/sonar';
import { exportDetectionsToCSV, exportDetectionsToGeoJSON } from '../lib/export';
import { Download, ChevronDown, CheckCircle2, XCircle, ShieldAlert, Percent, RefreshCw, AlertCircle } from 'lucide-react';
import { Card } from '../components/common/Card';
import { useToast } from '../context/ToastContext';

export const ReportsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { showToast } = useToast();
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);

  // Parse filters from URL query parameters
  const filters: FilterOptions = {
    search: searchParams.get('search') || '',
    debrisClass: searchParams.get('debrisClass') || 'ALL',
    status: searchParams.get('status') || 'ALL',
    surveyName: searchParams.get('surveyName') || 'ALL',
    minConfidence: searchParams.get('minConfidence') ? Number(searchParams.get('minConfidence')) : 0,
    dateFrom: searchParams.get('dateFrom') || '',
    dateTo: searchParams.get('dateTo') || '',
  };

  const { detections, isLoading: isLoadingDetections, isError, refetch } = useDetections();
  const { analyses } = useAnalyses();

  // Filter detections client-side based on all URL filter criteria
  const filteredDetections = useMemo(() => {
    return detections.filter((d) => {
      // Search text filter
      if (filters.search) {
        const q = filters.search.toLowerCase();
        const matchesId = d.id.toLowerCase().includes(q);
        const matchesClass = d.class.toLowerCase().includes(q);
        const matchesSurvey = d.analysisName ? d.analysisName.toLowerCase().includes(q) : false;
        if (!matchesId && !matchesClass && !matchesSurvey) return false;
      }

      // Debris Class filter
      if (filters.debrisClass && filters.debrisClass !== 'ALL' && d.class !== filters.debrisClass) {
        return false;
      }

      // Verification Status filter
      if (filters.status && filters.status !== 'ALL' && d.status !== filters.status) {
        return false;
      }

      // Survey Name filter
      if (filters.surveyName && filters.surveyName !== 'ALL') {
        if (d.analysisName !== filters.surveyName && d.analysisId !== filters.surveyName) {
          return false;
        }
      }

      // Min Confidence filter
      if (filters.minConfidence !== undefined && filters.minConfidence > 0) {
        if (d.confidence < filters.minConfidence) return false;
      }

      // Date Range filter
      const analysis = analyses.find((a) => a.id === d.analysisId);
      const targetDateStr = d.reviewedAt || d.createdAt || analysis?.createdAt;
      if (targetDateStr) {
        const targetTime = new Date(targetDateStr).getTime();
        if (filters.dateFrom && targetTime < new Date(filters.dateFrom).getTime()) return false;
        if (filters.dateTo && targetTime > new Date(filters.dateTo).getTime() + 86400000) return false;
      }

      return true;
    });
  }, [detections, analyses, filters]);

  // Stat summary calculations based on filtered dataset
  const totalCount = filteredDetections.length;
  const verifiedCount = filteredDetections.filter(
    (d) => d.status === 'verified' || d.status === 'auto_accepted' || d.status === 'corrected'
  ).length;
  const rejectedCount = filteredDetections.filter((d) => d.status === 'rejected').length;
  const avgConfidence =
    totalCount > 0
      ? filteredDetections.reduce((sum, d) => sum + d.confidence, 0) / totalCount
      : 0;

  const handleFilterChange = (newFilters: Partial<FilterOptions>) => {
    const updated = new URLSearchParams(searchParams);
    Object.entries(newFilters).forEach(([key, val]) => {
      if (val === undefined || val === '' || val === 'ALL' || val === false || val === 0) {
        updated.delete(key);
      } else {
        updated.set(key, String(val));
      }
    });
    setSearchParams(updated);
  };

  const handleResetFilters = () => {
    setSearchParams({});
  };

  const surveyOptions = useMemo(() => {
    return analyses.map((a) => ({ label: a.name, value: a.name }));
  }, [analyses]);

  const handleExportCSV = () => {
    exportDetectionsToCSV(filteredDetections);
    setIsExportMenuOpen(false);
    showToast({
      type: 'success',
      title: 'CSV Dataset Export Ready',
      description: `Successfully exported ${filteredDetections.length} target records to CSV.`,
    });
  };

  const handleExportGeoJSON = () => {
    exportDetectionsToGeoJSON(filteredDetections);
    setIsExportMenuOpen(false);
    showToast({
      type: 'success',
      title: 'GeoJSON Collection Ready',
      description: `Successfully exported ${filteredDetections.length} spatial features to GeoJSON format.`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Page Header with Export Dropdown */}
      <PageHeader
        title="Sonar Detections & Spatial Reports"
        subtitle="Comprehensive exportable acoustic target records across all survey campaigns"
        action={
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
              className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-primary hover:bg-primary-hover rounded-button transition-colors shadow-subtle"
            >
              <Download className="w-4 h-4" />
              <span>Export Dataset ({filteredDetections.length})</span>
              <ChevronDown className="w-3.5 h-3.5 opacity-80" />
            </button>

            {isExportMenuOpen && (
              <div className="absolute right-0 mt-1 w-48 bg-surface border border-border rounded-card shadow-popover z-30 p-1.5 space-y-1">
                <button
                  type="button"
                  onClick={handleExportCSV}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-text hover:bg-background rounded transition-colors text-left"
                >
                  <Download className="w-3.5 h-3.5 text-primary" />
                  <div>
                    <div className="font-semibold">Export as CSV</div>
                    <div className="text-[10px] text-muted">Tabular spreadsheet format</div>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={handleExportGeoJSON}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-text hover:bg-background rounded transition-colors text-left border-t border-border/60 pt-2"
                >
                  <Download className="w-3.5 h-3.5 text-primary" />
                  <div>
                    <div className="font-semibold">Export as GeoJSON</div>
                    <div className="text-[10px] text-muted">GIS spatial vector data</div>
                  </div>
                </button>
              </div>
            )}
          </div>
        }
      />

      {/* Filtered Summary StatCards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card padding="sm" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary-tint flex items-center justify-center text-primary shrink-0">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-muted">Total Targets Filtered</p>
            <p className="text-xl font-bold font-mono text-text">{totalCount}</p>
          </div>
        </Card>

        <Card padding="sm" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-success/15 flex items-center justify-center text-success shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-muted">Verified & Accepted</p>
            <p className="text-xl font-bold font-mono text-text">{verifiedCount}</p>
          </div>
        </Card>

        <Card padding="sm" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-danger/15 flex items-center justify-center text-danger shrink-0">
            <XCircle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-muted">Rejected (False Positives)</p>
            <p className="text-xl font-bold font-mono text-text">{rejectedCount}</p>
          </div>
        </Card>

        <Card padding="sm" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-accent/15 flex items-center justify-center text-accent shrink-0">
            <Percent className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-muted">Average Confidence</p>
            <p className="text-xl font-bold font-mono text-text">{Math.round(avgConfidence * 100)}%</p>
          </div>
        </Card>
      </div>

      {/* FilterBar with URL Search Synchronization */}
      <FilterBar
        filters={filters}
        onFilterChange={handleFilterChange}
        onReset={handleResetFilters}
        showClassFilter={true}
        showStatusFilter={true}
        showSurveyFilter={true}
        surveyOptions={surveyOptions}
        showMinConfidenceFilter={true}
        showDateRangeFilter={true}
      />

      {/* Main Report Table & Error State */}
      {isError ? (
        <Card className="flex flex-col items-center justify-center py-12 text-center space-y-3">
          <AlertCircle className="w-8 h-8 text-danger" />
          <h3 className="text-base font-semibold text-text">Failed to Load Report Data</h3>
          <p className="text-xs text-muted max-w-sm">Unable to fetch detection records from the server.</p>
          <button
            type="button"
            onClick={() => refetch()}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-primary hover:bg-primary-hover rounded-button transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry Loading</span>
          </button>
        </Card>
      ) : (
        <DetectionsReportTable
          detections={filteredDetections}
          isLoading={isLoadingDetections}
          emptyTitle="No detections matching report criteria"
          emptyDescription="Try adjusting search query, class, status, or date range filters."
          onResetFilters={handleResetFilters}
        />
      )}
    </div>
  );
};
