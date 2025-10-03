import { User } from '../users/User.model';
import { UserRepository } from '../users/User.repository';
import { EmailOTPRepository } from './EmailOTP.repository';
import { PasswordResetOTPRepository } from './PasswordResetOTP.repository';
import { hashPassword, comparePassword, generateOTP, generateJWT } from '../../shared/utils/auth.utils';
import pool from '../../shared/database/client';
import { sendEmail } from '../../shared/utils/email.service';
import { Config } from '../../enviroment/env.config';

export class AuthService {
  static async register(data: { email: string; name: string; password: string; phone: string }) {
    // Validation minimale des champs attendus
    if (!data || !data.email || !data.name || !data.password || !data.phone) {
      throw new Error('Champs manquants pour l\'inscription : email, name, password et phone sont requis');
    }

    // Normalize and validate Togolese phone number
    const normalizePhone = (raw: string) => {
      if (!raw) return '';
      // Remove spaces, dashes, parentheses
      let s = raw.replace(/[^0-9+]/g, '');
      // If starts with 00, convert to +
      if (s.startsWith('00')) s = '+' + s.slice(2);
      // If starts with +228, strip country code to keep local part
      if (s.startsWith('+228')) s = s.slice(4);
      // If starts with 228 (no plus) strip it
      if (s.startsWith('228')) s = s.slice(3);
      // Now s should be the local number (expected 8 digits)
      return s;
    };

    const isValidTgPhone = (local: string) => {
      // Expect exactly 8 digits for Togo
      if (!/^[0-9]{8}$/.test(local)) return false;
      // Élargi pour accepter plus de préfixes pendant les tests
      // Préfixes togolais courants : 70-79 (Togocel), 90-99 (Moov/YAS)
      const prefix = local.slice(0, 2);
      const allowed = ['70','71','72','73','74','75','76','77','78','79',
                       '90','91','92','93','94','95','96','97','98','99'];
      return allowed.includes(prefix);
    };

    const localPhone = normalizePhone(data.phone);
    if (!isValidTgPhone(localPhone)) {
      throw new Error('Numéro de téléphone invalide. Utilisez un numéro togolais (ex: +228 XX XX XX XX) pour YAS ou Moov.');
    }

    // Store normalized with country code in DB
    const storedPhone = '+228' + localPhone;

    const existing = await UserRepository.findByEmail(data.email);
    if (existing) throw new Error('Email déjà utilisé');

    const hashed = await hashPassword(data.password);
  // Normaliser le nom
  const name = data.name.trim();
  const user = await UserRepository.create({ email: data.email, name, password: hashed, phone: storedPhone, is_verified: false });

    // generate OTP
    const otp = generateOTP(6);
    const expiresAt = new Date(Date.now() + Config.otpExpiryMinutes * 60 * 1000);
    await EmailOTPRepository.create(user.id, otp, expiresAt);

    // Envoi d'email en arrière-plan (non-bloquant)
    const emailSubject = 'Votre code de vérification GoSOTRAL';
    const emailText = `Votre code de vérification est : ${otp}`;
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9fafb; padding: 20px;">
        <div style="background-color: white; border-radius: 10px; padding: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <!-- Header -->
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #4F46E5; margin: 0; font-size: 24px;">GoSOTRAL</h1>
            <p style="color: #6B7280; margin: 5px 0 0 0; font-size: 14px;">Système de transport public</p>
          </div>
          
          <!-- Content -->
          <div style="text-align: center;">
            <h2 style="color: #1F2937; margin-bottom: 15px;">Votre code de vérification</h2>
            <p style="color: #4B5563; font-size: 16px; margin-bottom: 25px;">
              Utilisez ce code pour vérifier votre compte :
            </p>
            
            <!-- Code OTP mis en évidence -->
            <div style="background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%); 
                        border-radius: 12px; 
                        padding: 25px; 
                        margin: 25px 0; 
                        box-shadow: 0 4px 15px rgba(79, 70, 229, 0.3);">
              <div style="color: white; 
                          font-size: 32px; 
                          font-weight: bold; 
                          letter-spacing: 8px; 
                          font-family: 'Courier New', monospace;
                          text-shadow: 0 2px 4px rgba(0,0,0,0.3);">${otp}</div>
            </div>
            
            <!-- Instructions -->
            <div style="background-color: #FEF3C7; 
                        border-left: 4px solid #F59E0B; 
                        padding: 15px; 
                        margin: 20px 0; 
                        border-radius: 5px;">
              <p style="color: #92400E; margin: 0; font-size: 14px;">
                ⚠️ Ce code expire dans 10 minutes pour votre sécurité
              </p>
            </div>
            
            <p style="color: #6B7280; font-size: 14px; margin-top: 25px;">
              Si vous n'avez pas demandé ce code, ignorez cet email.
            </p>
          </div>
          
          <!-- Footer -->
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #E5E7EB;">
            <p style="color: #9CA3AF; font-size: 12px; margin: 0;">
              © 2025 GoSOTRAL - Transport public du Togo
            </p>
          </div>
        </div>
      </div>
    `;

    // Envoi d'email asynchrone (non-bloquant)
    sendEmail(user.email, emailSubject, emailText, emailHtml).catch(error => {
      console.error(`[AuthService] Erreur envoi email pour ${user.email}:`, error);
      // L'erreur d'email n'empêche pas l'inscription de réussir
    });

    return { user: { id: user.id, email: user.email, name: user.name, phone: user.phone }, message: 'Utilisateur créé. Vérifiez votre email pour l OTP.' };
  }

  static async verifyEmailOTP(email: string, otp: string) {
    console.log('[AuthService.verifyEmailOTP] attempt for email:', email, 'otp:', otp);
    const user = await UserRepository.findByEmail(email);
    console.log('[AuthService.verifyEmailOTP] user found:', !!user, user ? { id: user.id, email: user.email, is_verified: user.is_verified } : null);
    if (!user) throw new Error('Utilisateur introuvable');

    const record = await EmailOTPRepository.findLatestByUser(user.id);
    console.log('[AuthService.verifyEmailOTP] latest OTP record:', !!record, record ? { id: record.id, otp: record.otp, expires_at: record.expires_at } : null);
    if (!record) throw new Error('Aucun OTP trouvé');
    if (record.expires_at < new Date()) throw new Error('OTP expiré');
    if (record.otp !== otp) {
      console.log('[AuthService.verifyEmailOTP] OTP mismatch: provided', otp, 'expected', record.otp);
      throw new Error('OTP invalide');
    }

    await UserRepository.setVerified(user.id.toString());
    await EmailOTPRepository.deleteById(record.id);
    console.log('[AuthService.verifyEmailOTP] user verified:', user.id);
    return { message: 'Compte vérifié' };
  }

  static async resendEmailOTP(email: string) {
    console.log('[AuthService.resendEmailOTP] attempt for email:', email);
    const user = await UserRepository.findByEmail(email);
    console.log('[AuthService.resendEmailOTP] user found:', !!user, user ? { id: user.id, email: user.email, is_verified: user.is_verified } : null);
    if (!user) throw new Error('Utilisateur introuvable');
    if (user.is_verified) {
      console.log('[AuthService.resendEmailOTP] user already verified:', user.id);
      throw new Error('Utilisateur déjà vérifié');
    }

    const otp = generateOTP(6);
    const expiresAt = new Date(Date.now() + Config.otpExpiryMinutes * 60 * 1000);
    const record = await EmailOTPRepository.create(user.id, otp, expiresAt);
    console.log('[AuthService.resendEmailOTP] created OTP record:', { id: record.id, otp, expiresAt });
    
    // Email de renvoi avec template HTML amélioré (envoi asynchrone)
    const emailSubject = 'Nouveau code de vérification GoSOTRAL';
    const emailText = `Votre nouveau code de vérification est : ${otp}`;
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9fafb; padding: 20px;">
        <div style="background-color: white; border-radius: 10px; padding: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <!-- Header -->
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #4F46E5; margin: 0; font-size: 24px;">GoSOTRAL</h1>
            <p style="color: #6B7280; margin: 5px 0 0 0; font-size: 14px;">Système de transport public</p>
          </div>
          
          <!-- Content -->
          <div style="text-align: center;">
            <h2 style="color: #1F2937; margin-bottom: 15px;">Nouveau code de vérification</h2>
            <p style="color: #4B5563; font-size: 16px; margin-bottom: 25px;">
              Voici votre nouveau code de vérification :
            </p>
            
            <!-- Code OTP mis en évidence -->
            <div style="background: linear-gradient(135deg, #059669 0%, #047857 100%); 
                        border-radius: 12px; 
                        padding: 25px; 
                        margin: 25px 0; 
                        box-shadow: 0 4px 15px rgba(5, 150, 105, 0.3);">
              <div style="color: white; 
                          font-size: 32px; 
                          font-weight: bold; 
                          letter-spacing: 8px; 
                          font-family: 'Courier New', monospace;
                          text-shadow: 0 2px 4px rgba(0,0,0,0.3);">${otp}</div>
            </div>
            
            <!-- Instructions -->
            <div style="background-color: #DBEAFE; 
                        border-left: 4px solid #3B82F6; 
                        padding: 15px; 
                        margin: 20px 0; 
                        border-radius: 5px;">
              <p style="color: #1E40AF; margin: 0; font-size: 14px;">
                🔄 Code renvoyé - Expire dans 10 minutes
              </p>
            </div>
            
            <p style="color: #6B7280; font-size: 14px; margin-top: 25px;">
              Si vous n'avez pas demandé ce code, ignorez cet email.
            </p>
          </div>
          
          <!-- Footer -->
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #E5E7EB;">
            <p style="color: #9CA3AF; font-size: 12px; margin: 0;">
              © 2025 GoSOTRAL - Transport public du Togo
            </p>
          </div>
        </div>
      </div>
    `;
    
    // Envoi d'email asynchrone (non-bloquant)
    sendEmail(user.email, emailSubject, emailText, emailHtml).catch(error => {
      console.error(`[AuthService.resendEmailOTP] Erreur envoi email pour ${user.email}:`, error);
    });
    
    return { message: 'OTP renvoyé' };
  }

  static async login(emailOrPhone: string, password: string, isPhone: boolean = false) {
    let user;
    
    if (isPhone) {
      // Normaliser le numéro de téléphone
      const normalizePhone = (raw: string) => {
        if (!raw) return '';
        let s = raw.replace(/[^0-9+]/g, '');
        if (s.startsWith('00')) s = '+' + s.slice(2);
        if (s.startsWith('+228')) return s;
        if (s.startsWith('228')) return '+' + s;
        if (s.length === 8) return '+228' + s;
        return s;
      };
      
      const normalizedPhone = normalizePhone(emailOrPhone);
      user = await UserRepository.findByPhone(normalizedPhone);
    } else {
      user = await UserRepository.findByEmail(emailOrPhone);
    }
    
    if (!user) throw new Error('Utilisateur introuvable');
    const ok = await comparePassword(password, user.password);
    if (!ok) throw new Error('Mot de passe invalide');
    // If user is suspended, block login explicitly
    if ((user as any).is_suspended) throw new Error('Compte suspendu');
    if (!user.is_verified) throw new Error('Compte non vérifié');

    const token = generateJWT({ 
      id: user.id, 
      email: user.email, 
      phone: user.phone,
      name: user.name, 
      role: user.role || 'user' 
    });
    return { 
      token, 
      user: { 
        id: user.id, 
        email: user.email, 
        phone: user.phone,
        name: user.name, 
        role: user.role || 'user' 
      } 
    };
  }

  /**
   * Simple admin login using credentials provided via environment variables.
   * If ADMIN_EMAIL and ADMIN_PASSWORD are set, this endpoint will authenticate
   * and return a JWT with role='admin'. This is a minimal implementation suitable
   * for initial admin access; consider a proper admin table for production.
   */
  static async loginAdmin(email: string, password: string) {
  // Read from env at call time to allow tests to set process.env dynamically
  const adminEmail = process.env.ADMIN_EMAIL || Config.adminEmail;
  const adminPassword = process.env.ADMIN_PASSWORD || Config.adminPassword;
  if (!adminEmail || !adminPassword) throw new Error('Admin credentials not configured');
  if (email !== adminEmail || password !== adminPassword) throw new Error('Invalid admin credentials');

  const token = generateJWT({ id: 'admin', email: adminEmail, role: 'admin' });
  return { token, user: { id: 'admin', email: adminEmail, name: 'Administrator', role: 'admin' } };
  }

  static async forgotPassword(email: string) {
    const user = await UserRepository.findByEmail(email);
    if (!user) throw new Error('Utilisateur introuvable');

    const otp = generateOTP(6);
    const expiresAt = new Date(Date.now() + Config.otpExpiryMinutes * 60 * 1000);
    await PasswordResetOTPRepository.create(user.id, otp, expiresAt);
    
    // Email de réinitialisation avec template HTML amélioré (envoi asynchrone)
    const emailSubject = 'Réinitialisation de mot de passe - GoSOTRAL';
    const emailText = `Votre code de réinitialisation est : ${otp}`;
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9fafb; padding: 20px;">
        <div style="background-color: white; border-radius: 10px; padding: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <!-- Header -->
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #4F46E5; margin: 0; font-size: 24px;">GoSOTRAL</h1>
            <p style="color: #6B7280; margin: 5px 0 0 0; font-size: 14px;">Système de transport public</p>
          </div>
          
          <!-- Content -->
          <div style="text-align: center;">
            <h2 style="color: #1F2937; margin-bottom: 15px;">🔐 Réinitialisation de mot de passe</h2>
            <p style="color: #4B5563; font-size: 16px; margin-bottom: 25px;">
              Utilisez ce code pour réinitialiser votre mot de passe :
            </p>
            
            <!-- Code OTP mis en évidence -->
            <div style="background: linear-gradient(135deg, #DC2626 0%, #B91C1C 100%); 
                        border-radius: 12px; 
                        padding: 25px; 
                        margin: 25px 0; 
                        box-shadow: 0 4px 15px rgba(220, 38, 38, 0.3);">
              <div style="color: white; 
                          font-size: 32px; 
                          font-weight: bold; 
                          letter-spacing: 8px; 
                          font-family: 'Courier New', monospace;
                          text-shadow: 0 2px 4px rgba(0,0,0,0.3);">${otp}</div>
            </div>
            
            <!-- Instructions -->
            <div style="background-color: #FEE2E2; 
                        border-left: 4px solid #EF4444; 
                        padding: 15px; 
                        margin: 20px 0; 
                        border-radius: 5px;">
              <p style="color: #DC2626; margin: 0; font-size: 14px;">
                🔒 Code de sécurité - Expire dans 10 minutes
              </p>
            </div>
            
            <p style="color: #6B7280; font-size: 14px; margin-top: 25px;">
              Si vous n'avez pas demandé cette réinitialisation, ignorez cet email et contactez-nous.
            </p>
          </div>
          
          <!-- Footer -->
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #E5E7EB;">
            <p style="color: #9CA3AF; font-size: 12px; margin: 0;">
              © 2025 GoSOTRAL - Transport public du Togo
            </p>
          </div>
        </div>
      </div>
    `;
    
    // Envoi d'email complètement asynchrone (non-bloquant) pour éviter les timeouts
    setImmediate(async () => {
      try {
        const emailSubject = 'Réinitialisation de mot de passe - GoSOTRAL';
        const emailText = `Votre code de réinitialisation est : ${otp}`;
        const emailHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9fafb; padding: 20px;">
            <div style="background-color: white; border-radius: 10px; padding: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
              <!-- Header -->
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #4F46E5; margin: 0; font-size: 24px;">GoSOTRAL</h1>
                <p style="color: #6B7280; margin: 5px 0 0 0; font-size: 14px;">Système de transport public</p>
              </div>
              
              <!-- Content -->
              <div style="text-align: center;">
                <h2 style="color: #1F2937; margin-bottom: 15px;">🔐 Réinitialisation de mot de passe</h2>
                <p style="color: #4B5563; font-size: 16px; margin-bottom: 25px;">
                  Utilisez ce code pour réinitialiser votre mot de passe :
                </p>
                
                <!-- Code OTP mis en évidence -->
                <div style="background: linear-gradient(135deg, #DC2626 0%, #B91C1C 100%); 
                            border-radius: 12px; 
                            padding: 25px; 
                            margin: 25px 0; 
                            box-shadow: 0 4px 15px rgba(220, 38, 38, 0.3);">
                  <div style="color: white; 
                              font-size: 32px; 
                              font-weight: bold; 
                              letter-spacing: 8px; 
                              font-family: 'Courier New', monospace;
                              text-shadow: 0 2px 4px rgba(0,0,0,0.3);">${otp}</div>
                </div>
                
                <!-- Instructions -->
                <div style="background-color: #FEE2E2; 
                            border-left: 4px solid #EF4444; 
                            padding: 15px; 
                            margin: 20px 0; 
                            border-radius: 5px;">
                  <p style="color: #DC2626; margin: 0; font-size: 14px;">
                    🔒 Code de sécurité - Expire dans 10 minutes
                  </p>
                </div>
                
                <p style="color: #6B7280; font-size: 14px; margin-top: 25px;">
                  Si vous n'avez pas demandé cette réinitialisation, ignorez cet email et contactez-nous.
                </p>
              </div>
              
              <!-- Footer -->
              <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #E5E7EB;">
                <p style="color: #9CA3AF; font-size: 12px; margin: 0;">
                  © 2025 GoSOTRAL - Transport public du Togo
                </p>
              </div>
            </div>
          </div>
        `;
        
        await sendEmail(user.email, emailSubject, emailText, emailHtml);
        console.log(`[AuthService.forgotPassword] Email envoyé avec succès à ${user.email}`);
      } catch (error) {
        console.error(`[AuthService.forgotPassword] Erreur envoi email pour ${user.email}:`, error);
      }
    });
    
    return { message: 'OTP envoyé pour réinitialisation' };
  }

  static async verifyPasswordResetOTP(email: string, otp: string) {
    const user = await UserRepository.findByEmail(email);
    if (!user) throw new Error('Utilisateur introuvable');

    const record = await PasswordResetOTPRepository.findLatestByUser(user.id);
    if (!record) throw new Error('Aucun OTP trouvé');
    if (record.expires_at < new Date()) throw new Error('OTP expiré');
    if (record.otp !== otp) throw new Error('OTP invalide');

    return { message: 'OTP validé' };
  }

  static async resetPassword(email: string, otp: string, newPassword: string) {
    const user = await UserRepository.findByEmail(email);
    if (!user) throw new Error('Utilisateur introuvable');

    const record = await PasswordResetOTPRepository.findLatestByUser(user.id);
    if (!record) throw new Error('Aucun OTP trouvé');
    if (record.expires_at < new Date()) throw new Error('OTP expiré');
    if (record.otp !== otp) throw new Error('OTP invalide');

    const hashed = await hashPassword(newPassword);
    await pool.query(`UPDATE users SET password = $1 WHERE id = $2`, [hashed, user.id]);
    await PasswordResetOTPRepository.deleteById(record.id);
    return { message: 'Mot de passe réinitialisé' };
  }
}

