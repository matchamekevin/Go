const express = require('express');
const jwt = require('jsonwebtoken');

// Simuler le middleware d'auth exactement comme dans notre code
const authMiddleware = (req, res, next) => {
  console.log(`🔐 Auth middleware called for: ${req.method} ${req.path}`);
  console.log(`🔐 Authorization header:`, req.headers.authorization);
  
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({ 
        success: false, 
        error: "Token d'authentification requis" 
      });
    }

    const token = authHeader.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        error: 'Format de token invalide' 
      });
    }

    // Vérifier et décoder le JWT (simulation)
    const payload = jwt.decode(token);
    
    if (!payload || !payload.id) {
      return res.status(401).json({ 
        success: false, 
        error: 'Token invalide' 
      });
    }

    // Attacher les données utilisateur à la requête
    req.user = {
      id: payload.id.toString(),
      email: payload.email,
      name: payload.name || 'Utilisateur',
      role: payload.role || 'user'
    };

    console.log(`🔐 User attached:`, req.user);
    next();
  } catch (error) {
    return res.status(401).json({ 
      success: false, 
      error: 'Token invalide ou expiré' 
    });
  }
};

// Simuler le controller purchase
const purchaseTicket = (req, res) => {
  console.log('=== DEBUG PURCHASE ===');
  console.log('req.user:', req.user);
  console.log('userId original:', req.user?.id);
  console.log('userId après parseInt:', req.user?.id ? parseInt(req.user.id) : null);
  console.log('====================');

  res.json({
    success: true,
    message: 'Test local réussi!',
    user_id: req.user?.id ? parseInt(req.user.id) : null,
    user_data: req.user
  });
};

const app = express();
app.use(express.json());

// Test routes
app.post('/sotral/purchase', authMiddleware, purchaseTicket);
app.get('/sotral/debug-auth', authMiddleware, (req, res) => {
  res.json({
    success: true,
    message: 'Auth middleware works!',
    user: req.user,
    timestamp: new Date().toISOString()
  });
});

const PORT = 3333;
app.listen(PORT, () => {
  console.log(`🚀 Test server running on http://localhost:${PORT}`);
  console.log('Test avec: curl -X GET "http://localhost:3333/sotral/debug-auth" -H "Authorization: Bearer YOUR_TOKEN"');
});