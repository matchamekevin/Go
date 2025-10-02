import { useEffect, useState, useCallback } from 'react';

export interface RealtimeEvent {
  type: string;
  data: any;
  timestamp: string;
}

export interface UseRealtimeOptions {
  baseUrl?: string;
  clientId?: string;
  autoConnect?: boolean;
  onEvent?: (event: RealtimeEvent) => void;
}

export const useRealtime = (options: UseRealtimeOptions = {}) => {
  const { baseUrl = '', clientId, autoConnect = true, onEvent } = options;

  const [isConnected, setIsConnected] = useState(false);
  const [lastEvent, setLastEvent] = useState<RealtimeEvent | null>(null);
  const [eventSource, setEventSource] = useState<EventSource | null>(null);

  const connect = useCallback(() => {
    if (eventSource) {
      eventSource.close();
    }

    const url = `${baseUrl}/realtime/events${clientId ? `?clientId=${clientId}` : ''}`;
    console.log('🔄 Connecting to realtime service:', url);

    const es = new EventSource(url);

    es.onopen = () => {
      console.log('✅ Connected to realtime service');
      setIsConnected(true);
    };

    es.onmessage = (event) => {
      try {
        const data: RealtimeEvent = JSON.parse(event.data);
        console.log('📡 Received realtime event:', data);
        setLastEvent(data);
        onEvent?.(data);
      } catch (error) {
        console.error('❌ Error parsing realtime event:', error);
      }
    };

    es.onerror = (error) => {
      console.error('❌ Realtime service error:', error);
      setIsConnected(false);
    };

    setEventSource(es);
  }, [baseUrl, clientId, onEvent]);

  const disconnect = useCallback(() => {
    if (eventSource) {
      eventSource.close();
      setEventSource(null);
    }
    setIsConnected(false);
    setLastEvent(null);
  }, [eventSource]);

  useEffect(() => {
    if (autoConnect) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [autoConnect, connect, disconnect]);

  return {
    connect,
    disconnect,
    isConnected,
    lastEvent,
    eventSource
  };
};