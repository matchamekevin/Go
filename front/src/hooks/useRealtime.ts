import { useEffect, useState } from 'react';
import { realtimeService, RealtimeEvent } from '../services/realtime.service';

export interface UseRealtimeOptions {
  baseUrl?: string;
  clientId?: string;
  autoConnect?: boolean;
}

export const useRealtime = (options: UseRealtimeOptions = {}) => {
  const { baseUrl = '', clientId = 'mobile_app', autoConnect = true } = options;
  const [isConnected, setIsConnected] = useState(false);
  const [lastEvent, setLastEvent] = useState<RealtimeEvent | null>(null);

  useEffect(() => {
    // Configurer le service avec l'URL de base
    if (baseUrl) {
      (realtimeService as any).baseUrl = baseUrl;
    }

    // Configurer les callbacks
    realtimeService.onConnected(() => {
      console.log('📱 [Mobile] Connected to realtime service');
      setIsConnected(true);
    });

    realtimeService.onDisconnected(() => {
      console.log('📱 [Mobile] Disconnected from realtime service');
      setIsConnected(false);
    });

    realtimeService.onError((error) => {
      console.error('📱 [Mobile] Realtime service error:', error);
      setIsConnected(false);
    });

    realtimeService.onEvent((event: RealtimeEvent) => {
      console.log('📱 [Mobile] Received realtime event:', event);
      setLastEvent(event);
    });

    // Connexion automatique
    if (autoConnect) {
      realtimeService.connect(clientId);
    }

    // Cleanup
    return () => {
      realtimeService.disconnect();
    };
  }, [baseUrl, clientId, autoConnect]);

  return {
    isConnected,
    lastEvent,
    connect: () => realtimeService.connect(clientId),
    disconnect: () => realtimeService.disconnect(),
  };
};