import { Request, Response } from 'express';

export class DebugController {
  static async testPhoneLogin(req: Request, res: Response) {
    try {
      const { email, phone, password } = req.body;
      
      // Même logique que dans AuthController
      let identifier = email || phone;
      let isPhone = false;
      
      if (phone && !email) {
        isPhone = true;
      } else if (!phone && email) {
        isPhone = false;
      } else if (identifier) {
        isPhone = /^[\+]?[0-9\-\s\(\)]{8,15}$/.test(identifier) && !identifier.includes('@');
      }
      
      // Normalisation du téléphone comme dans AuthService
      const normalizePhone = (raw: string) => {
        if (!raw) return '';
        let s = raw.replace(/[^0-9+]/g, '');
        if (s.startsWith('00')) s = '+' + s.slice(2);
        if (s.startsWith('+228')) return s;
        if (s.startsWith('228')) return '+' + s;
        if (s.length === 8) return '+228' + s;
        return s;
      };
      
      const normalizedPhone = isPhone ? normalizePhone(identifier) : null;
      
      res.json({
        success: true,
        debug: {
          input: { email, phone, password: '***' },
          identifier,
          isPhone,
          normalizedPhone,
          timestamp: new Date().toISOString()
        }
      });
    } catch (err) {
      res.status(400).json({ success: false, error: (err as Error).message });
    }
  }
}