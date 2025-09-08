import nodemailer from 'nodemailer';
import { Config } from '../../enviroment/env.config';

let transporter: nodemailer.Transporter | null = null;
if (Config.smtp.host && Config.smtp.port) {
	transporter = nodemailer.createTransport({
		host: Config.smtp.host,
		port: Config.smtp.port,
		secure: Config.smtp.port === 465,
		auth: Config.smtp.user ? { user: Config.smtp.user, pass: Config.smtp.pass } : undefined,
	});
}

export const sendEmail = async (to: string, subject: string, text: string, html?: string) => {
	if (!transporter) {
		console.log(`Sending email to ${to} - subject: ${subject}\n${text}`);
		return;
	}

	await transporter.sendMail({
		from: Config.smtp.from,
		to,
		subject,
		text,
		html,
	});
};
