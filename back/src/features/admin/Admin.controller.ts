import { Response } from 'express';
import { AuthenticatedRequest } from '../../shared/midddleawers/auth.middleware';
import { UserRepository } from '../users/User.repository';
import { TicketRepository } from '../tickets/Ticket.repository';
import pool from '../../shared/database/client';

export class AdminController {
  
  // ========== GESTION DES UTILISATEURS ==========
  
  /**
   * Récupère tous les utilisateurs avec pagination et filtres
   */
  static async getAllUsers(req: AuthenticatedRequest, res: Response) {
    try {
      const { page = 1, limit = 10, search, role } = req.query;
      
      let query = `
        SELECT id, email, name, phone, is_verified, created_at, updated_at
        FROM users 
        WHERE 1=1
      `;
      const params: any[] = [];
      let paramIndex = 1;

      if (search) {
        query += ` AND (name ILIKE $${paramIndex} OR email ILIKE $${paramIndex} OR phone ILIKE $${paramIndex})`;
        params.push(`%${search}%`);
        paramIndex++;
      }

      if (role && role !== 'all') {
        query += ` AND is_verified = $${paramIndex}`;
        params.push(role === 'verified');
        paramIndex++;
      }

      // Pagination
      const offset = (Number(page) - 1) * Number(limit);
      query += ` ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
      params.push(Number(limit), offset);

      const result = await pool.query(query, params);
      
      // Compter le total
      let countQuery = `SELECT COUNT(*) FROM users WHERE 1=1`;
      const countParams: any[] = [];
      let countIndex = 1;
      
      if (search) {
        countQuery += ` AND (name ILIKE $${countIndex} OR email ILIKE $${countIndex} OR phone ILIKE $${countIndex})`;
        countParams.push(`%${search}%`);
        countIndex++;
      }
      
      if (role && role !== 'all') {
        countQuery += ` AND is_verified = $${countIndex}`;
        countParams.push(role === 'verified');
      }
      
      const countResult = await pool.query(countQuery, countParams);
      const total = parseInt(countResult.rows[0].count);

      return res.status(200).json({
        success: true,
        data: {
          items: result.rows,
          totalPages: Math.ceil(total / Number(limit)),
          currentPage: Number(page),
          totalItems: total
        }
      });
    } catch (error) {
      console.error('[AdminController.getAllUsers] error:', error);
      return res.status(500).json({ success: false, error: 'Erreur lors de la récupération des utilisateurs' });
    }
  }

  /**
   * Récupère un utilisateur par ID
   */
  static async getUserById(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const result = await pool.query(
        'SELECT id, email, name, phone, is_verified, created_at, updated_at FROM users WHERE id = $1',
        [id]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, error: 'Utilisateur non trouvé' });
      }

      return res.status(200).json({ success: true, data: result.rows[0] });
    } catch (error) {
      console.error('[AdminController.getUserById] error:', error);
      return res.status(500).json({ success: false, error: 'Erreur lors de la récupération de l\'utilisateur' });
    }
  }

  /**
   * Met à jour un utilisateur
   */
  static async updateUser(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const { name, phone, is_verified } = req.body;

      const result = await pool.query(
        `UPDATE users 
         SET name = COALESCE($1, name), 
             phone = COALESCE($2, phone), 
             is_verified = COALESCE($3, is_verified),
             updated_at = NOW()
         WHERE id = $4 
         RETURNING id, email, name, phone, is_verified, created_at, updated_at`,
        [name, phone, is_verified, id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, error: 'Utilisateur non trouvé' });
      }

      return res.status(200).json({ success: true, data: result.rows[0] });
    } catch (error) {
      console.error('[AdminController.updateUser] error:', error);
      return res.status(500).json({ success: false, error: 'Erreur lors de la mise à jour de l\'utilisateur' });
    }
  }

  /**
   * Supprime un utilisateur
   */
  static async deleteUser(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      
      const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING id', [id]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, error: 'Utilisateur non trouvé' });
      }

      return res.status(200).json({ success: true, message: 'Utilisateur supprimé avec succès' });
    } catch (error) {
      console.error('[AdminController.deleteUser] error:', error);
      return res.status(500).json({ success: false, error: 'Erreur lors de la suppression de l\'utilisateur' });
    }
  }

  /**
   * Active/désactive un utilisateur
   */
  static async toggleUserStatus(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      
      const result = await pool.query(
        `UPDATE users 
         SET is_verified = NOT is_verified, updated_at = NOW()
         WHERE id = $1 
         RETURNING id, email, name, phone, is_verified, created_at, updated_at`,
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, error: 'Utilisateur non trouvé' });
      }

      return res.status(200).json({ success: true, data: result.rows[0] });
    } catch (error) {
      console.error('[AdminController.toggleUserStatus] error:', error);
      return res.status(500).json({ success: false, error: 'Erreur lors du changement de statut' });
    }
  }

  /**
   * Statistiques des utilisateurs
   */
  static async getUserStats(req: AuthenticatedRequest, res: Response) {
    try {
      const stats = await pool.query(`
        SELECT 
          COUNT(*) as total,
          COUNT(*) FILTER (WHERE is_verified = true) as verified,
          COUNT(*) FILTER (WHERE is_verified = false) as unverified,
          COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days') as recently_registered
        FROM users
      `);

      return res.status(200).json({ success: true, data: stats.rows[0] });
    } catch (error) {
      console.error('[AdminController.getUserStats] error:', error);
      return res.status(500).json({ success: false, error: 'Erreur lors de la récupération des statistiques' });
    }
  }

  // ========== GESTION DES ROUTES ==========

  /**
   * Récupère toutes les routes
   */
  static async getAllRoutes(req: AuthenticatedRequest, res: Response) {
    try {
      const routes = await pool.query(`
        SELECT 
          id, code, name, departure, arrival, price_category, 
          distance_km, estimated_duration_minutes, is_active, 
          created_at, updated_at
        FROM routes 
        ORDER BY name ASC
      `);

      return res.status(200).json({ success: true, data: routes.rows });
    } catch (error) {
      console.error('[AdminController.getAllRoutes] error:', error);
      return res.status(500).json({ success: false, error: 'Erreur lors de la récupération des routes' });
    }
  }

  /**
   * Crée une nouvelle route
   */
  static async createRoute(req: AuthenticatedRequest, res: Response) {
    try {
      const { 
        code, name, departure, arrival, price_category, 
        distance_km, estimated_duration_minutes 
      } = req.body;

      const result = await pool.query(`
        INSERT INTO routes (code, name, departure, arrival, price_category, distance_km, estimated_duration_minutes, is_active)
        VALUES ($1, $2, $3, $4, $5, $6, $7, true)
        RETURNING *
      `, [code, name, departure, arrival, price_category, distance_km, estimated_duration_minutes]);

      return res.status(201).json({ success: true, data: result.rows[0] });
    } catch (error) {
      console.error('[AdminController.createRoute] error:', error);
      return res.status(500).json({ success: false, error: 'Erreur lors de la création de la route' });
    }
  }

  /**
   * Met à jour une route
   */
  static async updateRoute(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const { 
        name, departure, arrival, price_category, 
        distance_km, estimated_duration_minutes, is_active 
      } = req.body;

      const result = await pool.query(`
        UPDATE routes 
        SET name = COALESCE($1, name),
            departure = COALESCE($2, departure),
            arrival = COALESCE($3, arrival),
            price_category = COALESCE($4, price_category),
            distance_km = COALESCE($5, distance_km),
            estimated_duration_minutes = COALESCE($6, estimated_duration_minutes),
            is_active = COALESCE($7, is_active),
            updated_at = NOW()
        WHERE id = $8
        RETURNING *
      `, [name, departure, arrival, price_category, distance_km, estimated_duration_minutes, is_active, id]);

      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, error: 'Route non trouvée' });
      }

      return res.status(200).json({ success: true, data: result.rows[0] });
    } catch (error) {
      console.error('[AdminController.updateRoute] error:', error);
      return res.status(500).json({ success: false, error: 'Erreur lors de la mise à jour de la route' });
    }
  }

  /**
   * Supprime une route
   */
  static async deleteRoute(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      
      const result = await pool.query('DELETE FROM routes WHERE id = $1 RETURNING id', [id]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, error: 'Route non trouvée' });
      }

      return res.status(200).json({ success: true, message: 'Route supprimée avec succès' });
    } catch (error) {
      console.error('[AdminController.deleteRoute] error:', error);
      return res.status(500).json({ success: false, error: 'Erreur lors de la suppression de la route' });
    }
  }

  /**
   * Statistiques des routes
   */
  static async getRouteStats(req: AuthenticatedRequest, res: Response) {
    try {
      const stats = await pool.query(`
        SELECT 
          COUNT(*) as total,
          COUNT(*) FILTER (WHERE is_active = true) as active,
          COUNT(*) FILTER (WHERE is_active = false) as inactive
        FROM routes
      `);

      return res.status(200).json({ success: true, data: stats.rows[0] });
    } catch (error) {
      console.error('[AdminController.getRouteStats] error:', error);
      return res.status(500).json({ success: false, error: 'Erreur lors de la récupération des statistiques des routes' });
    }
  }

  // ========== GESTION DES PRODUITS ==========

  /**
   * Récupère tous les produits
   */
  static async getAllProducts(req: AuthenticatedRequest, res: Response) {
    try {
      const products = await TicketRepository.getAllProducts();
      return res.status(200).json({ success: true, data: products });
    } catch (error) {
      console.error('[AdminController.getAllProducts] error:', error);
      return res.status(500).json({ success: false, error: 'Erreur lors de la récupération des produits' });
    }
  }

  /**
   * Crée un nouveau produit
   */
  static async createProduct(req: AuthenticatedRequest, res: Response) {
    try {
      const { code, name, description, price, rides, is_active } = req.body;

      const result = await pool.query(`
        INSERT INTO ticket_products (code, name, description, price, rides, is_active)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
      `, [code, name, description, price, rides, is_active]);

      return res.status(201).json({ success: true, data: result.rows[0] });
    } catch (error) {
      console.error('[AdminController.createProduct] error:', error);
      return res.status(500).json({ success: false, error: 'Erreur lors de la création du produit' });
    }
  }

  /**
   * Met à jour un produit
   */
  static async updateProduct(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const { name, description, price, rides, is_active } = req.body;

      const result = await pool.query(`
        UPDATE ticket_products 
        SET name = COALESCE($1, name),
            description = COALESCE($2, description),
            price = COALESCE($3, price),
            rides = COALESCE($4, rides),
            is_active = COALESCE($5, is_active),
            updated_at = NOW()
        WHERE id = $6
        RETURNING *
      `, [name, description, price, rides, is_active, id]);

      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, error: 'Produit non trouvé' });
      }

      return res.status(200).json({ success: true, data: result.rows[0] });
    } catch (error) {
      console.error('[AdminController.updateProduct] error:', error);
      return res.status(500).json({ success: false, error: 'Erreur lors de la mise à jour du produit' });
    }
  }

  /**
   * Supprime un produit
   */
  static async deleteProduct(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      
      const result = await pool.query('DELETE FROM ticket_products WHERE id = $1 RETURNING id', [id]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, error: 'Produit non trouvé' });
      }

      return res.status(200).json({ success: true, message: 'Produit supprimé avec succès' });
    } catch (error) {
      console.error('[AdminController.deleteProduct] error:', error);
      return res.status(500).json({ success: false, error: 'Erreur lors de la suppression du produit' });
    }
  }

  // ========== STATISTIQUES DASHBOARD ==========

  /**
   * Statistiques pour le dashboard admin
   */
  static async getDashboardStats(req: AuthenticatedRequest, res: Response) {
    try {
      const [userStats, ticketStats, routeStats, revenueStats] = await Promise.all([
        pool.query(`
          SELECT 
            COUNT(*) as total_users,
            COUNT(*) FILTER (WHERE is_verified = true) as verified_users,
            COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days') as new_users_month
          FROM users
        `),
        pool.query(`
          SELECT 
            COUNT(*) as total_tickets,
            COUNT(*) FILTER (WHERE status = 'used') as used_tickets,
            COUNT(*) FILTER (WHERE purchased_at >= NOW() - INTERVAL '30 days') as tickets_month
          FROM tickets
        `),
        pool.query(`
          SELECT 
            COUNT(*) as total_routes,
            COUNT(*) FILTER (WHERE is_active = true) as active_routes
          FROM routes
        `),
        pool.query(`
          SELECT 
            COALESCE(SUM(tp.price), 0) as total_revenue,
            COALESCE(SUM(CASE WHEN t.purchased_at >= NOW() - INTERVAL '30 days' THEN tp.price ELSE 0 END), 0) as revenue_month
          FROM tickets t
          JOIN ticket_products tp ON t.product_code = tp.code
          WHERE t.status != 'cancelled'
        `)
      ]);

      const stats = {
        users: userStats.rows[0],
        tickets: ticketStats.rows[0],
        routes: routeStats.rows[0],
        revenue: revenueStats.rows[0]
      };

      return res.status(200).json({ success: true, data: stats });
    } catch (error) {
      console.error('[AdminController.getDashboardStats] error:', error);
      return res.status(500).json({ success: false, error: 'Erreur lors de la récupération des statistiques' });
    }
  }

  // ========== GESTION DES PAIEMENTS ==========

  /**
   * Récupère tous les paiements
   */
  static async getAllPayments(req: AuthenticatedRequest, res: Response) {
    try {
      const { page = 1, limit = 10 } = req.query;
      const offset = (Number(page) - 1) * Number(limit);

      const payments = await pool.query(`
        SELECT 
          pr.id, pr.external_id, pr.amount, pr.currency, pr.status, 
          pr.payment_method, pr.created_at, pr.updated_at,
          u.name as user_name, u.email as user_email
        FROM payment_receipts pr
        LEFT JOIN users u ON pr.user_id = u.id
        ORDER BY pr.created_at DESC
        LIMIT $1 OFFSET $2
      `, [Number(limit), offset]);

      const countResult = await pool.query('SELECT COUNT(*) FROM payment_receipts');
      const total = parseInt(countResult.rows[0].count);

      return res.status(200).json({
        success: true,
        data: {
          items: payments.rows,
          totalPages: Math.ceil(total / Number(limit)),
          currentPage: Number(page),
          totalItems: total
        }
      });
    } catch (error) {
      console.error('[AdminController.getAllPayments] error:', error);
      return res.status(500).json({ success: false, error: 'Erreur lors de la récupération des paiements' });
    }
  }

  /**
   * Statistiques des paiements
   */
  static async getPaymentStats(req: AuthenticatedRequest, res: Response) {
    try {
      const stats = await pool.query(`
        SELECT 
          COUNT(*) as total_payments,
          COUNT(*) FILTER (WHERE status = 'completed') as completed_payments,
          COUNT(*) FILTER (WHERE status = 'pending') as pending_payments,
          COUNT(*) FILTER (WHERE status = 'failed') as failed_payments,
          COALESCE(SUM(amount), 0) as total_amount,
          COALESCE(SUM(CASE WHEN created_at >= NOW() - INTERVAL '30 days' THEN amount ELSE 0 END), 0) as amount_month
        FROM payment_receipts
      `);

      return res.status(200).json({ success: true, data: stats.rows[0] });
    } catch (error) {
      console.error('[AdminController.getPaymentStats] error:', error);
      return res.status(500).json({ success: false, error: 'Erreur lors de la récupération des statistiques de paiement' });
    }
  }

  // ========== CHART DATA & ACTIVITY ==========

  /**
   * Données pour les graphiques
   */
  static async getChartData(req: AuthenticatedRequest, res: Response) {
    try {
      const { type = 'revenue', period = '30d' } = req.query;
      
      const days = period === '7d' ? 7 : period === '30d' ? 30 : period === '90d' ? 90 : 365;
      
      let query = '';
      let dateField = '';
      let valueField = '';
      
      switch (type) {
        case 'users':
          query = `
            SELECT DATE(created_at) as date, COUNT(*) as value
            FROM users 
            WHERE created_at >= NOW() - INTERVAL '${days} days'
            GROUP BY DATE(created_at)
            ORDER BY date
          `;
          break;
        case 'tickets':
          query = `
            SELECT DATE(purchased_at) as date, COUNT(*) as value
            FROM tickets 
            WHERE purchased_at >= NOW() - INTERVAL '${days} days'
            GROUP BY DATE(purchased_at)
            ORDER BY date
          `;
          break;
        case 'revenue':
        default:
          query = `
            SELECT DATE(t.purchased_at) as date, COALESCE(SUM(tp.price), 0) as value
            FROM tickets t
            JOIN ticket_products tp ON t.product_code = tp.code
            WHERE t.purchased_at >= NOW() - INTERVAL '${days} days'
            GROUP BY DATE(t.purchased_at)
            ORDER BY date
          `;
          break;
      }

      const result = await pool.query(query);
      
      // Fill missing dates with 0 values
      const chartData = [];
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        const existingData = result.rows.find(row => row.date === dateStr);
        chartData.push({
          date: dateStr,
          value: existingData ? Number(existingData.value) : 0
        });
      }

      return res.status(200).json({ success: true, data: chartData });
    } catch (error) {
      console.error('[AdminController.getChartData] error:', error);
      return res.status(500).json({ success: false, error: 'Erreur lors de la récupération des données graphique' });
    }
  }

  /**
   * Activité récente
   */
  static async getRecentActivity(req: AuthenticatedRequest, res: Response) {
    try {
      const activities = await pool.query(`
        (
          SELECT 
            t.id,
            u.name as user_name,
            'Achat de ticket' as action,
            t.purchased_at as timestamp,
            tp.price::text || ' FCFA' as amount
          FROM tickets t
          JOIN users u ON t.user_id = u.id
          JOIN ticket_products tp ON t.product_code = tp.code
          WHERE t.purchased_at IS NOT NULL
        )
        UNION ALL
        (
          SELECT 
            t.id,
            u.name as user_name,
            'Utilisation ticket' as action,
            t.used_at as timestamp,
            NULL as amount
          FROM tickets t
          JOIN users u ON t.user_id = u.id
          WHERE t.used_at IS NOT NULL
        )
        UNION ALL
        (
          SELECT 
            u.id,
            u.name as user_name,
            'Inscription' as action,
            u.created_at as timestamp,
            NULL as amount
          FROM users u
          WHERE u.created_at >= NOW() - INTERVAL '24 hours'
        )
        ORDER BY timestamp DESC
        LIMIT 10
      `);

      const formattedActivities = activities.rows.map(activity => {
        const timeAgo = new Date(activity.timestamp);
        const now = new Date();
        const diffMinutes = Math.floor((now.getTime() - timeAgo.getTime()) / (1000 * 60));
        
        let timeString = '';
        if (diffMinutes < 1) {
          timeString = 'À l\'instant';
        } else if (diffMinutes < 60) {
          timeString = `Il y a ${diffMinutes} minute${diffMinutes > 1 ? 's' : ''}`;
        } else if (diffMinutes < 1440) {
          const hours = Math.floor(diffMinutes / 60);
          timeString = `Il y a ${hours} heure${hours > 1 ? 's' : ''}`;
        } else {
          const days = Math.floor(diffMinutes / 1440);
          timeString = `Il y a ${days} jour${days > 1 ? 's' : ''}`;
        }

        return {
          id: activity.id,
          user: activity.user_name,
          action: activity.action,
          time: timeString,
          amount: activity.amount
        };
      });

      return res.status(200).json({ success: true, data: formattedActivities });
    } catch (error) {
      console.error('[AdminController.getRecentActivity] error:', error);
      return res.status(500).json({ success: false, error: 'Erreur lors de la récupération de l\'activité récente' });
    }
  }

  // ========== GESTION DES TICKETS ==========

  /**
   * Récupère tous les tickets avec pagination
   */
  static async getAllTickets(req: AuthenticatedRequest, res: Response) {
    try {
      const { page = 1, limit = 10, status, search } = req.query;
      const offset = (Number(page) - 1) * Number(limit);

      let query = `
        SELECT 
          t.id, t.code, t.status, t.purchased_at, t.used_at, t.created_at,
          u.name as user_name, u.email as user_email,
          tp.name as product_name, tp.price as product_price,
          r.name as route_name, r.code as route_code
        FROM tickets t
        LEFT JOIN users u ON t.user_id = u.id
        LEFT JOIN ticket_products tp ON t.product_code = tp.code
        LEFT JOIN routes r ON t.route_code = r.code
        WHERE 1=1
      `;
      const params: any[] = [];
      let paramIndex = 1;

      if (status && status !== 'all') {
        query += ` AND t.status = $${paramIndex}`;
        params.push(status);
        paramIndex++;
      }

      if (search) {
        query += ` AND (t.code ILIKE $${paramIndex} OR u.name ILIKE $${paramIndex} OR u.email ILIKE $${paramIndex})`;
        params.push(`%${search}%`);
        paramIndex++;
      }

      query += ` ORDER BY t.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
      params.push(Number(limit), offset);

      const result = await pool.query(query, params);
      
      // Compter le total
      let countQuery = `SELECT COUNT(*) FROM tickets t WHERE 1=1`;
      const countParams: any[] = [];
      let countIndex = 1;
      
      if (status && status !== 'all') {
        countQuery += ` AND t.status = $${countIndex}`;
        countParams.push(status);
        countIndex++;
      }
      
      if (search) {
        countQuery += ` AND EXISTS (
          SELECT 1 FROM users u WHERE u.id = t.user_id 
          AND (t.code ILIKE $${countIndex} OR u.name ILIKE $${countIndex} OR u.email ILIKE $${countIndex})
        )`;
        countParams.push(`%${search}%`);
      }
      
      const countResult = await pool.query(countQuery, countParams);
      const total = parseInt(countResult.rows[0].count);

      return res.status(200).json({
        success: true,
        data: {
          items: result.rows,
          totalPages: Math.ceil(total / Number(limit)),
          currentPage: Number(page),
          totalItems: total
        }
      });
    } catch (error) {
      console.error('[AdminController.getAllTickets] error:', error);
      return res.status(500).json({ success: false, error: 'Erreur lors de la récupération des tickets' });
    }
  }

  /**
   * Met à jour le statut d'un ticket
   */
  static async updateTicketStatus(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!['unused', 'used', 'cancelled'].includes(status)) {
        return res.status(400).json({ success: false, error: 'Statut invalide' });
      }

      const updateFields = ['status = $1', 'updated_at = NOW()'];
      const params = [status, id];

      if (status === 'used') {
        updateFields.push('used_at = NOW()');
      }

      const result = await pool.query(`
        UPDATE tickets 
        SET ${updateFields.join(', ')}
        WHERE id = $${params.length}
        RETURNING *
      `, params);

      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, error: 'Ticket non trouvé' });
      }

      return res.status(200).json({ success: true, data: result.rows[0] });
    } catch (error) {
      console.error('[AdminController.updateTicketStatus] error:', error);
      return res.status(500).json({ success: false, error: 'Erreur lors de la mise à jour du ticket' });
    }
  }
}
