import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { linesService } from '../services/linesService';
import type { PaginatedResponse, ApiResponse, SotralLine, CreateLineRequest, UpdateLineRequest } from '../../../shared/types';

export const useLinesQueries = () => {
  const queryClient = useQueryClient();

  const useGetLines = () => {
    return useQuery({
      queryKey: ['lines'],
      queryFn: () => linesService.getAllLines(),
      select: (data: PaginatedResponse<SotralLine>) => data.success ? data.data : [],
    });
  };

  const useCreateLine = () => {
    return useMutation({
      mutationFn: (data: any) => linesService.createLine(data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['lines'] });
      },
    });
  };

  const useUpdateLine = () => {
    return useMutation({
      mutationFn: ({ id, data }: { id: number; data: any }) => linesService.updateLine(id, data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['lines'] });
      },
    });
  };

  const useDeleteLine = () => {
    return useMutation({
      mutationFn: (id: number) => linesService.deleteLine(id),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['lines'] });
      },
    });
  };

  return {
    useGetLines,
    useCreateLine,
    useUpdateLine,
    useDeleteLine,
  };
};