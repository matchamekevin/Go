import pool from '../../shared/database/client';
import { User } from './User.model';

export const UserRepository = {
  async findByEmail(email: string): Promise<User | null> {
  const res = await pool.query('SELECT * FROM users WHERE email = $1 LIMIT 1', [email]);
  if (!res.rows[0]) return null;
  // Ajout du rôle par défaut si absent
  return { ...res.rows[0], role: res.rows[0].role || 'user' };
  },

  async findById(id: string): Promise<User | null> {
  const res = await pool.query('SELECT * FROM users WHERE id = $1 LIMIT 1', [parseInt(id)]);
  if (!res.rows[0]) return null;
  return { ...res.rows[0], role: res.rows[0].role || 'user' };
  },

  async create(data: { email: string; name: string; password: string; phone?: string; is_verified?: boolean }): Promise<User> {
    const res = await pool.query(
      'INSERT INTO users (email, name, password, phone, is_verified) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [data.email, data.name, data.password, data.phone || null, data.is_verified || false]
    );
    return res.rows[0];
  },

  async setVerified(id: string): Promise<void> {
    await pool.query('UPDATE users SET is_verified = true WHERE id = $1', [parseInt(id)]);
  },

  async updateProfile(id: string, data: { name?: string; phone?: string; email?: string }): Promise<Partial<User>> {
    const fields: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (data.name !== undefined) {
      fields.push(`name = $${idx++}`);
      values.push(data.name);
    }
    if (data.phone !== undefined) {
      fields.push(`phone = $${idx++}`);
      values.push(data.phone);
    }
    if (data.email !== undefined) {
      fields.push(`email = $${idx++}`);
      values.push(data.email);
    }

    if (fields.length === 0) return {};

    values.push(parseInt(id));
    const query = `UPDATE users SET ${fields.join(', ')} WHERE id = $${idx} RETURNING id, email, name, phone, is_verified`;
    const res = await pool.query(query, values);
    return res.rows[0];
  }
};
