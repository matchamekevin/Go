import express, { Request, Response } from 'express';
import pool from './shared/database/client';

const app = express();
app.use(express.json());

// Test de base
app.get('/test', (req, res) => {
  res.json({ message: 'Server basic test works!' });
});

app.get('/health', async (req: Request, res: Response) => {
  try {
    await pool.query('SELECT 1');
    res.status(200).json({ backend: 'ok', database: 'connected' });
  } catch (error) {
    res.status(500).json({ backend: 'ok', database: 'disconnected', error: (error as Error).message });
  }
});

// Maintenant essayons d'ajouter les routes une par une
try {
  console.log('Loading auth routes...');
  const authRoutes = require('./features/auth/auth.routes').default;
  app.use('/auth', authRoutes);
  console.log('Auth routes loaded successfully');
} catch (error) {
  console.error('Error loading auth routes:', error);
}

try {
  console.log('Loading users routes...');
  const usersRoutes = require('./features/users/users.routes').default;
  app.use('/users', usersRoutes);
  console.log('Users routes loaded successfully');
} catch (error) {
  console.error('Error loading users routes:', error);
}

try {
  console.log('Loading transport routes...');
  const transportRoutes = require('./features/transport/transport.routes').default;
  app.use('/transport', transportRoutes);
  console.log('Transport routes loaded successfully');
} catch (error) {
  console.error('Error loading transport routes:', error);
}

try {
  console.log('Loading tickets simple routes...');
  const ticketsRoutesSimple = require('./features/tickets/tickets.routes.simple').default;
  app.use('/tickets', ticketsRoutesSimple);
  console.log('Tickets simple routes loaded successfully');
} catch (error) {
  console.error('Error loading tickets simple routes:', error);
}

export default app;
