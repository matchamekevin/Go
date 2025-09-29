import express, { Request, Response } from 'express';
import cors from 'cors';
import pool from './shared/database/client'; // Adjust the import path as necessary
import usersRoutes from './features/users/users.routes';
import paymentRoutes from './features/payment/payment.routes';
import ticketsRoutesSimple from './features/tickets/tickets.routes.simple';
import adminRoutes from './features/admin/admin.routes';
import adminTicketsRoutes from './features/admin/admin.tickets.routes';
import supportRoutes from './features/support/support.controller';
import { sotralRoutes } from './features/sotral/sotral.routes';
import adminSotralRoutes from './features/admin/admin.sotral.routes';
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
    origin: function (origin, callback) {
      // Autoriser les requêtes sans origine (comme les apps mobiles ou Postman)
      // et les origines localhost pour le développement
      const allowedOrigins = [
        'http://localhost:3000',  // Vite dev server par défaut
        'http://localhost:3001',  // Port alternatif
        'http://localhost:3002',  // Port alternatif
        'http://127.0.0.1:3000',
        'http://127.0.0.1:3001',
        'http://127.0.0.1:3002',
        'http://localhost:5173',  // Vite dev server moderne
        'http://127.0.0.1:5173',
        undefined  // Pour les requêtes sans origine (Postman, curl, etc.)
      ];

      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.log('🚫 CORS blocked origin:', origin);
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'Accept',
      'Origin',
      'Access-Control-Request-Method',
      'Access-Control-Request-Headers'
    ],
    exposedHeaders: ['Authorization'],
    optionsSuccessStatus: 200, // Pour les navigateurs anciens qui ne supportent pas 204
  })
);

// Middleware pour gérer manuellement les requêtes preflight si nécessaire
app.options('*', cors());


// Middleware de logging CORS pour déboguer
app.use((req, res, next) => {
  const origin = req.headers.origin;
  const method = req.method;
  const url = req.url;

  // Log des requêtes CORS importantes
  if (method === 'OPTIONS' || url.includes('/admin/')) {
    console.log(`🌐 CORS Request: ${method} ${url} from ${origin || 'no-origin'}`);
  }

  // Ajouter des headers CORS manuellement si nécessaire
  res.header('Access-Control-Allow-Origin', origin || '*');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin, Access-Control-Request-Method, Access-Control-Request-Headers');

  next();
});
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

// Compatibility helper for the mobile scan app: return recent scan history
app.get('/scan/history', async (req: Request, res: Response) => {
  try {
    // Return the most recent 50 validations (used tickets) in a simple shape
    const result = await pool.query(`
      SELECT id, code as ticket_code, status, used_at, user_id
      FROM tickets
      WHERE used_at IS NOT NULL
      ORDER BY used_at DESC
      LIMIT 50
    `);

    const rows = result.rows.map((r: any) => ({
      id: r.id,
      ticketCode: r.ticket_code,
      result: r.status === 'used' ? 'success' : 'failed',
      timestamp: r.used_at ? new Date(r.used_at).toISOString() : null,
      operatorId: r.user_id ? String(r.user_id) : null,
      message: ''
    }));

    return res.status(200).json({ success: true, data: rows });
  } catch (error) {
    console.error('[/scan/history] error:', error);
    return res.status(500).json({ success: false, error: 'Erreur lors de la récupération de l\'historique' });
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
app.use('/sotral', sotralRoutes);

// Mount specific admin feature routes first to avoid being shadowed by the generic /admin router
// (e.g. DELETE /admin/tickets must be handled by adminTicketsRoutes, not by adminRoutes which only
// registers GET/PATCH for /tickets and would otherwise return the Express HTML 404 "Cannot DELETE /admin/tickets").

// Mount the generic admin router after specific admin sub-routers
app.use('/admin/tickets', adminTicketsRoutes);
app.use('/admin/sotral', adminSotralRoutes);

// Route de test publique pour valider le déploiement et vérifier la disponibilité des routes
// Cette route doit être publique et définie avant le montage du routeur générique /admin
app.get('/admin/tickets/test', (req: Request, res: Response) => {
  res.json({ success: true, message: 'admin tickets test route active' });
});

// Mount the generic admin router after specific admin sub-routers
app.use('/admin', adminRoutes);
app.use('/support', supportRoutes);

// Route de test pour vérifier que les routes admin tickets sont bien exposées sur le serveur déployé
app.get('/admin/tickets/test', (req: Request, res: Response) => {
  res.json({ success: true, message: 'admin tickets test route active' });
});

// --- Admin JSON fallback --------------------------------------------------
// If a request targets /admin/* but no specific route handled it (e.g. method
// not allowed or missing in the deployed build), Express returns an HTML 404
// page. That breaks API clients expecting JSON. Provide a JSON fallback for
// all /admin paths so the frontend receives a predictable JSON error shape.
app.use('/admin', (req: Request, res: Response) => {
  res.status(404).json({ success: false, error: `Cannot ${req.method} ${req.originalUrl}` });
});

export default app;