import { Router } from 'express';
import { realtimeService } from '../services/realtime.service';

const router = Router();

// Route pour les événements temps réel (Server-Sent Events)
router.get('/events', (req, res) => {
  const clientId = req.query.clientId as string || `client_${Date.now()}_${Math.random()}`;

  console.log(`🔄 Nouveau client SSE connecté: ${clientId}`);

  realtimeService.addClient(clientId, res);

  // Gérer la déconnexion
  req.on('close', () => {
    console.log(`🔌 Client SSE déconnecté: ${clientId}`);
  });
});

// Route pour tester la diffusion
router.post('/test-broadcast', (req, res) => {
  const { eventType, data } = req.body;

  realtimeService.broadcast(eventType || 'test', data || { message: 'Test broadcast' });

  res.json({
    success: true,
    message: 'Événement diffusé',
    clientsCount: realtimeService.getConnectedClientsCount()
  });
});

// Route pour obtenir le nombre de clients connectés
router.get('/clients-count', (req, res) => {
  res.json({
    connectedClients: realtimeService.getConnectedClientsCount()
  });
});

export default router;