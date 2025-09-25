import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ticketsService } from '../services/ticketsService';
import type { PaginatedResponse, ApiResponse, SotralTicket } from '../../../shared/types';

export const useTicketsQueries = () => {
  const queryClient = useQueryClient();

  const useGetTickets = () => {
    return useQuery({
      queryKey: ['tickets'],
      queryFn: () => ticketsService.getAllTickets(),
      select: (data: PaginatedResponse<SotralTicket>) => data.success ? data.data : [],
    });
  };

  const useGetTicketStats = () => {
    return useQuery({
      queryKey: ['ticket-stats'],
      queryFn: () => ticketsService.getTicketStats(),
      select: (data: ApiResponse<any>) => data.success ? data.data : null,
    });
  };

  const useValidateTicket = () => {
    return useMutation({
      mutationFn: (ticketId: string) => {
        // Pour l'instant, on simule la validation
        return Promise.resolve({ success: true, data: null });
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['tickets'] });
        queryClient.invalidateQueries({ queryKey: ['ticket-stats'] });
      },
    });
  };

  const useGenerateTickets = () => {
    return useMutation({
      mutationFn: (params: { lineId: number; quantity: number }) => 
        ticketsService.generateTicketsForLine({
          lineId: params.lineId,
          ticketTypeCode: 'SIMPLE',
          quantity: params.quantity,
        }),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['tickets'] });
        queryClient.invalidateQueries({ queryKey: ['ticket-stats'] });
      },
    });
  };

  return {
    useGetTickets,
    useGetTicketStats,
    useValidateTicket,
    useGenerateTickets,
  };
};