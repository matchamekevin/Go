import express, { Request, Response } from 'express';
import cors from 'cors';
import pool from './shared/database/client'; // Adjust the import path as necessary
import usersRoutes from './features/users/users.routes';
import paymentRoutes from './features/payment/payment.routes';
import ticketsRoutesSimple from './features/tickets/tickets.routes.simple';
import adminRoutes from './features/admin/admin.routes';
import { UserRepository } from './features/users/User.repository';
import { EmailOTPRepository } from './features/auth/EmailOTP.repository';
import { PasswordResetOTPRepository } from './features/auth/PasswordResetOTP.repository';
import authRoutes from './features/auth/auth.routes';
import { AuthController } from './features/auth/Auth.controller';

const app = express();
app.use(express.json());
// Autoriser les requêtes cross-origin (utile pour le développement mobile/web)
// Autoriser les requêtes cross-origin depuis l'interface admin (dev)
app.use(
  cors({
    origin: true, // Autoriser toutes les origines en développement
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['Authorization'],
  })
);


// Debug: afficher toutes les routes enregistrées
app.get('/debug-routes', (req, res) => {
  const routes: any[] = [];
  app._router.stack.forEach((middleware: any) => {
    if (middleware.route) {
      routes.push({
        path: middleware.route.path,
        methods: Object.keys(middleware.route.methods)
      });
    } else if (middleware.name === 'router') {
      middleware.handle.stack.forEach((handler: any) => {
        if (handler.route) {
          routes.push({
            path: handler.route.path,
            methods: Object.keys(handler.route.methods)
          });
        }
      });
    }
  });
  res.json({ routes });
});

// Mount dev-only routes to help development & testing (only when not in production)
if (process.env.NODE_ENV !== 'production') {
  // Fetch latest email verification OTP for a given email
  app.get('/_test/latest-email-otp', async (req: Request, res: Response) => {
    try {
      const email = (req.query.email as string) || '';
      if (!email) return res.status(400).json({ success: false, error: 'email is required' });
      const user = await UserRepository.findByEmail(email);
      if (!user) return res.status(404).json({ success: false, error: 'user not found' });
      const record = await EmailOTPRepository.findLatestByUser(user.id);
      if (!record) return res.status(404).json({ success: false, error: 'no otp found' });
      return res.json({ success: true, data: { otp: record.otp, expires_at: record.expires_at } });
    } catch (e) {
      return res.status(500).json({ success: false, error: (e as Error).message });
    }
  });

  // Fetch latest password reset OTP for a given email
  app.get('/_test/latest-password-otp', async (req: Request, res: Response) => {
    try {
      const email = (req.query.email as string) || '';
      if (!email) return res.status(400).json({ success: false, error: 'email is required' });
      const user = await UserRepository.findByEmail(email);
      if (!user) return res.status(404).json({ success: false, error: 'user not found' });
      const record = await PasswordResetOTPRepository.findLatestByUser(user.id);
      if (!record) return res.status(404).json({ success: false, error: 'no otp found' });
      return res.json({ success: true, data: { otp: record.otp, expires_at: record.expires_at } });
    } catch (e) {
      return res.status(500).json({ success: false, error: (e as Error).message });
    }
  });
}

app.get("/test-db", async (req: Request, res: Response) => {
  const result = await pool.query("SELECT NOW()");
  res.send(result.rows);
});
 
app.get('/yafoy', async (req: Request, res: Response) => {
  try {
    const result = await pool.query("SELECT 1");
    res.status(200).json(result.rows);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

app.get('/health', async (req: Request, res: Response) => {
  try {
    await pool.query('SELECT 1');
    res.status(200).json({ backend: 'ok', database: 'connected' });
  } catch (error) {
    res.status(500).json({ backend: 'ok', database: 'disconnected', error: (error as Error).message });
  }
});

// Bridge route: allow legacy /register (without /auth prefix) to ease manual testing
// POST /register will behave exactly like POST /auth/register
app.post('/register', (req: Request, res: Response) => AuthController.register(req, res));
app.get('/register', (req: Request, res: Response) => {
  res.status(405).json({ error: 'Utilisez POST pour créer un compte. Endpoint recommandé: POST /auth/register' });
});

// Mount feature routes
app.use('/auth', authRoutes);
app.use('/users', usersRoutes);
app.use('/payment', paymentRoutes);
app.use('/tickets', ticketsRoutesSimple);
app.use('/admin', adminRoutes);

export default app;