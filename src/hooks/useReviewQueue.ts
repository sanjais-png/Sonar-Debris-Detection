import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { sonarApi } from '../api/sonarApi';
import { DetectionStatus, FilterOptions, BoundingBox } from '../types/sonar';
import { useSonarContext } from '../context/SonarContext';

export function useReviewQueue(filters?: FilterOptions) {
  const queryClient = useQueryClient();
  const { refreshStats } = useSonarContext();

  const queueQuery = useQuery({
    queryKey: ['reviewQueue', filters],
    queryFn: () => sonarApi.getReviewQueue(filters),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({
      detectionId,
      status,
      classOverride,
      note,
    }: {
      detectionId: string;
      status: DetectionStatus;
      classOverride?: string;
      note?: string;
    }) => sonarApi.updateDetectionStatus(detectionId, status, classOverride, note),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviewQueue'] });
      queryClient.invalidateQueries({ queryKey: ['analyses'] });
      queryClient.invalidateQueries({ queryKey: ['analysis'] });
      queryClient.invalidateQueries({ queryKey: ['detections'] });
      queryClient.invalidateQueries({ queryKey: ['summaryStats'] });
      refreshStats();
    },
  });

  const updateBBoxMutation = useMutation({
    mutationFn: ({ detectionId, bbox }: { detectionId: string; bbox: BoundingBox }) =>
      sonarApi.updateDetectionBBox(detectionId, bbox),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviewQueue'] });
      queryClient.invalidateQueries({ queryKey: ['analysis'] });
      queryClient.invalidateQueries({ queryKey: ['detections'] });
    },
  });

  return {
    queue: queueQuery.data || [],
    isLoading: queueQuery.isLoading,
    isError: queueQuery.isError,
    refetch: queueQuery.refetch,
    updateStatus: updateStatusMutation.mutateAsync,
    isUpdatingStatus: updateStatusMutation.isPending,
    updateBBox: updateBBoxMutation.mutateAsync,
    isUpdatingBBox: updateBBoxMutation.isPending,
  };
}
