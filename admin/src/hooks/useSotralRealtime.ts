import { useEffect, useCallback } from 'react';
import { useRealtimeService, RealtimeEvent } from '../services/realtime.service';

export interface SotralRealtimeEvent extends RealtimeEvent {
  type: 'line_created' | 'line_updated' | 'line_deleted' | 'ticket_type_created' | 'ticket_deleted' | 'ticket_purchased' | 'ticket_validated' | 'sotral_ticket_purchased' | 'sotral_ticket_validated' | 'sotral_ticket_cancelled' | 'sotral_ticket_deleted';
  data: any;
}

export interface UseSotralRealtimeOptions {
  baseUrl?: string;
  clientId?: string;
  onLineCreated?: (data: any) => void;
  onLineUpdated?: (data: any) => void;
  onLineDeleted?: (data: any) => void;
  onTicketTypeCreated?: (data: any) => void;
  onTicketDeleted?: (data: any) => void;
  onTicketPurchased?: (data: any) => void;
  onTicketValidated?: (data: any) => void;
  onSotralTicketPurchased?: (data: any) => void;
  onSotralTicketValidated?: (data: any) => void;
  onSotralTicketCancelled?: (data: any) => void;
  onSotralTicketDeleted?: (data: any) => void;
  onAnyEvent?: (event: SotralRealtimeEvent) => void;
}

export const useSotralRealtime = (options: UseSotralRealtimeOptions = {}) => {
  const {
    baseUrl = '',
    clientId,
    onLineCreated,
    onLineUpdated,
    onLineDeleted,
    onTicketTypeCreated,
    onTicketDeleted,
    onTicketPurchased,
    onTicketValidated,
    onSotralTicketPurchased,
    onSotralTicketValidated,
    onSotralTicketCancelled,
    onSotralTicketDeleted,
    onAnyEvent
  } = options;

  const realtimeService = useRealtimeService(baseUrl);

  const handleEvent = useCallback((event: RealtimeEvent) => {
    const sotralEvent = event as SotralRealtimeEvent;

    // Appeler le callback générique si fourni
    onAnyEvent?.(sotralEvent);

    // Appeler les callbacks spécifiques selon le type d'événement
    switch (sotralEvent.type) {
      case 'line_created':
        onLineCreated?.(sotralEvent.data);
        break;
      case 'line_updated':
        onLineUpdated?.(sotralEvent.data);
        break;
      case 'line_deleted':
        onLineDeleted?.(sotralEvent.data);
        break;
      case 'ticket_type_created':
        onTicketTypeCreated?.(sotralEvent.data);
        break;
      case 'ticket_deleted':
        onTicketDeleted?.(sotralEvent.data);
        break;
      case 'ticket_purchased':
        onTicketPurchased?.(sotralEvent.data);
        break;
      case 'ticket_validated':
        onTicketValidated?.(sotralEvent.data);
        break;
      case 'sotral_ticket_purchased':
        onSotralTicketPurchased?.(sotralEvent.data);
        break;
      case 'sotral_ticket_validated':
        onSotralTicketValidated?.(sotralEvent.data);
        break;
      case 'sotral_ticket_cancelled':
        onSotralTicketCancelled?.(sotralEvent.data);
        break;
      case 'sotral_ticket_deleted':
        onSotralTicketDeleted?.(sotralEvent.data);
        break;
    }
  }, [onLineCreated, onLineUpdated, onLineDeleted, onTicketTypeCreated, onTicketDeleted, onTicketPurchased, onTicketValidated, onSotralTicketPurchased, onSotralTicketValidated, onSotralTicketCancelled, onSotralTicketDeleted, onAnyEvent]);

  useEffect(() => {
    if (realtimeService.lastEvent) {
      handleEvent(realtimeService.lastEvent);
    }
  }, [realtimeService.lastEvent, handleEvent]);

  const connect = useCallback(() => {
    realtimeService.connect(clientId);
  }, [realtimeService, clientId]);

  const disconnect = useCallback(() => {
    realtimeService.disconnect();
  }, [realtimeService]);

  return {
    connect,
    disconnect,
    isConnected: realtimeService.isConnected,
    lastEvent: realtimeService.lastEvent as SotralRealtimeEvent | null
  };
};