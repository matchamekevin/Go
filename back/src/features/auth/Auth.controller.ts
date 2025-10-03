import { Request, Response } from 'express';
import { AuthService } from './Auth.service';

export class AuthController {
  static async register(req: Request, res: Response) {
    try {
      const result = await AuthService.register(req.body);
      // Retour standardisé attendu par le frontend
      res.status(201).json({ success: true, data: result });
    } catch (err) {
      res.status(400).json({ success: false, error: (err as Error).message });
    }
  }

  static async verifyEmailOTP(req: Request, res: Response) {
    try {
      const { email, otp } = req.body;
      const result = await AuthService.verifyEmailOTP(email, otp);
  res.json({ success: true, data: result });
    } catch (err) {
  res.status(400).json({ success: false, error: (err as Error).message });
    }
  }

  static async resendEmailOTP(req: Request, res: Response) {
    try {
      const { email } = req.body;
      const result = await AuthService.resendEmailOTP(email);
  res.json({ success: true, data: result });
    } catch (err) {
  res.status(400).json({ success: false, error: (err as Error).message });
    }
  }

  static async login(req: Request, res: Response) {
    try {
      console.log('[AuthController.login] body:', req.body);
      const { email, phone, password } = req.body;
      
      // Accepter soit email soit phone
      const result = await AuthService.login(email || phone, password, !!phone);
      // Structure standardisée pour le frontend
      res.json({
        success: true,
        data: {
          token: result.token,
          user: {
            id: result.user.id,
            email: result.user.email,
            phone: result.user.phone,
            name: result.user.name,
            role: result.user.role || 'user'
          }
        }
      });
    } catch (err) {
      const message = (err as Error).message || 'Erreur lors de la connexion';
      console.error('[AuthController.login] error:', message);
      // Si l'erreur indique que le compte n'est pas vérifié, renvoyer un flag explicite
      if (message.toLowerCase().includes('compte non vérifié') || message.toLowerCase().includes('not verified')) {
        return res.status(401).json({ success: false, error: message, unverified: true, email: req.body?.email });
      }
      res.status(400).json({ success: false, error: message });
    }
  }

  static async loginAdmin(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      const result = await AuthService.loginAdmin(email, password);
      res.json({ success: true, data: result });
    } catch (err) {
      res.status(400).json({ success: false, error: (err as Error).message });
    }
  }

  static async forgotPassword(req: Request, res: Response) {
    try {
      const { email } = req.body;
      const result = await AuthService.forgotPassword(email);
  // Standard response shape
  res.json({ success: true, data: result });
    } catch (err) {
  res.status(400).json({ success: false, error: (err as Error).message });
    }
  }

  static async verifyPasswordResetOTP(req: Request, res: Response) {
    try {
      const { email, otp } = req.body;
      const result = await AuthService.verifyPasswordResetOTP(email, otp);
  res.json({ success: true, data: result });
    } catch (err) {
  res.status(400).json({ success: false, error: (err as Error).message });
    }
  }

  static async resetPassword(req: Request, res: Response) {
    try {
      const { email, otp, newPassword } = req.body;
      const result = await AuthService.resetPassword(email, otp, newPassword);
  res.json({ success: true, data: result });
    } catch (err) {
  res.status(400).json({ success: false, error: (err as Error).message });
    }
  }
}

