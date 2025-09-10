import nodemailer from 'nodemailer';
import { Config } from '../../enviroment/env.config';

let transporter: nodemailer.Transporter | null = null;

// Configuration plus robuste pour Gmail SMTP
if (Config.smtp.host && Config.smtp.user && Config.smtp.pass) {
	console.log('[Email Service] Configuration SMTP:', {
		host: Config.smtp.host,
		port: Config.smtp.port,
		user: Config.smtp.user,
		from: Config.smtp.from
	});
	
	transporter = nodemailer.createTransport({
		host: Config.smtp.host,
		port: Config.smtp.port || 587,
		secure: Config.smtp.port === 465, // true pour 465, false pour 587
		auth: {
			user: Config.smtp.user,
			pass: Config.smtp.pass
		},
		tls: {
			rejectUnauthorized: false // Pour éviter les erreurs SSL en dev
		}
	});
} else {
	console.warn('[Email Service] Configuration SMTP incomplète - emails en mode console uniquement');
}

export const sendEmail = async (to: string, subject: string, text: string, html?: string) => {
	console.log(`\n📧 [Email Service] Tentative d'envoi email à ${to}`);
	console.log(`📄 Sujet: ${subject}`);
	
	if (!transporter) {
		console.log(`\n🔧 [MODE CONSOLE] Email pour ${to}:`);
		console.log(`📋 Sujet: ${subject}`);
		console.log(`📝 Message: ${text}`);
		if (text.includes('code')) {
			// Extraire le code OTP du message
			const codeMatch = text.match(/\d{6}/);
			if (codeMatch) {
				console.log(`\n🎯 CODE OTP: ${codeMatch[0]}`);
				console.log(`🎯 CODE OTP: ${codeMatch[0]}`);
				console.log(`🎯 CODE OTP: ${codeMatch[0]}`);
			}
		}
		console.log('--- FIN EMAIL ---\n');
		return;
	}

	try {
		const result = await transporter.sendMail({
			from: Config.smtp.from,
			to,
			subject,
			text,
			html,
		});
		console.log(`✅ [Email Service] Email envoyé avec succès à ${to}:`, result.messageId);
		return result;
	} catch (error) {
		console.error(`❌ [Email Service] Erreur envoi email à ${to}:`, error);
		// En cas d'erreur, afficher en console pour les tests
		console.log(`\n🔧 [FALLBACK CONSOLE] Email pour ${to}:`);
		console.log(`📋 Sujet: ${subject}`);
		console.log(`📝 Message: ${text}`);
		if (text.includes('code')) {
			// Extraire le code OTP du message
			const codeMatch = text.match(/\d{6}/);
			if (codeMatch) {
				console.log(`\n🎯 CODE OTP: ${codeMatch[0]}`);
				console.log(`🎯 CODE OTP: ${codeMatch[0]}`);
				console.log(`🎯 CODE OTP: ${codeMatch[0]}`);
			}
		}
		console.log('--- FIN EMAIL ---\n');
		// Ne pas throw l'erreur pour que l'inscription continue
		return null;
	}
};
