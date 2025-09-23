import { useState, useCallback } from 'react';
import { adminSotralService } from '../../services/adminSotralService';
import { 
  TicketGenerationRequest, 
  BulkTicketGenerationRequest,
  TicketGenerationResult,
  BulkTicketGenerationResult,
  LoadingState 
} from '../../types/sotral';

export const useTicketGeneration = () => {
  const [generationState, setGenerationState] = useState<LoadingState>({
    isLoading: false,
    error: null
  });

  const generateTickets = useCallback(async (
    request: TicketGenerationRequest
  ): Promise<TicketGenerationResult | null> => {
    setGenerationState({ isLoading: true, error: null });
    
    try {
      const response = await adminSotralService.generateTickets(
        request.lineId,
        request.ticketTypeCode,
        request.quantity,
        request.validityHours
      );

      setGenerationState({ isLoading: false, error: null });
      
      return {
        success: true,
        generatedTickets: response.data || [],
        totalGenerated: response.data?.length || 0,
        message: `${response.data?.length || 0} tickets générés avec succès`
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors de la génération';
      setGenerationState({ isLoading: false, error: errorMessage });
      return null;
    }
  }, []);

  const generateBulkTickets = useCallback(async (
    request: BulkTicketGenerationRequest
  ): Promise<BulkTicketGenerationResult | null> => {
    setGenerationState({ isLoading: true, error: null });
    
    try {
      const response = await adminSotralService.generateBulkTickets(request.requests);

      setGenerationState({ isLoading: false, error: null });
      
      return {
        success: true,
        totalGenerated: response.data?.totalGenerated || 0,
        tickets: response.data?.tickets || [],
        lineBreakdown: response.data?.lineBreakdown || [],
        message: `${response.data?.totalGenerated || 0} tickets générés en lot avec succès`
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors de la génération en lot';
      setGenerationState({ isLoading: false, error: errorMessage });
      return null;
    }
  }, []);

  const clearError = useCallback(() => {
    setGenerationState(prev => ({ ...prev, error: null }));
  }, []);

  return {
    ...generationState,
    generateTickets,
    generateBulkTickets,
    clearError
  };
};