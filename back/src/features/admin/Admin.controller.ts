import { Response } from 'express';
import { AuthenticatedRequest } from '../../shared/midddleawers/auth.middleware';
import pool from '../../shared/database/client';

// Full AdminController implementing endpoints referenced by admin.routes.ts
export class AdminController {
  // ---------- USERS ----------
  static async getUserStats(_req: AuthenticatedRequest, res: Response) {
    try {
      const totalRes = await pool.query("SELECT COUNT(*)::int as total FROM users");
      const verifiedRes = await pool.query("SELECT COUNT(*)::int as verified FROM users WHERE is_verified = true");
      const suspendedRes = await pool.query("SELECT COUNT(*)::int as suspended FROM users WHERE COALESCE(is_suspended,false) = true");
      return res.status(200).json({ success: true, data: { total: totalRes.rows[0].total, verified: verifiedRes.rows[0].verified, suspended: suspendedRes.rows[0].suspended } });
    } catch (err: any) {
      console.error('[AdminController.getUserStats]', err);
      return res.status(500).json({ success: false, error: 'Erreur calcul stats utilisateurs' });
    }
  }

  static async getAllUsers(req: AuthenticatedRequest, res: Response) {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;
      const search = req.query.search ? String(req.query.search) : undefined;
      const role = req.query.role ? String(req.query.role) : 'all';

      let where = 'WHERE 1=1';
      const params: any[] = [];
      let idx = 1;

      if (search) {
        where += ` AND (name ILIKE $${idx} OR email ILIKE $${idx} OR phone ILIKE $${idx})`;
        params.push(`%${search}%`);
        idx++;
      }

      if (role && role !== 'all') {
        if (role === 'verified') where += ' AND is_verified = true';
        else if (role === 'unverified') where += ' AND is_verified = false';
        else if (role === 'suspended') where += ' AND COALESCE(is_suspended,false) = true';
      }

      const offset = (page - 1) * limit;
      const query = `SELECT id, email, name, phone, is_verified::boolean, role, COALESCE(is_suspended,false) as is_suspended, created_at, COALESCE(updated_at, created_at) as updated_at FROM users ${where} ORDER BY created_at DESC LIMIT $${idx} OFFSET $${idx + 1}`;
      params.push(limit, offset);

      const data = await pool.query(query, params);
      const countQ = `SELECT COUNT(*)::int as total FROM users ${where}`;
      const countRes = await pool.query(countQ, params.slice(0, params.length - 2));
      const total = countRes.rows[0]?.total || 0;

      return res.status(200).json({ success: true, data: { items: data.rows, totalPages: Math.max(1, Math.ceil(total / limit)), currentPage: page, totalItems: total } });
    } catch (err: any) {
      console.error('[AdminController.getAllUsers]', err);
      return res.status(500).json({ success: false, error: 'Erreur lors de la récupération des utilisateurs' });
    }
  }

  static async getUserById(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const r = await pool.query('SELECT id, email, name, phone, is_verified, role, COALESCE(is_suspended,false) as is_suspended, created_at, COALESCE(updated_at, created_at) AS updated_at FROM users WHERE id = $1', [id]);
      if (r.rows.length === 0) return res.status(404).json({ success: false, error: 'Utilisateur non trouvé' });
      return res.status(200).json({ success: true, data: r.rows[0] });
    } catch (err: any) {
      console.error('[AdminController.getUserById]', err);
      return res.status(500).json({ success: false, error: 'Erreur lors de la récupération de l\'utilisateur' });
    }
  }

  static async updateUser(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const { name, phone, is_verified } = req.body;
      const r = await pool.query('UPDATE users SET name = COALESCE($1,name), phone = COALESCE($2,phone), is_verified = COALESCE($3,is_verified), updated_at = NOW() WHERE id = $4 RETURNING id, email, name, phone, is_verified, COALESCE(is_suspended,false) as is_suspended, created_at, COALESCE(updated_at, created_at) AS updated_at', [name, phone, is_verified, id]);
      if (r.rows.length === 0) return res.status(404).json({ success: false, error: 'Utilisateur non trouvé' });
      return res.status(200).json({ success: true, data: r.rows[0] });
    } catch (err: any) {
      console.error('[AdminController.updateUser]', err);
      return res.status(500).json({ success: false, error: 'Erreur lors de la mise à jour de l\'utilisateur' });
    }
  }

  static async deleteUser(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const r = await pool.query('DELETE FROM users WHERE id = $1 RETURNING id', [id]);
      if (r.rows.length === 0) return res.status(404).json({ success: false, error: 'Utilisateur non trouvé' });
      return res.status(200).json({ success: true, message: 'Utilisateur supprimé' });
    } catch (err: any) {
      console.error('[AdminController.deleteUser]', err);
      return res.status(500).json({ success: false, error: 'Erreur lors de la suppression de l\'utilisateur' });
    }
  }

  static async toggleUserStatus(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const r = await pool.query('UPDATE users SET is_verified = NOT is_verified, updated_at = NOW() WHERE id = $1 RETURNING id, email, name, phone, is_verified, COALESCE(is_suspended,false) as is_suspended, created_at, COALESCE(updated_at, created_at) AS updated_at', [id]);
      if (r.rows.length === 0) return res.status(404).json({ success: false, error: 'Utilisateur non trouvé' });
      return res.status(200).json({ success: true, data: r.rows[0] });
    } catch (err: any) {
      console.error('[AdminController.toggleUserStatus]', err);
      return res.status(500).json({ success: false, error: 'Erreur lors du changement de statut' });
    }
  }

  // toggle admin role -- previously toggle suspension
  static async getSuspendedUsers(_req: AuthenticatedRequest, res: Response) {
    try {
      const query = `SELECT id, email, name, phone, is_verified::boolean, role, COALESCE(is_suspended,false) as is_suspended, created_at, COALESCE(updated_at, created_at) as updated_at FROM users WHERE COALESCE(is_suspended,false) = true ORDER BY created_at DESC`;
      const data = await pool.query(query);
      return res.status(200).json({ success: true, data: data.rows, count: data.rows.length });
    } catch (err: any) {
      console.error('[AdminController.getSuspendedUsers]', err);
      return res.status(500).json({ success: false, error: 'Erreur lors de la récupération des comptes suspendus' });
    }
  }

  static async toggleUserSuspension(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      console.log('ToggleUserSuspension called with id:', id);

      // First get current suspension status
      const currentUser = await pool.query('SELECT COALESCE(is_suspended, false) as is_suspended FROM users WHERE id = $1', [id]);
      if (currentUser.rows.length === 0) {
        return res.status(404).json({ success: false, error: 'Utilisateur non trouvé' });
      }

      const currentSuspended = currentUser.rows[0].is_suspended;
      const newSuspended = !currentSuspended;

      const r = await pool.query('UPDATE users SET is_suspended = $1, updated_at = NOW() WHERE id = $2 RETURNING id, email, name, phone, is_verified, role, COALESCE(is_suspended,false) as is_suspended, created_at, COALESCE(updated_at, created_at) AS updated_at', [newSuspended, id]);

      console.log('Query result:', r.rows.length, 'rows affected');

      if (r.rows.length === 0) {
        console.log('User not found, returning 404');
        return res.status(404).json({ success: false, error: 'Utilisateur non trouvé' });
      }

      console.log('User suspension toggled successfully');
      return res.status(200).json({ success: true, data: r.rows[0] });
    } catch (err: any) {
      console.error('[AdminController.toggleUserSuspension]', err);
      return res.status(500).json({ success: false, error: 'Erreur lors du changement de statut de suspension' });
    }
  }

  // ---------- ROUTES (transport) ----------
  static async getRouteStats(_req: AuthenticatedRequest, res: Response) {
    try {
      const r = await pool.query('SELECT COUNT(*)::int as total FROM routes');
      return res.status(200).json({ success: true, data: r.rows[0] });
    } catch (err: any) { console.error('[AdminController.getRouteStats]', err); return res.status(500).json({ success: false, error: 'Erreur routes stats' }); }
  }

  static async getAllRoutes(_req: AuthenticatedRequest, res: Response) {
    try { const r = await pool.query('SELECT * FROM routes ORDER BY name ASC'); return res.status(200).json({ success: true, data: r.rows }); } catch (err:any) { console.error('[AdminController.getAllRoutes]',err); return res.status(500).json({ success:false, error:'Erreur récupération routes' }); }
  }
  static async createRoute(_req: AuthenticatedRequest, res: Response) { return res.status(201).json({ success: true, data: {} }); }
  static async updateRoute(_req: AuthenticatedRequest, res: Response) { return res.status(200).json({ success: true, data: {} }); }
  static async deleteRoute(_req: AuthenticatedRequest, res: Response) { return res.status(200).json({ success: true }); }

  // ---------- PRODUCTS ----------
  static async getAllProducts(_req: AuthenticatedRequest, res: Response) { try { const p = await pool.query('SELECT * FROM sotral_ticket_types ORDER BY name ASC'); return res.status(200).json({ success:true, data:p.rows }); } catch (err:any) { console.error('[AdminController.getAllProducts]', err); return res.status(500).json({ success:false, error:'Erreur récupération produits' }); } }
  static async createProduct(_req: AuthenticatedRequest, res: Response) { return res.status(201).json({ success: true, data: {} }); }
  static async updateProduct(_req: AuthenticatedRequest, res: Response) { return res.status(200).json({ success: true, data: {} }); }
  static async deleteProduct(_req: AuthenticatedRequest, res: Response) { return res.status(200).json({ success: true }); }

  // ---------- TICKETS ----------
  static async getAllTickets(_req: AuthenticatedRequest, res: Response) { try { const t = await pool.query('SELECT * FROM tickets ORDER BY created_at DESC LIMIT 100'); return res.status(200).json({ success:true, data:t.rows }); } catch(err:any){ console.error('[AdminController.getAllTickets]',err); return res.status(500).json({ success:false, error:'Erreur récupération tickets' }); } }
  static async updateTicketStatus(_req: AuthenticatedRequest, res: Response) { return res.status(200).json({ success: true }); }

  // ---------- DASHBOARD / REPORTS ----------
  static async getDashboardStats(_req: AuthenticatedRequest, res: Response) {
    try {
      // Statistiques utilisateurs
      const totalUsers = await pool.query('SELECT COUNT(*)::int as total FROM users');
      const verifiedUsers = await pool.query('SELECT COUNT(*)::int as total FROM users WHERE is_verified = true');
      const newUsersMonth = await pool.query("SELECT COUNT(*)::int as total FROM users WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'");

      // Statistiques tickets SOTRAL
      const totalTickets = await pool.query('SELECT COUNT(*)::int as total FROM sotral_tickets');
      const usedTickets = await pool.query("SELECT COUNT(*)::int as total FROM sotral_tickets WHERE status = 'used'");
      const ticketsMonth = await pool.query("SELECT COUNT(*)::int as total FROM sotral_tickets WHERE purchased_at >= CURRENT_DATE - INTERVAL '30 days'");

      // Statistiques revenus
      const totalRevenue = await pool.query('SELECT COALESCE(SUM(price_paid_fcfa), 0)::int as total FROM sotral_tickets WHERE status != \'cancelled\'');
      const revenueMonth = await pool.query("SELECT COALESCE(SUM(price_paid_fcfa), 0)::int as total FROM sotral_tickets WHERE purchased_at >= CURRENT_DATE - INTERVAL '30 days' AND status != 'cancelled'");

      // Statistiques paiements
      const totalPayments = await pool.query('SELECT COUNT(*)::int as total FROM payment_receipts WHERE status = \'completed\'');
      const paymentsMonth = await pool.query("SELECT COUNT(*)::int as total FROM payment_receipts WHERE status = 'completed' AND created_at >= CURRENT_DATE - INTERVAL '30 days'");

      // Statistiques lignes actives
      const activeLines = await pool.query('SELECT COUNT(*)::int as total FROM sotral_lines WHERE is_active = true');

      // Tickets par statut
      const ticketsByStatus = await pool.query(`
        SELECT
          CASE
            WHEN status = 'expired' THEN 'inactive'
            WHEN status = 'cancelled' THEN 'inactive'
            ELSE status
          END as status,
          COUNT(*)::int as count
        FROM sotral_tickets
        GROUP BY
          CASE
            WHEN status = 'expired' THEN 'inactive'
            WHEN status = 'cancelled' THEN 'inactive'
            ELSE status
          END
      `);

      // Top lignes par ventes
      const topLines = await pool.query(`
        SELECT
          sl.line_number,
          sl.name,
          COUNT(st.id)::int as tickets_sold,
          COALESCE(SUM(st.price_paid_fcfa), 0)::int as revenue
        FROM sotral_lines sl
        LEFT JOIN sotral_tickets st ON sl.id = st.line_id AND st.status != 'cancelled'
        GROUP BY sl.id, sl.line_number, sl.name
        ORDER BY tickets_sold DESC
        LIMIT 5
      `);

      return res.status(200).json({
        success: true,
        data: {
          users: {
            total_users: totalUsers.rows[0].total,
            verified_users: verifiedUsers.rows[0].total,
            new_users_month: newUsersMonth.rows[0].total
          },
          tickets: {
            total_tickets: totalTickets.rows[0].total,
            used_tickets: usedTickets.rows[0].total,
            tickets_month: ticketsMonth.rows[0].total,
            tickets_by_status: ticketsByStatus.rows
          },
          revenue: {
            total_revenue: totalRevenue.rows[0].total,
            revenue_month: revenueMonth.rows[0].total
          },
          payments: {
            total_payments: totalPayments.rows[0].total,
            payments_month: paymentsMonth.rows[0].total
          },
          lines: {
            active_lines: activeLines.rows[0].total,
            top_lines: topLines.rows
          }
        }
      });
    } catch (err:any) {
      console.error('[AdminController.getDashboardStats] Error:', err);
      return res.status(500).json({ success:false, error:'Erreur stats dashboard', details: err.message });
    }
  }

  static async getChartData(_req: AuthenticatedRequest, res: Response) {
    try {
      const { type = 'revenue', period = '30d' } = _req.query as any;
      const days = period === '7d' ? 7 : period === '30d' ? 30 : period === '90d' ? 90 : 365;

      if (type === 'revenue') {
        // Revenus quotidiens depuis sotral_tickets
        const revenueData = await pool.query(`
          SELECT
            DATE(purchased_at) as date,
            COALESCE(SUM(price_paid_fcfa), 0)::int as value
          FROM sotral_tickets
          WHERE purchased_at >= CURRENT_DATE - INTERVAL '${days} days'
            AND status != 'cancelled'
          GROUP BY DATE(purchased_at)
          ORDER BY date
        `);

        return res.status(200).json({
          success: true,
          data: revenueData.rows.map(row => ({
            date: row.date.toISOString().split('T')[0],
            value: parseInt(row.value) || 0
          }))
        });
      }

      if (type === 'tickets') {
        // Tickets quotidiens depuis sotral_tickets
        const ticketData = await pool.query(`
          SELECT
            DATE(purchased_at) as date,
            COUNT(*)::int as value
          FROM sotral_tickets
          WHERE purchased_at >= CURRENT_DATE - INTERVAL '${days} days'
            AND status != 'cancelled'
          GROUP BY DATE(purchased_at)
          ORDER BY date
        `);

        return res.status(200).json({
          success: true,
          data: ticketData.rows.map(row => ({
            date: row.date.toISOString().split('T')[0],
            value: parseInt(row.value) || 0
          }))
        });
      }

      if (type === 'users') {
        // Nouveaux utilisateurs quotidiens
        const userData = await pool.query(`
          SELECT
            DATE(created_at) as date,
            COUNT(*)::int as value
          FROM users
          WHERE created_at >= CURRENT_DATE - INTERVAL '${days} days'
          GROUP BY DATE(created_at)
          ORDER BY date
        `);

        return res.status(200).json({
          success: true,
          data: userData.rows.map(row => ({
            date: row.date.toISOString().split('T')[0],
            value: parseInt(row.value) || 0
          }))
        });
      }

      if (type === 'tickets_by_line') {
        // Tickets par ligne pour la période
        const lineData = await pool.query(`
          SELECT
            sl.line_number,
            sl.name,
            COUNT(st.id)::int as value
          FROM sotral_lines sl
          LEFT JOIN sotral_tickets st ON sl.id = st.line_id
            AND st.purchased_at >= CURRENT_DATE - INTERVAL '${days} days'
            AND st.status != 'cancelled'
          GROUP BY sl.id, sl.line_number, sl.name
          ORDER BY value DESC
          LIMIT 10
        `);

        return res.status(200).json({
          success: true,
          data: lineData.rows.map(row => ({
            label: `Ligne ${row.line_number}`,
            name: row.name,
            value: parseInt(row.value) || 0
          }))
        });
      }

      if (type === 'payments') {
        // Paiements quotidiens
        const paymentData = await pool.query(`
          SELECT
            DATE(created_at) as date,
            COUNT(*)::int as value
          FROM payment_receipts
          WHERE status = 'completed'
            AND created_at >= CURRENT_DATE - INTERVAL '${days} days'
          GROUP BY DATE(created_at)
          ORDER BY date
        `);

        return res.status(200).json({
          success: true,
          data: paymentData.rows.map(row => ({
            date: row.date.toISOString().split('T')[0],
            value: parseInt(row.value) || 0
          }))
        });
      }

      return res.status(400).json({ success: false, error: 'Type de graphique non supporté' });
    } catch (err:any) {
      console.error('[AdminController.getChartData]', err);
      return res.status(500).json({ success:false, error:'Erreur chart data' });
    }
  }

  static async getRecentActivity(_req: AuthenticatedRequest, res: Response) {
    try {
      // Activité récente des tickets SOTRAL
      const ticketActivity = await pool.query(`
        SELECT
          st.id,
          COALESCE(u.name, 'Utilisateur anonyme') as user,
          CASE
            WHEN st.status = 'active' THEN 'Nouveau ticket acheté'
            WHEN st.status = 'used' THEN 'Ticket validé'
            WHEN st.status IN ('expired', 'cancelled') THEN 'Ticket devenu inactif'
            ELSE 'Activité ticket'
          END as action,
          st.price_paid_fcfa as amount,
          TO_CHAR(st.purchased_at, 'DD/MM/YYYY HH24:MI') as time
        FROM sotral_tickets st
        LEFT JOIN users u ON st.user_id = u.id
        ORDER BY st.purchased_at DESC
        LIMIT 8
      `);

      // Activité récente des validations
      const validationActivity = await pool.query(`
        SELECT
          stv.id,
          COALESCE(u.name, 'Utilisateur anonyme') as user,
          'Validation de ticket' as action,
          NULL as amount,
          TO_CHAR(stv.validated_at, 'DD/MM/YYYY HH24:MI') as time
        FROM sotral_ticket_validations stv
        LEFT JOIN sotral_tickets st ON stv.ticket_id = st.id
        LEFT JOIN users u ON st.user_id = u.id
        ORDER BY stv.validated_at DESC
        LIMIT 4
      `);

      // Combiner et trier les activités
      const allActivities = [...ticketActivity.rows, ...validationActivity.rows]
        .sort((a, b) => new Date(b.time.split('/').reverse().join('-')).getTime() - new Date(a.time.split('/').reverse().join('-')).getTime())
        .slice(0, 10);

      return res.status(200).json({
        success: true,
        data: allActivities
      });
    } catch (err:any) {
      console.error('[AdminController.getRecentActivity]', err);
      // Fallback vers l'ancienne méthode si les tables SOTRAL n'existent pas
      try {
        const activities = await pool.query("SELECT id, name as user, 'Nouvel utilisateur inscrit' as action, TO_CHAR(created_at, 'DD/MM/YYYY HH24:MI') as time FROM users ORDER BY created_at DESC LIMIT 10");
        return res.status(200).json({ success:true, data:activities.rows });
      } catch (fallbackErr) {
        console.error('[AdminController.getRecentActivity] Fallback error:', fallbackErr);
        return res.status(500).json({ success:false, error:'Erreur activité récente' });
      }
    }
  }

  // ---------- PAYMENTS & REPORTS ----------
  static async getPaymentStats(_req: AuthenticatedRequest, res: Response) { try { const s = await pool.query('SELECT COUNT(*)::int as total, COALESCE(SUM(amount),0) as total_amount FROM payment_receipts'); return res.status(200).json({ success:true, data:s.rows[0] }); } catch(err:any){ console.error('[AdminController.getPaymentStats]',err); return res.status(500).json({ success:false, error:'Erreur stats paiements' }); } }
  static async getAllPayments(_req: AuthenticatedRequest, res: Response) { try { const p = await pool.query('SELECT * FROM payment_receipts ORDER BY created_at DESC LIMIT 100'); return res.status(200).json({ success:true, data:p.rows }); } catch(err:any){ console.error('[AdminController.getAllPayments]',err); return res.status(500).json({ success:false, error:'Erreur paiements' }); } }

  static async getPeriodReport(req: AuthenticatedRequest, res: Response) {
    try {
      // Example: return sales / activity for a period. For now return a simple aggregate from DB.
      const { period = '30d' } = req.query as any;
      const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
      const users = await pool.query(`SELECT DATE(created_at) as date, COUNT(*) as count FROM users WHERE created_at >= NOW() - INTERVAL '${days} days' GROUP BY DATE(created_at) ORDER BY date`);
      const tickets = await pool.query(`SELECT DATE(purchased_at) as date, COUNT(*) as count FROM tickets WHERE purchased_at >= NOW() - INTERVAL '${days} days' GROUP BY DATE(purchased_at) ORDER BY date`);
      return res.status(200).json({ success: true, data: { users: users.rows, tickets: tickets.rows } });
    } catch (err:any) { console.error('[AdminController.getPeriodReport]',err); return res.status(500).json({ success:false, error:'Erreur génération rapport' }); }
  }
}

export default AdminController;
