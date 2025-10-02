import React, { useEffect, useState } from 'react';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { useSotralRealtime } from '../hooks/useSotralRealtime';
import toast from 'react-hot-toast';

interface RealtimeStatusProps {
  baseUrl?: string;
}

export const RealtimeStatus: React.FC<RealtimeStatusProps> = ({
  baseUrl = ''
}) => {
  const [events, setEvents] = useState<any[]>([]);

  const { connect, disconnect, isConnected } = useSotralRealtime({
    baseUrl,
    clientId: 'admin_dashboard',
    onLineCreated: (data) => {
      toast.success(`Nouvelle ligne créée: ${data.line?.name || 'Ligne'}`);
      console.log('📡 Line created:', data);
    },
    onLineUpdated: (data) => {
      toast.success(`Ligne mise à jour: ${data.line?.name || 'Ligne'}`);
      console.log('📡 Line updated:', data);
    },
    onLineDeleted: (data) => {
      toast.success('Ligne supprimée');
      console.log('📡 Line deleted:', data);
    },
    onTicketTypeCreated: (data) => {
      toast.success(`Nouveau type de ticket: ${data.ticketType?.name || 'Type'}`);
      console.log('📡 Ticket type created:', data);
    },
    onTicketDeleted: (data) => {
      toast.success('Ticket supprimé');
      console.log('📡 Ticket deleted:', data);
    },
    onAnyEvent: (event) => {
      // Ajouter l'événement à l'historique
      setEvents(prev => [event, ...prev.slice(0, 9)]); // Garder les 10 derniers
    }
  });

  useEffect(() => {
    // Connexion automatique au montage du composant
    connect();

    // Cleanup à la destruction
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  const handleReconnect = () => {
    disconnect();
    setTimeout(() => connect(), 1000);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          {isConnected ? (
            <Wifi className="w-5 h-5 text-green-500" />
          ) : (
            <WifiOff className="w-5 h-5 text-red-500" />
          )}
          <span className="font-medium text-gray-900">
            Synchronisation temps réel
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <span className={`text-sm px-2 py-1 rounded-full ${
            isConnected
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}>
            {isConnected ? 'Connecté' : 'Déconnecté'}
          </span>

          <button
            onClick={handleReconnect}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
            title="Reconnecter"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {events.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">Événements récents:</h4>
          <div className="max-h-32 overflow-y-auto space-y-1">
            {events.map((event, index) => (
              <div
                key={index}
                className="text-xs bg-gray-50 p-2 rounded border-l-2 border-blue-200"
              >
                <div className="flex justify-between items-start">
                  <span className="font-medium text-gray-800">
                    {event.type.replace('_', ' ').toUpperCase()}
                  </span>
                  <span className="text-gray-500">
                    {new Date(event.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <div className="text-gray-600 mt-1">
                  {event.type === 'line_created' && `Ligne: ${event.data.line?.name}`}
                  {event.type === 'line_updated' && `Ligne: ${event.data.line?.name}`}
                  {event.type === 'line_deleted' && `ID ligne: ${event.data.lineId}`}
                  {event.type === 'ticket_type_created' && `Type: ${event.data.ticketType?.name}`}
                  {event.type === 'ticket_deleted' && `ID ticket: ${event.data.ticketId}`}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!isConnected && (
        <div className="mt-2 text-sm text-amber-600 bg-amber-50 p-2 rounded">
          ⚠️ La synchronisation automatique est désactivée. Les changements ne seront pas visibles en temps réel.
        </div>
      )}
    </div>
  );
};