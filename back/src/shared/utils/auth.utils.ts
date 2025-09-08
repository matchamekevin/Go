import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Config } from '../../enviroment/env.config';

export const hashPassword = async (password: string) => {
	const salt = await bcrypt.genSalt(10);
	return bcrypt.hash(password, salt);
};

export const comparePassword = async (password: string, hash: string) => {
	return bcrypt.compare(password, hash);
};

export const generateJWT = (payload: object, expiresIn = '7d') => {
	return jwt.sign(payload as any, Config.jwtSecret as jwt.Secret, { expiresIn } as jwt.SignOptions);
};

export const verifyJWT = (token: string) => {
	return jwt.verify(token, Config.jwtSecret);
};

export const generateOTP = (length = 6) => {
	const digits = '0123456789';
	let otp = '';
	for (let i = 0; i < length; i++) otp += digits[Math.floor(Math.random() * digits.length)];
	return otp;
};
