import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../components/common/PageHeader';
import { StatCard } from '../components/common/StatCard';
import { RecentAnalysesTable } from '../components/dashboard/RecentAnalysesTable';
import { DebrisTypeChart } from '../components/charts/DebrisTypeChart';
import { ConfidenceDistChart } from '../components/charts/ConfidenceDistChart';
import { MiniMapPreview } from '../components/dashboard/MiniMapPreview';
import { useAnalyses } from '../hooks/useAnalyses';
import { useDetections, useSummaryStats } from '../hooks/useDetections';
import { FileImage, Compass, AlertTriangle, ShieldCheck, PlusCircle } from 'lucide-react';
import { formatPercent } from '../lib/utils';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { analyses, isLoading: isLoadingAnalyses } = useAnalyses();
  const { detections, isLoading: isLoadingDetections } = useDetections();
  const { data: stats, isLoading: isLoadingStats } = useSummaryStats();

  return (
    <div className="space-y-6">
      {/* Page Header with Primary Action */}
      <PageHeader
        title="Sonar Debris Operations Dashboard"
        subtitle="Acoustic waterfall telemetry, automated ML detection feeds, and triage analytics"
        action={
          <button
            onClick={() => navigate('/new-analysis')}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-primary hover:bg-primary-hover rounded-button transition-colors shadow-subtle"
          >
            <PlusCircle className="w-4 h-4" />
            <span>New Analysis Upload</span>
          </button>
        }
      />

      {/* 4 StatCards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Images Analyzed"
          value={stats?.totalImagesAnalyzed ?? analyses.length}
          subtitle="Total side-scan sonar files"
          icon={FileImage}
        />
        <StatCard
          title="Debris Detected"
          value={stats?.totalDebrisDetected ?? detections.length}
          subtitle="Identified seafloor targets"
          icon={Compass}
        />
        <StatCard
          title="Pending Review"
          value={stats?.pendingReviewCount ?? 0}
          subtitle="Targets below 70% confidence"
          icon={AlertTriangle}
          highlight={(stats?.pendingReviewCount ?? 0) > 0}
        />
        <StatCard
          title="Average Confidence"
          value={formatPercent(stats?.averageConfidence ?? 0.82)}
          subtitle="Mean ML model score"
          icon={ShieldCheck}
        />
      </div>

      {/* Custom Lightweight SVG Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DebrisTypeChart detections={detections} />
        <ConfidenceDistChart detections={detections} />
      </div>

      {/* Recent Analyses & Spatial Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-text">Recent Survey Campaigns</h3>
          </div>
          <RecentAnalysesTable analyses={analyses} isLoading={isLoadingAnalyses} />
        </div>
        <div className="lg:col-span-1">
          <MiniMapPreview detections={detections} />
        </div>
      </div>
    </div>
  );
};
