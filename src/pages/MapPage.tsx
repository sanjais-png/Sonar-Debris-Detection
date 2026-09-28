import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PageHeader } from '../components/common/PageHeader';
import { DetectionMap } from '../components/map/DetectionMap';
import { DetectionDrawer } from '../components/map/DetectionDrawer';
import { useDetections } from '../hooks/useDetections';
import { useAnalyses } from '../hooks/useAnalyses';
import { Detection } from '../types/sonar';
import { useSonarContext } from '../context/SonarContext';
import {
  Filter,
  X,
  RotateCcw,
  Calendar,
  AlertCircle,
  SlidersHorizontal,
  Search,
  ChevronLeft,
  ChevronRight,
  Layers,
  MapPin,
  RefreshCw,
} from 'lucide-react';
import { Skeleton } from '../components/common/SkeletonLoader';

export const MapPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { settings } = useSonarContext();

  const { detections, isLoading: isLoadingDetections, isError: isErrorDetections, refetch: refetchDetections } = useDetections();
  const { analyses, isLoading: isLoadingAnalyses } = useAnalyses();

  // URL state persistence
  const selectedClassParam = searchParams.get('class') || 'ALL';
  const selectedStatusParam = searchParams.get('status') || 'ALL';
  const selectedSurveyParam = searchParams.get('survey') || 'ALL';
  const minConfParam = searchParams.get('minConf') ? Number(searchParams.get('minConf')) : 0;
  const hideRejectedParam = searchParams.get('hideRejected') !== 'false'; // default true
  const colorByParam = (searchParams.get('colorBy') as 'status' | 'class') || 'status';
  const dateFromParam = searchParams.get('dateFrom') || '';
  const dateToParam = searchParams.get('dateTo') || '';
  const initialDetId = searchParams.get('det');

  const [selectedClass, setSelectedClass] = useState<string>(selectedClassParam);
  const [selectedStatus, setSelectedStatus] = useState<string>(selectedStatusParam);
  const [selectedSurvey, setSelectedSurvey] = useState<string>(selectedSurveyParam);
  const [minConf, setMinConf] = useState<number>(minConfParam);
  const [hideRejected, setHideRejected] = useState<boolean>(hideRejectedParam);
  const [colorBy, setColorBy] = useState<'status' | 'class'>(colorByParam);
  const [dateFrom, setDateFrom] = useState<string>(dateFromParam);
  const [dateTo, setDateTo] = useState<string>(dateToParam);

  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState<boolean>(true);
  const [activeDetection, setActiveDetection] = useState<Detection | null>(null);

  // Sync states to URL query params
  useEffect(() => {
    const params: Record<string, string> = {};
    if (selectedClass !== 'ALL') params.class = selectedClass;
    if (selectedStatus !== 'ALL') params.status = selectedStatus;
    if (selectedSurvey !== 'ALL') params.survey = selectedSurvey;
    if (minConf > 0) params.minConf = minConf.toString();
    if (!hideRejected) params.hideRejected = 'false';
    if (colorBy !== 'status') params.colorBy = colorBy;
    if (dateFrom) params.dateFrom = dateFrom;
    if (dateTo) params.dateTo = dateTo;
    if (activeDetection) params.det = activeDetection.id;

    setSearchParams(params, { replace: true });
  }, [
    selectedClass,
    selectedStatus,
    selectedSurvey,
    minConf,
    hideRejected,
    colorBy,
    dateFrom,
    dateTo,
    activeDetection,
    setSearchParams,
  ]);

  // Handle deep-link detection auto-open
  useEffect(() => {
    if (initialDetId && detections.length > 0 && !activeDetection) {
      const found = detections.find((d) => d.id === initialDetId);
      if (found) {
        setActiveDetection(found);
      }
    }
  }, [initialDetId, detections, activeDetection]);

  // Filter logic
  const filteredDetections = useMemo(() => {
    return detections.filter((d) => {
      if (hideRejected && d.status === 'rejected') return false;
      if (selectedClass !== 'ALL' && d.class !== selectedClass) return false;
      if (selectedStatus !== 'ALL' && d.status !== selectedStatus) return false;
      if (d.confidence < minConf) return false;
      if (selectedSurvey !== 'ALL' && d.analysisId !== selectedSurvey && d.analysisName !== selectedSurvey) return false;

      // Date filtering using analysis createdAt or detection timestamp if available
      const analysis = analyses.find((a) => a.id === d.analysisId);
      const targetDateStr = analysis?.createdAt || d.createdAt;
      if (targetDateStr) {
        const targetDate = new Date(targetDateStr).getTime();
        if (dateFrom && targetDate < new Date(dateFrom).getTime()) return false;
        if (dateTo && targetDate > new Date(dateTo).getTime() + 86400000) return false;
      }

      return true;
    });
  }, [detections, analyses, hideRejected, selectedClass, selectedStatus, minConf, selectedSurvey, dateFrom, dateTo]);

  const activeAnalysis = analyses.find((a) => a.id === activeDetection?.analysisId) || null;

  const handleResetFilters = () => {
    setSelectedClass('ALL');
    setSelectedStatus('ALL');
    setSelectedSurvey('ALL');
    setMinConf(0);
    setHideRejected(true);
    setDateFrom('');
    setDateTo('');
  };

  const hasActiveFilters =
    selectedClass !== 'ALL' ||
    selectedStatus !== 'ALL' ||
    selectedSurvey !== 'ALL' ||
    minConf > 0 ||
    !hideRejected ||
    dateFrom !== '' ||
    dateTo !== '';

  const isLoading = isLoadingDetections || isLoadingAnalyses;

  return (
    <div className="space-y-4">
      <PageHeader
        title="Interactive GIS Spatial Map"
        subtitle="Georeferenced acoustic target locations, marine debris distribution, and nautical overlays"
      />

      {/* Main Map Container Card */}
      <div className="relative w-full h-[calc(100vh-165px)] min-h-[580px] rounded-card border border-border overflow-hidden bg-background shadow-subtle flex">
        {/* Floating Collapsible Left Filter Panel */}
        <div
          className={`absolute top-0 left-0 bottom-0 z-30 w-80 bg-surface/95 backdrop-blur-md border-r border-border shadow-popover flex flex-col transition-transform duration-300 ease-in-out ${
            isFilterPanelOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {/* Panel Header */}
          <div className="p-3.5 border-b border-border flex items-center justify-between bg-surface">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-primary" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-text">GIS Layer Filters</h3>
            </div>
            <div className="flex items-center gap-1">
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="px-2 py-1 text-[11px] text-muted hover:text-primary font-medium flex items-center gap-1 transition-colors"
                  title="Reset all filters"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsFilterPanelOpen(false)}
                className="p-1 rounded text-muted hover:text-text hover:bg-background transition-colors"
                title="Collapse panel"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Panel Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
            {/* Debris Classification Filter */}
            <div className="space-y-1.5">
              <label className="block font-semibold text-text">Debris Classification</label>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full px-3 py-1.5 text-xs text-text bg-background border border-border rounded-input focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="ALL">All Categories ({detections.length})</option>
                {settings.debrisClasses.map((cls) => {
                  const count = detections.filter((d) => d.class === cls.name).length;
                  return (
                    <option key={cls.id} value={cls.name}>
                      {cls.name} ({count})
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Verification Status Filter */}
            <div className="space-y-1.5">
              <label className="block font-semibold text-text">Verification Status</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-3 py-1.5 text-xs text-text bg-background border border-border rounded-input focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="ALL">All Statuses</option>
                <option value="auto_accepted">Auto Accepted</option>
                <option value="pending_review">Pending Review</option>
                <option value="verified">Verified</option>
                <option value="corrected">Corrected</option>
                <option value="rejected">Rejected (False Positives)</option>
              </select>
            </div>

            {/* Survey Campaign Select */}
            <div className="space-y-1.5">
              <label className="block font-semibold text-text">Survey Campaign</label>
              <select
                value={selectedSurvey}
                onChange={(e) => setSelectedSurvey(e.target.value)}
                className="w-full px-3 py-1.5 text-xs text-text bg-background border border-border rounded-input focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="ALL">All Surveys</option>
                {analyses.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Confidence Threshold Slider */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between">
                <label className="font-semibold text-text">Min Confidence Threshold</label>
                <span className="font-mono font-bold text-primary text-xs">{Math.round(minConf * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={minConf}
                onChange={(e) => setMinConf(parseFloat(e.target.value))}
                className="w-full accent-primary h-1.5 bg-border rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-muted font-mono">
                <span>0%</span>
                <span>50%</span>
                <span>100%</span>
              </div>
            </div>

            {/* Date Range Filter */}
            <div className="space-y-2 pt-1 border-t border-border/60">
              <label className="block font-semibold text-text flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-primary" />
                <span>Survey Date Range</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[10px] text-muted block mb-0.5">From</span>
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="w-full px-2 py-1 text-[11px] text-text bg-background border border-border rounded-input"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-muted block mb-0.5">To</span>
                  <input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="w-full px-2 py-1 text-[11px] text-text bg-background border border-border rounded-input"
                  />
                </div>
              </div>
            </div>

            {/* Hide Rejected Checkbox */}
            <div className="pt-2 border-t border-border">
              <label className="flex items-start gap-2 text-xs text-text cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={hideRejected}
                  onChange={(e) => setHideRejected(e.target.checked)}
                  className="mt-0.5 rounded border-border text-primary focus:ring-primary"
                />
                <span className="font-medium text-xs leading-snug">
                  Hide Rejected / False Positive Targets (Default)
                </span>
              </label>
            </div>
          </div>

          {/* Panel Footer / Counter */}
          <div className="p-3.5 border-t border-border bg-surface flex items-center justify-between text-xs">
            <span className="text-muted">Showing Targets:</span>
            <span className="font-mono font-bold text-text">
              {filteredDetections.length} / {detections.length}
            </span>
          </div>
        </div>

        {/* Collapsed Panel Toggle Button (visible when panel is closed) */}
        {!isFilterPanelOpen && (
          <button
            type="button"
            onClick={() => setIsFilterPanelOpen(true)}
            className="absolute top-4 left-4 z-20 flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-text bg-surface/90 backdrop-blur-md border border-border rounded-button shadow-popover hover:bg-surface transition-colors"
          >
            <ChevronRight className="w-4 h-4 text-primary" />
            <Filter className="w-3.5 h-3.5" />
            <span>Show Layer Filters</span>
          </button>
        )}

        {/* Map Rendering Engine */}
        <div className="w-full h-full flex-1">
          {isLoading ? (
            <div className="w-full h-full bg-[#E2E8F0] animate-pulse flex flex-col items-center justify-center text-muted text-xs font-semibold gap-2">
              <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
              <span>Loading Spatial Sonar Detections...</span>
            </div>
          ) : isErrorDetections ? (
            <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center space-y-3 bg-surface">
              <AlertCircle className="w-8 h-8 text-error" />
              <h3 className="text-base font-semibold text-text">Failed to Load GIS Data</h3>
              <p className="text-xs text-muted max-w-sm">An error occurred while fetching target coordinates. Please verify API connection.</p>
              <button
                type="button"
                onClick={() => refetchDetections()}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-primary hover:bg-primary-hover rounded-button transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Retry Connection</span>
              </button>
            </div>
          ) : (
            <DetectionMap
              detections={filteredDetections}
              onSelectDetection={(d) => setActiveDetection(d)}
              colorBy={colorBy}
              onColorByChange={setColorBy}
              isFilterOpen={isFilterPanelOpen}
              onToggleFilterOpen={() => setIsFilterPanelOpen(!isFilterPanelOpen)}
              activeCount={filteredDetections.length}
              totalCount={detections.length}
              showBasemapSwitcher
            />
          )}

          {/* Empty Filter Overlay when 0 detections match */}
          {!isLoading && !isErrorDetections && filteredDetections.length === 0 && (
            <div className="absolute inset-0 z-20 pointer-events-none flex items-center justify-center p-4">
              <div className="pointer-events-auto max-w-sm w-full p-6 bg-surface/95 backdrop-blur-md border border-border rounded-card shadow-popover text-center space-y-3">
                <div className="w-10 h-10 rounded-full bg-primary-tint flex items-center justify-center text-primary mx-auto">
                  <MapPin className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-text">No Detections Match Your Filters</h4>
                <p className="text-xs text-muted">
                  Try adjusting the confidence slider, selecting different classification categories, or resetting date boundaries.
                </p>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="px-4 py-2 text-xs font-semibold text-white bg-primary hover:bg-primary-hover rounded-button transition-colors shadow-subtle"
                >
                  Clear All Filters
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Target Details Slide-Over Drawer */}
      <DetectionDrawer
        detection={activeDetection}
        analysis={activeAnalysis}
        isOpen={!!activeDetection}
        onClose={() => {
          setActiveDetection(null);
          // Clear det param from URL
          const params = new URLSearchParams(searchParams);
          params.delete('det');
          setSearchParams(params, { replace: true });
        }}
      />
    </div>
  );
};
