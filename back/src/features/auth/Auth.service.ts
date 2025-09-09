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
      // Reasonable assumption for operator prefixes (YAS / MOOV commonly use 90-99 range)
      // We'll accept prefixes between 90 and 99 as mobile operators for this project.
      const prefix = local.slice(0, 2);
      const allowed = ['90','91','92','93','94','95','96','97','98','99'];
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

    // send email
    await sendEmail(user.email, 'Vérifiez votre compte', `Votre code de vérification est : ${otp}`);

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
    await sendEmail(user.email, 'Nouveau code de vérification', `Votre nouveau code est : ${otp}`);
    return { message: 'OTP renvoyé' };
  }

  static async login(email: string, password: string) {
    const user = await UserRepository.findByEmail(email);
    if (!user) throw new Error('Utilisateur introuvable');
    const ok = await comparePassword(password, user.password);
    if (!ok) throw new Error('Mot de passe invalide');
    if (!user.is_verified) throw new Error('Compte non vérifié');

  const token = generateJWT({ id: user.id, email: user.email, name: user.name, role: user.role || 'user' });
  return { token, user: { id: user.id, email: user.email, name: user.name, role: user.role || 'user' } };
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
    await sendEmail(user.email, 'OTP de réinitialisation', `Votre code de réinitialisation est : ${otp}`);
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

