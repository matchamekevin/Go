import { useEffect, useRef, useState } from 'react';

export interface RealtimeEvent {
  type: string;
  data: any;
  timestamp: string;
}

export interface RealtimeService {
  connect: (clientId?: string) => void;
  disconnect: () => void;
  isConnected: boolean;
  lastEvent: RealtimeEvent | null;
}

export const useRealtimeService = (baseUrl: string = ''): RealtimeService => {
  const [isConnected, setIsConnected] = useState(false);
  const [lastEvent, setLastEvent] = useState<RealtimeEvent | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const connect = (clientId?: string) => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    const url = `${baseUrl}/realtime/events${clientId ? `?clientId=${clientId}` : ''}`;
    console.log('🔄 Connecting to realtime service:', url);

    const eventSource = new EventSource(url);
    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      console.log('✅ Connected to realtime service');
      setIsConnected(true);
    };

    eventSource.onmessage = (event) => {
      try {
        const data: RealtimeEvent = JSON.parse(event.data);
        console.log('📡 Received realtime event:', data);
        setLastEvent(data);
      } catch (error) {
        console.error('❌ Error parsing realtime event:', error);
      }
    };

    eventSource.onerror = (error) => {
      console.error('❌ Realtime service error:', error);
      setIsConnected(false);

      // Tentative de reconnexion après 5 secondes
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }

      reconnectTimeoutRef.current = setTimeout(() => {
        console.log('🔄 Attempting to reconnect to realtime service...');
        connect(clientId);
      }, 5000);
    };
  };

  const disconnect = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    setIsConnected(false);
    setLastEvent(null);
  };

  useEffect(() => {
    return () => {
      disconnect();
    };
  }, []);

  return {
    connect,
    disconnect,
    isConnected,
    lastEvent
  };
};