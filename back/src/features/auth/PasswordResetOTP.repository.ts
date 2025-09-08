import pool from '../../shared/database/client';

export const PasswordResetOTPRepository = {
  async create(userId: number, otp: string, expiresAt: Date) {
    const res = await pool.query(
      'INSERT INTO password_reset_otps (user_id, otp, expires_at) VALUES ($1, $2, $3) RETURNING *',
      [userId, otp, expiresAt]
    );
    return res.rows[0];
  },

  async findLatestByUser(userId: number) {
    const res = await pool.query(
      'SELECT * FROM password_reset_otps WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1',
      [userId]
    );
    return res.rows[0] ?? null;
  },

  async deleteById(id: number) {
    await pool.query('DELETE FROM password_reset_otps WHERE id = $1', [id]);
  },
};
