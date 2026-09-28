import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { PageHeader } from '../components/common/PageHeader';
import { QueueList } from '../components/review-queue/QueueList';
import { FocusedCropViewer } from '../components/review-queue/FocusedCropViewer';
import { DecisionPanel } from '../components/review-queue/DecisionPanel';
import { EmptyState } from '../components/common/EmptyState';
import { useReviewQueue } from '../hooks/useReviewQueue';
import { useAnalyses } from '../hooks/useAnalyses';
import { useSonarContext } from '../context/SonarContext';
import { useToast } from '../context/ToastContext';
import { CheckCircle2, MapPin } from 'lucide-react';
import { Detection } from '../types/sonar';

export const ReviewQueuePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const { queue, isLoading, isError, refetch, updateStatus } = useReviewQueue();
  const { analyses } = useAnalyses();
  const { settings } = useSonarContext();
  const { showToast } = useToast();

  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [filterClass, setFilterClass] = useState<string>('ALL');
  const [filterSurvey, setFilterSurvey] = useState<string>('ALL');
  const [minConfidence, setMinConfidence] = useState<number>(0);

  const [isAdjustingBox, setIsAdjustingBox] = useState<boolean>(false);
  const [note, setNote] = useState<string>('');
  const [totalInitialCount, setTotalInitialCount] = useState<number>(0);
  const [reviewedCount, setReviewedCount] = useState<number>(0);

  // Initialize total queue count on initial load
  useEffect(() => {
    if (queue.length > 0 && totalInitialCount === 0) {
      setTotalInitialCount(queue.length);
    }
  }, [queue.length, totalInitialCount]);

  // Handle deep-linking query parameters: /review?analysis=ID&detection=ID
  const targetAnalysisId = searchParams.get('analysis') || searchParams.get('analysisId');
  const targetDetectionId = searchParams.get('detection') || searchParams.get('det');

  // Filter & sort queue by lowest confidence first by default
  const filteredQueue = useMemo(() => {
    let result = queue.filter((d) => {
      if (filterClass !== 'ALL' && d.class !== filterClass) return false;
      if (filterSurvey !== 'ALL' && d.analysisName !== filterSurvey) return false;
      if (d.confidence < minConfidence) return false;
      return true;
    });

    return result.sort((a, b) => a.confidence - b.confidence);
  }, [queue, filterClass, filterSurvey, minConfidence]);

  // Sync deep link selection on initial load
  useEffect(() => {
    if (targetDetectionId && filteredQueue.length > 0) {
      const idx = filteredQueue.findIndex((d) => d.id === targetDetectionId);
      if (idx !== -1) {
        setCurrentIndex(idx);
      }
    } else if (targetAnalysisId && filteredQueue.length > 0) {
      const idx = filteredQueue.findIndex((d) => d.analysisId === targetAnalysisId);
      if (idx !== -1) {
        setCurrentIndex(idx);
      }
    }
  }, [targetDetectionId, targetAnalysisId, filteredQueue]);

  const activeDetection: Detection | undefined = filteredQueue[currentIndex] || filteredQueue[0];
  const activeAnalysis = analyses.find((a) => a.id === activeDetection?.analysisId);
  const activeImageUrl = activeAnalysis?.imageUrl || '';

  // Decision Handler with 6-second Undo Toast & Auto-advance
  const handleDecision = useCallback(
    async (
      status: 'verified' | 'rejected' | 'corrected',
      classOverride?: string
    ) => {
      if (!activeDetection) return;

      const previousDetection = { ...activeDetection };

      try {
        await updateStatus({
          detectionId: activeDetection.id,
          status,
          classOverride,
          note: note.trim() || undefined,
        });

        setReviewedCount((cnt) => cnt + 1);

        // Show 6-second Undo Toast
        showToast({
          type: 'success',
          duration: 6000,
          title: `Target ${status === 'verified' ? 'Confirmed' : status === 'rejected' ? 'Rejected' : 'Reclassified'}`,
          description: `Logged verification decision for ${activeDetection.id}.`,
          actionLabel: 'Undo Action',
          onAction: async () => {
            await updateStatus({
              detectionId: previousDetection.id,
              status: 'pending_review',
              classOverride: previousDetection.class,
            });
            setReviewedCount((cnt) => Math.max(0, cnt - 1));
            showToast({
              type: 'info',
              title: 'Decision Undone',
              description: `Restored target ${previousDetection.id} back to review queue.`,
            });
          },
        });

        setNote('');

        // Auto advance to next item
        if (currentIndex < filteredQueue.length - 1) {
          setCurrentIndex((idx) => idx);
        } else if (currentIndex > 0) {
          setCurrentIndex((idx) => idx - 1);
        }
      } catch (e) {
        showToast({
          type: 'danger',
          title: 'Update Failed',
          description: 'Could not record verification decision.',
        });
      }
    },
    [activeDetection, currentIndex, filteredQueue.length, note, showToast, updateStatus]
  );

  // Keyboard Shortcuts: A confirm, R reject, C change class, Left/Right arrow keys
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeElement = document.activeElement;
      if (
        activeElement &&
        ['INPUT', 'TEXTAREA', 'SELECT'].includes(activeElement.tagName)
      ) {
        return;
      }

      if (!activeDetection) return;

      if (e.key === 'a' || e.key === 'A') {
        e.preventDefault();
        handleDecision('verified');
      } else if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        handleDecision('rejected');
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        if (currentIndex > 0) setCurrentIndex((i) => i - 1);
      } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        if (currentIndex < filteredQueue.length - 1) setCurrentIndex((i) => i + 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeDetection, currentIndex, filteredQueue.length, handleDecision]);

  // Clear Queue Empty State
  if (!isLoading && filteredQueue.length === 0) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Hydrographer Review Queue"
          subtitle="Triage low-confidence neural model predictions (<70% confidence threshold)"
        />
        <EmptyState
          icon={CheckCircle2}
          title="All caught up!"
          description="All sonar target detections have been reviewed or meet your confidence threshold settings."
          action={{
            label: 'Explore GIS Map',
            onClick: () => navigate('/map'),
          }}
        />
      </div>
    );
  }

  const surveyOptions = Array.from(new Set(queue.map((q) => q.analysisName).filter(Boolean))) as string[];
  const classOptions = settings.debrisClasses.map((c) => c.name);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Hydrographer Review Queue"
        subtitle="Verify, reclassify, or reject low-confidence ML acoustic target predictions"
      />

      {/* Three-Part Layout */}
      <div className="flex flex-col lg:flex-row gap-6 lg:h-[calc(100vh-210px)] min-h-[580px] h-auto">
        {/* Left Column: Queue List (300px) */}
        <QueueList
          queue={filteredQueue}
          totalReviewed={reviewedCount}
          totalInitialCount={totalInitialCount || filteredQueue.length}
          activeDetectionId={activeDetection?.id || null}
          onSelectDetection={(id) => {
            const idx = filteredQueue.findIndex((d) => d.id === id);
            if (idx !== -1) setCurrentIndex(idx);
          }}
          filterClass={filterClass}
          onFilterClassChange={setFilterClass}
          filterSurvey={filterSurvey}
          onFilterSurveyChange={setFilterSurvey}
          minConfidence={minConfidence}
          onMinConfidenceChange={setMinConfidence}
          surveyOptions={surveyOptions}
          classOptions={classOptions}
        />

        {/* Center Column: Focused Viewport */}
        <div className="flex-1 h-full min-w-0">
          {activeDetection && (
            <FocusedCropViewer
              imageUrl={activeImageUrl}
              detection={activeDetection}
              isAdjustingBox={isAdjustingBox}
              onToggleAdjustBox={() => setIsAdjustingBox(!isAdjustingBox)}
            />
          )}
        </div>

        {/* Right Column: Decision Panel */}
        <div className="w-full lg:w-[360px] h-full shrink-0">
          {activeDetection && (
            <DecisionPanel
              detection={activeDetection}
              currentIndex={currentIndex}
              totalCount={filteredQueue.length}
              onConfirm={() => handleDecision('verified')}
              onReject={() => handleDecision('rejected')}
              onChangeClass={(newCls) => handleDecision('corrected', newCls)}
              onPrev={() => setCurrentIndex((i) => Math.max(0, i - 1))}
              onNext={() => setCurrentIndex((i) => Math.min(filteredQueue.length - 1, i + 1))}
              isAdjustingBox={isAdjustingBox}
              onToggleAdjustBox={() => setIsAdjustingBox(!isAdjustingBox)}
              note={note}
              onNoteChange={setNote}
            />
          )}
        </div>
      </div>
    </div>
  );
};
