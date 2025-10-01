export interface RealtimeEvent {
  type: string;
  data: any;
  timestamp: string;
}

export type RealtimeEventCallback = (event: RealtimeEvent) => void;
export type ConnectionCallback = () => void;
export type ErrorCallback = (error: any) => void;

export class RealtimeService {
  private eventSource: EventSource | null = null;
  private reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
  private isConnected = false;
  private baseUrl: string;

  // Callbacks
  private onEventCallback?: RealtimeEventCallback;
  private onConnectedCallback?: ConnectionCallback;
  private onDisconnectedCallback?: ConnectionCallback;
  private onErrorCallback?: ErrorCallback;

  constructor(baseUrl: string = '') {
    this.baseUrl = baseUrl;
  }

  // Enregistrer les callbacks
  onEvent(callback: RealtimeEventCallback): void {
    this.onEventCallback = callback;
  }

  onConnected(callback: ConnectionCallback): void {
    this.onConnectedCallback = callback;
  }

  onDisconnected(callback: ConnectionCallback): void {
    this.onDisconnectedCallback = callback;
  }

  onError(callback: ErrorCallback): void {
    this.onErrorCallback = callback;
  }

  connect(clientId?: string): void {
    if (this.eventSource) {
      this.eventSource.close();
    }

    const url = `${this.baseUrl}/realtime/events${clientId ? `?clientId=${clientId}` : ''}`;
    console.log('🔄 [Mobile] Connecting to realtime service:', url);

    try {
      this.eventSource = new EventSource(url);

      this.eventSource.onopen = () => {
        console.log('✅ [Mobile] Connected to realtime service');
        this.isConnected = true;
        this.onConnectedCallback?.();
      };

      this.eventSource.onmessage = (event) => {
        try {
          const data: RealtimeEvent = JSON.parse(event.data);
          console.log('📡 [Mobile] Received realtime event:', data);
          this.onEventCallback?.(data);
        } catch (error) {
          console.error('❌ [Mobile] Error parsing realtime event:', error);
        }
      };

      this.eventSource.onerror = (error) => {
        console.error('❌ [Mobile] Realtime service error:', error);
        this.isConnected = false;
        this.onDisconnectedCallback?.();
        this.onErrorCallback?.(error);

        // Tentative de reconnexion après 5 secondes
        if (this.reconnectTimeout) {
          clearTimeout(this.reconnectTimeout);
        }

        this.reconnectTimeout = setTimeout(() => {
          console.log('🔄 [Mobile] Attempting to reconnect to realtime service...');
          this.connect(clientId);
        }, 5000);
      };
    } catch (error) {
      console.error('❌ [Mobile] Failed to create EventSource:', error);
      this.onErrorCallback?.(error);
    }
  }

  disconnect(): void {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    this.isConnected = false;
    this.onDisconnectedCallback?.();
  }

  getIsConnected(): boolean {
    return this.isConnected;
  }
}

// Instance singleton pour l'app mobile
export const realtimeService = new RealtimeService();