import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { sonarApi } from '../api/sonarApi';
import { FilterOptions } from '../types/sonar';
import { useSonarContext } from '../context/SonarContext';

export function useAnalyses(filters?: FilterOptions) {
  const queryClient = useQueryClient();
  const { refreshStats } = useSonarContext();

  const analysesQuery = useQuery({
    queryKey: ['analyses', filters],
    queryFn: () => sonarApi.getAnalyses(filters),
  });

  const createAnalysisMutation = useMutation({
    mutationFn: sonarApi.createAnalysis,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['analyses'] });
      queryClient.invalidateQueries({ queryKey: ['summaryStats'] });
      queryClient.invalidateQueries({ queryKey: ['reviewQueue'] });
      queryClient.invalidateQueries({ queryKey: ['detections'] });
      refreshStats();
    },
  });

  const deleteAnalysisMutation = useMutation({
    mutationFn: sonarApi.deleteAnalysis,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['analyses'] });
      queryClient.invalidateQueries({ queryKey: ['summaryStats'] });
      queryClient.invalidateQueries({ queryKey: ['reviewQueue'] });
      queryClient.invalidateQueries({ queryKey: ['detections'] });
      refreshStats();
    },
  });

  return {
    analyses: analysesQuery.data || [],
    isLoading: analysesQuery.isLoading,
    isError: analysesQuery.isError,
    error: analysesQuery.error,
    refetch: analysesQuery.refetch,
    createAnalysis: createAnalysisMutation.mutateAsync,
    isCreating: createAnalysisMutation.isPending,
    deleteAnalysis: deleteAnalysisMutation.mutateAsync,
    isDeleting: deleteAnalysisMutation.isPending,
  };
}

export function useAnalysisDetail(id: string) {
  return useQuery({
    queryKey: ['analysis', id],
    queryFn: () => sonarApi.getAnalysisById(id),
    enabled: !!id,
  });
}
