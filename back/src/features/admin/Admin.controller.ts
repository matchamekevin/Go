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
        data: result.rows,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          totalPages: Math.ceil(total / Number(limit))
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
        data: payments.rows,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          totalPages: Math.ceil(total / Number(limit))
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
}
