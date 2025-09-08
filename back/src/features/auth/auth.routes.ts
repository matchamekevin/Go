// Définition des routes d'authentification
import { Router } from 'express';
import { AuthController } from './Auth.controller';

const router = Router();

router.post('/register', AuthController.register);
router.post('/verify-otp', AuthController.verifyEmailOTP);
router.post('/resend-otp', AuthController.resendEmailOTP);
router.post('/login', AuthController.login);
router.post('/admin/login', AuthController.loginAdmin);
router.post('/forgot-password', AuthController.forgotPassword);
router.post('/verify-reset-otp', AuthController.verifyPasswordResetOTP);
router.post('/reset-password', AuthController.resetPassword);

export default router;
