import { Request, Response, NextFunction } from 'express';
import { verifyJWT } from '../utils/auth.utils';

/**
 * Interface pour étendre Request avec les données utilisateur
 */
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    name?: string;
    role?: string;
  };
}

/**
 * Middleware d'authentification JWT
 * Vérifie le token Bearer et attache les données utilisateur à req.user
 */
export const authMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  console.log(`Auth middleware called for: ${req.method} ${req.path}`);
  
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

    // Vérifier et décoder le JWT
    const payload: any = verifyJWT(token);
    
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

    next();
  } catch (error) {
    return res.status(401).json({ 
      success: false, 
      error: 'Token invalide ou expiré' 
    });
  }
};