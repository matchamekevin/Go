/**
 * Config global :
 * - Utilise DATABASE_URL si défini (prioritaire, recommandé en Docker Compose)
 * - Sinon construit dynamiquement à partir des DB_*
 * - DB_HOST doit être 'db' en Docker Compose, '127.0.0.1' en local
 */
export const Config = {
	port: process.env.PORT ? Number(process.env.PORT) : 3000,
	databaseUrl:
		process.env.DATABASE_URL ||
		(process.env.DB_USER && process.env.DB_PASSWORD && process.env.DB_HOST && process.env.DB_PORT && process.env.DB_NAME
			? `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`
			: ''),
	jwtSecret: process.env.JWT_SECRET || 'change_this_secret',
	pspWebhookSecret: process.env.PSP_WEBHOOK_SECRET || '',
	otpExpiryMinutes: process.env.OTP_EXPIRY_MINUTES ? Number(process.env.OTP_EXPIRY_MINUTES) : 15,
	smtp: {
		host: process.env.SMTP_HOST || '',
		port: process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : undefined,
		user: process.env.SMTP_USER || '',
		pass: process.env.SMTP_PASS || '',
		from: process.env.SMTP_FROM || 'no-reply@example.com',
	},
	// Admin credentials (optional): set ADMIN_EMAIL and ADMIN_PASSWORD in your .env for a simple admin login
	adminEmail: process.env.ADMIN_EMAIL || '',
	adminPassword: process.env.ADMIN_PASSWORD || '',
};
