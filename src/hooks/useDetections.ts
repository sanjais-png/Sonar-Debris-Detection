import { useQuery } from '@tanstack/react-query';
import { sonarApi } from '../api/sonarApi';
import { FilterOptions } from '../types/sonar';

export function useDetections(filters?: FilterOptions) {
  const query = useQuery({
    queryKey: ['detections', filters],
    queryFn: () => sonarApi.getDetections(filters),
  });

  return {
    detections: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
}

export function useSummaryStats() {
  return useQuery({
    queryKey: ['summaryStats'],
    queryFn: () => sonarApi.getSummaryStats(),
  });
}
