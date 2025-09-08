import express, { Request, Response } from 'express';
import cors from 'cors';

const app = express();
const PORT = 7001;

// Configuration CORS
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Authorization'],
}));

app.use(express.json());

// Données mockées pour le développement
const mockUsers = [
  {
    id: 1,
    name: 'Kevin Matcha',
    email: 'kevin@gosotral.com',
    phone: '+225 01 02 03 04 05',
    isVerified: true,
    role: 'user'
  }
];

const mockTickets = [
  {
    id: 1,
    userId: 1,
    from: 'Yopougon',
    to: 'Plateau',
    status: 'active',
    qrCode: 'TICKET-001-ACTIVE',
    price: 500,
    date: new Date().toISOString(),
    departureTime: '08:30',
    arrivalTime: '09:15'
  },
  {
    id: 2,
    userId: 1,
    from: 'Plateau',
    to: 'Cocody',
    status: 'used',
    qrCode: 'TICKET-002-USED',
    price: 400,
    date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    departureTime: '17:00',
    arrivalTime: '17:30'
  }
];

const mockRoutes = [
  {
    id: 1,
    from: 'Yopougon',
    to: 'Plateau',
    price: 500,
    duration: '45 min',
    distance: '15 km'
  },
  {
    id: 2,
    from: 'Plateau',
    to: 'Cocody',
    price: 400,
    duration: '30 min',
    distance: '12 km'
  },
  {
    id: 3,
    from: 'Adjamé',
    to: 'Port-Bouët',
    price: 600,
    duration: '55 min',
    distance: '20 km'
  }
];

// Routes d'authentification
app.post('/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  
  if (email === 'kevin@gosotral.com' && password === 'password123') {
    res.json({
      success: true,
      data: {
        token: 'mock-jwt-token-123456',
        user: mockUsers[0]
      }
    });
  } else {
    res.status(401).json({
      success: false,
      error: 'Email ou mot de passe incorrect'
    });
  }
});

app.post('/auth/register', (req: Request, res: Response) => {
  const { name, email, password, phone } = req.body;
  
  // Simulation d'inscription réussie
  res.json({
    success: true,
    data: {
      message: 'Inscription réussie. Vérifiez votre email pour activer votre compte.'
    }
  });
});

app.post('/auth/verify-otp', (req: Request, res: Response) => {
  const { email, otp } = req.body;
  
  if (otp === '123456') {
    res.json({
      success: true,
      data: {
        message: 'Compte vérifié avec succès'
      }
    });
  } else {
    res.status(400).json({
      success: false,
      error: 'Code OTP invalide'
    });
  }
});

app.post('/auth/resend-otp', (req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      message: 'Code OTP renvoyé'
    }
  });
});

app.post('/auth/forgot-password', (req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      message: 'Code de réinitialisation envoyé par email'
    }
  });
});

app.post('/auth/verify-reset-otp', (req: Request, res: Response) => {
  const { otp } = req.body;
  
  if (otp === '123456') {
    res.json({
      success: true,
      data: {
        message: 'Code vérifié'
      }
    });
  } else {
    res.status(400).json({
      success: false,
      error: 'Code invalide'
    });
  }
});

app.post('/auth/reset-password', (req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      message: 'Mot de passe réinitialisé avec succès'
    }
  });
});

// Routes utilisateur (nécessitent authentification)
app.get('/users/profile', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: 'Token manquant'
    });
  }
  
  res.json({
    success: true,
    data: mockUsers[0]
  });
});

app.put('/users/profile', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: 'Token manquant'
    });
  }
  
  const { name, phone } = req.body;
  const updatedUser = { ...mockUsers[0], name, phone };
  
  res.json({
    success: true,
    data: updatedUser
  });
});

// Routes tickets
app.get('/tickets', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: 'Token manquant'
    });
  }
  
  res.json({
    success: true,
    data: mockTickets
  });
});

app.post('/tickets/book', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: 'Token manquant'
    });
  }
  
  const { from, to, passengers, date } = req.body;
  
  const newTicket = {
    id: mockTickets.length + 1,
    userId: 1,
    from,
    to,
    status: 'active',
    qrCode: `TICKET-${String(mockTickets.length + 1).padStart(3, '0')}-ACTIVE`,
    price: 500,
    date: new Date().toISOString(),
    departureTime: '10:00',
    arrivalTime: '10:45'
  };
  
  mockTickets.push(newTicket);
  
  res.json({
    success: true,
    data: newTicket
  });
});

// Routes de transport
app.get('/transport/routes', (req: Request, res: Response) => {
  res.json({
    success: true,
    data: mockRoutes
  });
});

app.post('/transport/search', (req: Request, res: Response) => {
  const { from, to } = req.body;
  
  const results = mockRoutes.filter(route => 
    route.from.toLowerCase().includes(from?.toLowerCase() || '') &&
    route.to.toLowerCase().includes(to?.toLowerCase() || '')
  );
  
  res.json({
    success: true,
    data: results.length > 0 ? results : mockRoutes
  });
});

// Route de santé
app.get('/health', (req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      status: 'OK',
      message: 'API GoSOTRAL en fonctionnement',
      timestamp: new Date().toISOString()
    }
  });
});

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`🚀 Serveur backend GoSOTRAL démarré sur le port ${PORT}`);
  console.log(`📱 URL pour mobile: http://192.168.1.184:${PORT}`);
  console.log(`💻 URL pour web: http://localhost:${PORT}`);
  console.log(`✅ API Health: http://localhost:${PORT}/health`);
});

export default app;
