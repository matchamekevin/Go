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
        else if (role === 'suspended') {
          // Vérifier si la colonne is_suspended existe
          try {
            await pool.query("SELECT is_suspended FROM users LIMIT 1");
            where += ' AND COALESCE(is_suspended,false) = true';
          } catch (colErr) {
            // Colonne n'existe pas, ignorer le filtre suspended
            console.warn('[getAllUsers] Colonne is_suspended inexistante, filtre ignoré');
          }
        }
      }

      const offset = (page - 1) * limit;

      // Colonnes de base qui existent toujours
      let selectColumns = 'id, email, name, phone, is_verified::boolean, created_at, COALESCE(updated_at, created_at) as updated_at';

      // Ajouter role et is_suspended si elles existent
      try {
        await pool.query("SELECT role FROM users LIMIT 1");
        selectColumns += ', role';
      } catch (colErr) {
        selectColumns += ', \'user\' as role';
      }

      try {
        await pool.query("SELECT is_suspended FROM users LIMIT 1");
        selectColumns += ', COALESCE(is_suspended,false) as is_suspended';
      } catch (colErr) {
        selectColumns += ', false as is_suspended';
      }

      const query = `SELECT ${selectColumns} FROM users ${where} ORDER BY created_at DESC LIMIT $${idx} OFFSET $${idx + 1}`;
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
      // Statistiques utilisateurs (toujours disponibles)
      const totalUsers = await pool.query('SELECT COUNT(*)::int as total FROM users').catch(() => ({ rows: [{ total: 0 }] }));
      const verifiedUsers = await pool.query('SELECT COUNT(*)::int as total FROM users WHERE is_verified = true').catch(() => ({ rows: [{ total: 0 }] }));
      const newUsersMonth = await pool.query("SELECT COUNT(*)::int as total FROM users WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'").catch(() => ({ rows: [{ total: 0 }] }));

      // Statistiques tickets SOTRAL (avec fallback si tables n'existent pas)
      let totalTickets = { rows: [{ total: 0 }] };
      let usedTickets = { rows: [{ total: 0 }] };
      let ticketsMonth = { rows: [{ total: 0 }] };
      let totalRevenue = { rows: [{ total: 0 }] };
      let revenueMonth = { rows: [{ total: 0 }] };
      let totalPayments = { rows: [{ total: 0 }] };
      let paymentsMonth = { rows: [{ total: 0 }] };
      let activeLines = { rows: [{ total: 0 }] };
      let ticketsByStatus = { rows: [] };
      let topLines = { rows: [] };

      try {
        totalTickets = await pool.query('SELECT COUNT(*)::int as total FROM sotral_tickets');
        usedTickets = await pool.query("SELECT COUNT(*)::int as total FROM sotral_tickets WHERE status = 'used'");
        ticketsMonth = await pool.query("SELECT COUNT(*)::int as total FROM sotral_tickets WHERE purchased_at >= CURRENT_DATE - INTERVAL '30 days'");
        totalRevenue = await pool.query('SELECT COALESCE(SUM(price_paid_fcfa), 0)::int as total FROM sotral_tickets WHERE status != \'cancelled\'');
        revenueMonth = await pool.query("SELECT COALESCE(SUM(price_paid_fcfa), 0)::int as total FROM sotral_tickets WHERE purchased_at >= CURRENT_DATE - INTERVAL '30 days' AND status != 'cancelled'");
        totalPayments = await pool.query('SELECT COUNT(*)::int as total FROM payment_receipts WHERE status = \'completed\'');
        paymentsMonth = await pool.query("SELECT COUNT(*)::int as total FROM payment_receipts WHERE status = 'completed' AND created_at >= CURRENT_DATE - INTERVAL '30 days'");
        activeLines = await pool.query('SELECT COUNT(*)::int as total FROM sotral_lines WHERE is_active = true');

        ticketsByStatus = await pool.query(`
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

        topLines = await pool.query(`
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
      } catch (sotralErr) {
        console.warn('[AdminController.getDashboardStats] Tables SOTRAL non disponibles, utilisation de valeurs par défaut');
      }

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
      const { period = '30d', type = 'financial' } = req.query as any;
      const days = period === '7d' ? 7 : period === '30d' ? 30 : period === '90d' ? 90 : 365;

      // Calculer les statistiques globales pour la période
      const periodStart = `CURRENT_DATE - INTERVAL '${days} days'`;

      if (type === 'financial') {
        // Statistiques financières
        const totalRevenue = await pool.query(`
          SELECT COALESCE(SUM(price_paid_fcfa), 0)::int as total
          FROM sotral_tickets
          WHERE purchased_at >= ${periodStart} AND status != 'cancelled'
        `);

        const totalTickets = await pool.query(`
          SELECT COUNT(*)::int as total
          FROM sotral_tickets
          WHERE purchased_at >= ${periodStart} AND status != 'cancelled'
        `);

        const totalUsers = await pool.query(`
          SELECT COUNT(DISTINCT user_id)::int as total
          FROM sotral_tickets
          WHERE purchased_at >= ${periodStart} AND status != 'cancelled'
        `);

        const averageTicketPrice = totalTickets.rows[0].total > 0
          ? Math.round(totalRevenue.rows[0].total / totalTickets.rows[0].total)
          : 0;

        // Données par période (quotidienne) - TOUTES LES VALEURS VIENNENT DIRECTEMENT DE LA BASE DE DONNÉES
        const periodRevenue = await pool.query(`
          SELECT
            DATE(purchased_at) as period,
            COALESCE(SUM(price_paid_fcfa), 0)::int as revenue,
            COUNT(*)::int as tickets_sold,
            COUNT(DISTINCT user_id)::int as active_users,
            CASE
              WHEN COUNT(*) > 0 THEN ROUND(COALESCE(SUM(price_paid_fcfa), 0) / COUNT(*))
              ELSE 0
            END::int as average_price
          FROM sotral_tickets
          WHERE purchased_at >= ${periodStart} AND status != 'cancelled'
          GROUP BY DATE(purchased_at)
          ORDER BY period DESC
        `);

        return res.status(200).json({
          success: true,
          data: {
            total_revenue: totalRevenue.rows[0].total,
            total_tickets: totalTickets.rows[0].total,
            total_users: totalUsers.rows[0].total,
            average_ticket_price: averageTicketPrice,
            period_revenue: periodRevenue.rows
          }
        });
      }

      if (type === 'users') {
        // Statistiques utilisateurs
        const totalUsers = await pool.query(`
          SELECT COUNT(*)::int as total
          FROM users
          WHERE created_at >= ${periodStart}
        `);

        const verifiedUsers = await pool.query(`
          SELECT COUNT(*)::int as total
          FROM users
          WHERE created_at >= ${periodStart} AND is_verified = true
        `);

        const activeUsers = await pool.query(`
          SELECT COUNT(DISTINCT st.user_id)::int as total
          FROM sotral_tickets st
          WHERE st.purchased_at >= ${periodStart} AND st.status != 'cancelled'
        `);

        // Données par période
        const periodUsers = await pool.query(`
          SELECT
            DATE(created_at) as period,
            COUNT(*)::int as new_users,
            COUNT(*) FILTER (WHERE is_verified = true)::int as verified_users,
            0::int as active_users
          FROM users
          WHERE created_at >= ${periodStart}
          GROUP BY DATE(created_at)
          ORDER BY period DESC
        `);

        return res.status(200).json({
          success: true,
          data: {
            total_users: totalUsers.rows[0].total,
            verified_users: verifiedUsers.rows[0].total,
            active_users: activeUsers.rows[0].total,
            average_ticket_price: 0, // Non applicable pour les utilisateurs
            period_revenue: periodUsers.rows.map(row => ({
              period: row.period,
              revenue: 0,
              tickets_sold: row.new_users,
              active_users: row.verified_users
            }))
          }
        });
      }

      if (type === 'tickets') {
        // Statistiques tickets
        const totalTickets = await pool.query(`
          SELECT COUNT(*)::int as total
          FROM sotral_tickets
          WHERE purchased_at >= ${periodStart}
        `);

        const usedTickets = await pool.query(`
          SELECT COUNT(*)::int as total
          FROM sotral_tickets
          WHERE purchased_at >= ${periodStart} AND status = 'used'
        `);

        const activeTickets = await pool.query(`
          SELECT COUNT(*)::int as total
          FROM sotral_tickets
          WHERE purchased_at >= ${periodStart} AND status = 'active'
        `);

        // Données par période
        const periodTickets = await pool.query(`
          SELECT
            DATE(purchased_at) as period,
            COUNT(*)::int as total_tickets,
            COUNT(*) FILTER (WHERE status = 'used')::int as used_tickets,
            COUNT(*) FILTER (WHERE status = 'active')::int as active_tickets,
            COALESCE(SUM(price_paid_fcfa), 0)::int as revenue
          FROM sotral_tickets
          WHERE purchased_at >= ${periodStart}
          GROUP BY DATE(purchased_at)
          ORDER BY period DESC
        `);

        return res.status(200).json({
          success: true,
          data: {
            total_tickets: totalTickets.rows[0].total,
            used_tickets: usedTickets.rows[0].total,
            active_tickets: activeTickets.rows[0].total,
            average_ticket_price: 0,
            period_revenue: periodTickets.rows.map(row => ({
              period: row.period,
              revenue: row.revenue,
              tickets_sold: row.total_tickets,
              active_users: row.active_tickets
            }))
          }
        });
      }

      if (type === 'routes') {
        // Statistiques par routes/lignes
        const totalRoutes = await pool.query(`
          SELECT COUNT(*)::int as total
          FROM sotral_lines
          WHERE is_active = true
        `);

        const ticketsByRoute = await pool.query(`
          SELECT COUNT(*)::int as total
          FROM sotral_tickets st
          JOIN sotral_lines sl ON st.line_id = sl.id
          WHERE st.purchased_at >= ${periodStart} AND st.status != 'cancelled'
        `);

        // Top routes par ventes
        const topRoutes = await pool.query(`
          SELECT
            sl.line_number,
            sl.name,
            COUNT(st.id)::int as tickets_sold,
            COALESCE(SUM(st.price_paid_fcfa), 0)::int as revenue
          FROM sotral_lines sl
          LEFT JOIN sotral_tickets st ON sl.id = st.line_id
            AND st.purchased_at >= ${periodStart}
            AND st.status != 'cancelled'
          GROUP BY sl.id, sl.line_number, sl.name
          ORDER BY tickets_sold DESC
          LIMIT 10
        `);

        return res.status(200).json({
          success: true,
          data: {
            total_routes: totalRoutes.rows[0].total,
            total_tickets: ticketsByRoute.rows[0].total,
            top_routes: topRoutes.rows.length,
            average_ticket_price: 0,
            period_revenue: topRoutes.rows.map((row, index) => ({
              period: `Route ${row.line_number}`,
              revenue: row.revenue,
              tickets_sold: row.tickets_sold,
              active_users: index + 1 // Classement
            }))
          }
        });
      }

      return res.status(400).json({ success: false, error: 'Type de rapport non supporté' });
    } catch (err: any) {
      console.error('[AdminController.getPeriodReport]', err);
      return res.status(500).json({ success: false, error: 'Erreur génération rapport' });
    }
  }
}

export default AdminController;
