import { Request, Response } from 'express';

interface Client {
  id: string;
  res: Response;
}

class RealtimeService {
  private clients: Map<string, Client> = new Map();

  // Ajouter un client pour les événements temps réel
  addClient(clientId: string, res: Response): void {
    const client: Client = { id: clientId, res };

    // Configurer les headers pour Server-Sent Events
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control',
    });

    // Envoyer un message de connexion
    res.write(`data: ${JSON.stringify({ type: 'connected', clientId })}\n\n`);

    this.clients.set(clientId, client);

    // Supprimer le client quand la connexion se ferme
    res.on('close', () => {
      this.clients.delete(clientId);
    });
  }

  // Diffuser un événement à tous les clients
  broadcast(eventType: string, data: any): void {
    const eventData = JSON.stringify({
      type: eventType,
      data,
      timestamp: new Date().toISOString()
    });

    this.clients.forEach((client) => {
      try {
        client.res.write(`data: ${eventData}\n\n`);
      } catch (error) {
        // Client déconnecté, supprimer
        this.clients.delete(client.id);
      }
    });
  }

  // Diffuser un événement à un client spécifique
  sendToClient(clientId: string, eventType: string, data: any): void {
    const client = this.clients.get(clientId);
    if (client) {
      try {
        const eventData = JSON.stringify({
          type: eventType,
          data,
          timestamp: new Date().toISOString()
        });
        client.res.write(`data: ${eventData}\n\n`);
      } catch (error) {
        this.clients.delete(clientId);
      }
    }
  }

  // Obtenir le nombre de clients connectés
  getConnectedClientsCount(): number {
    return this.clients.size;
  }
}

// Instance singleton
export const realtimeService = new RealtimeService();