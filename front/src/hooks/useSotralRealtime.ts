import { useEffect } from 'react';
import { useRealtime } from './useRealtime';

export interface SotralRealtimeEvent {
  type: 'line_created' | 'line_updated' | 'line_deleted' | 'ticket_type_created' | 'ticket_deleted';
  data: any;
  timestamp: string;
}

export interface UseSotralRealtimeOptions {
  baseUrl?: string;
  clientId?: string;
  onLineCreated?: (data: any) => void;
  onLineUpdated?: (data: any) => void;
  onLineDeleted?: (data: any) => void;
  onTicketTypeCreated?: (data: any) => void;
  onTicketDeleted?: (data: any) => void;
  onAnyEvent?: (event: SotralRealtimeEvent) => void;
}

export const useSotralRealtime = (options: UseSotralRealtimeOptions = {}) => {
  const {
    baseUrl,
    clientId,
    onLineCreated,
    onLineUpdated,
    onLineDeleted,
    onTicketTypeCreated,
    onTicketDeleted,
    onAnyEvent
  } = options;

  const { isConnected, lastEvent, connect, disconnect } = useRealtime({
    baseUrl,
    clientId
  });

  useEffect(() => {
    if (lastEvent) {
      const sotralEvent = lastEvent as SotralRealtimeEvent;

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
      }
    }
  }, [lastEvent, onLineCreated, onLineUpdated, onLineDeleted, onTicketTypeCreated, onTicketDeleted, onAnyEvent]);

  return {
    isConnected,
    lastEvent: lastEvent as SotralRealtimeEvent | null,
    connect,
    disconnect
  };
};