import { Pool } from 'pg';
import { v4 as uuidv4 } from 'uuid';
import pool from '../../shared/database/client';
import { Ticket, TicketProduct, Route } from './Ticket.types';

export class TicketRepository {
  /**
   * Récupère tous les produits de tickets disponibles
   */
  static async getAllProducts(): Promise<TicketProduct[]> {
    const result = await pool.query(
      'SELECT * FROM ticket_products WHERE is_active = true ORDER BY price ASC'
    );
    return result.rows;
  }

  /**
   * Récupère tous les trajets disponibles
   */
  static async getAllRoutes(): Promise<Route[]> {
    const result = await pool.query(
      'SELECT * FROM routes WHERE is_active = true ORDER BY name ASC'
    );
    return result.rows;
  }

  /**
   * Récupère un trajet par son code
   */
  static async getRouteByCode(code: string): Promise<Route | null> {
    const result = await pool.query(
      'SELECT * FROM routes WHERE code = $1 AND is_active = true',
      [code]
    );
    return result.rows[0] || null;
  }

  /**
   * Récupère tous les trajets pour une catégorie de prix
   */
  static async getRoutesByPriceCategory(category: string): Promise<Route[]> {
    const result = await pool.query(
      'SELECT * FROM routes WHERE price_category = $1 AND is_active = true ORDER BY name ASC',
      [category]
    );
    return result.rows;
  }

  /**
   * Récupère un produit de ticket par son code
   */
  static async getProductByCode(code: string): Promise<TicketProduct | null> {
    const result = await pool.query(
      'SELECT * FROM ticket_products WHERE code = $1 AND is_active = true',
      [code]
    );
    return result.rows[0] || null;
  }

  /**
   * Crée un nouveau ticket dans la base de données
   */
  static async createTicket(ticket: Partial<Ticket>): Promise<Ticket> {
    const ticketId = uuidv4();
    const ticketCode = uuidv4();
    
    const result = await pool.query(
      `INSERT INTO tickets (id, user_id, product_code, route_code, code, status, purchase_method, metadata)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        ticketId,
        ticket.user_id,
        ticket.product_code,
        ticket.route_code || null,
        ticketCode,
        ticket.status || 'unused',
        ticket.purchase_method,
        ticket.metadata || {}
      ]
    );
    
    return result.rows[0];
  }

  /**
   * Récupère tous les tickets d'un utilisateur
   */
  static async getTicketsByUserId(userId: number): Promise<Ticket[]> {
    const result = await pool.query(
      `SELECT t.*, tp.name as product_name, tp.price, r.name as route_name
       FROM tickets t
       JOIN ticket_products tp ON t.product_code = tp.code
       LEFT JOIN routes r ON t.route_code = r.code
       WHERE t.user_id = $1
       ORDER BY t.purchased_at DESC`,
      [userId]
    );
    return result.rows;
  }

  /**
   * Récupère un ticket par son code
   */
  static async getTicketByCode(code: string): Promise<Ticket | null> {
    const result = await pool.query(
      `SELECT t.*, tp.name as product_name, tp.price, r.name as route_name
       FROM tickets t
       JOIN ticket_products tp ON t.product_code = tp.code
       LEFT JOIN routes r ON t.route_code = r.code
       WHERE t.code = $1`,
      [code]
    );
    return result.rows[0] || null;
  }

  /**
   * Met à jour le statut d'un ticket
   */
  static async updateTicketStatus(code: string, status: 'used' | 'unused' | 'expired'): Promise<Ticket | null> {
    const now = new Date();
    const result = await pool.query(
      `UPDATE tickets 
       SET status = $1, used_at = $2, updated_at = $3
       WHERE code = $4
       RETURNING *`,
      [status, status === 'used' ? now : null, now, code]
    );
    return result.rows[0] || null;
  }

  /**
   * Met à jour/merge la metadata du ticket (jsonb ||)
   */
  static async updateTicketMetadataMerge(code: string, metadata: Record<string, any>): Promise<Ticket | null> {
    const result = await pool.query(
      `UPDATE tickets
       SET metadata = COALESCE(metadata, '{}'::jsonb) || $1::jsonb,
           updated_at = NOW()
       WHERE code = $2
       RETURNING *`,
      [JSON.stringify(metadata), code]
    );
    return result.rows[0] || null;
  }
  
  /**
   * Compte le nombre de tickets non utilisés pour un utilisateur
   */
  static async countUnusedTickets(userId: number): Promise<number> {
    const result = await pool.query(
      'SELECT COUNT(*) FROM tickets WHERE user_id = $1 AND status = $2',
      [userId, 'unused']
    );
    return parseInt(result.rows[0].count);
  }
  
  /**
   * Récupère des statistiques sur les ventes de tickets
   */
  static async getTicketStats(): Promise<any> {
    const result = await pool.query(`
      SELECT 
        product_code, 
        COUNT(*) as total_sold,
        SUM(CASE WHEN status = 'unused' THEN 1 ELSE 0 END) as unused,
        SUM(CASE WHEN status = 'used' THEN 1 ELSE 0 END) as used,
        SUM(CASE WHEN status = 'expired' THEN 1 ELSE 0 END) as expired
      FROM tickets
      GROUP BY product_code
      ORDER BY total_sold DESC
    `);
    return result.rows;
  }

  // =====================
  // MÉTHODES ADMIN CRUD
  // =====================

  /**
   * [ADMIN] Créer un nouveau produit de ticket
   */
  static async createProduct(product: Omit<TicketProduct, 'id' | 'created_at' | 'updated_at'>): Promise<TicketProduct> {
    const result = await pool.query(
      `INSERT INTO ticket_products (name, code, price, rides, is_active)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [product.name, product.code, product.price, product.rides, product.is_active]
    );
    return result.rows[0];
  }

  /**
   * [ADMIN] Mettre à jour un produit de ticket
   */
  static async updateProduct(id: string, updates: Partial<TicketProduct>): Promise<TicketProduct | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    Object.entries(updates).forEach(([key, value]) => {
      if (value !== undefined && key !== 'id' && key !== 'created_at') {
        fields.push(`${key} = $${paramCount}`);
        values.push(value);
        paramCount++;
      }
    });

    if (fields.length === 0) return null;

    values.push(id);
    const result = await pool.query(
      `UPDATE ticket_products 
       SET ${fields.join(', ')}, updated_at = NOW()
       WHERE id = $${paramCount}
       RETURNING *`,
      values
    );
    return result.rows[0] || null;
  }

  /**
   * [ADMIN] Supprimer un produit de ticket
   */
  static async deleteProduct(id: string): Promise<boolean> {
    const result = await pool.query(
      'DELETE FROM ticket_products WHERE id = $1',
      [id]
    );
    return (result.rowCount || 0) > 0;
  }

  /**
   * [ADMIN] Créer une nouvelle route
   */
  static async createRoute(route: Omit<Route, 'id' | 'created_at' | 'updated_at'>): Promise<Route> {
    const result = await pool.query(
      `INSERT INTO routes (name, code, start_point, end_point, price_category, distance_km, duration_minutes, stops, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        route.name, 
        route.code, 
        route.start_point, 
        route.end_point, 
        route.price_category,
        route.distance_km,
        route.duration_minutes,
        JSON.stringify(route.stops || []),
        route.is_active
      ]
    );
    return result.rows[0];
  }

  /**
   * [ADMIN] Mettre à jour une route
   */
  static async updateRoute(id: string, updates: Partial<Route>): Promise<Route | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    Object.entries(updates).forEach(([key, value]) => {
      if (value !== undefined && key !== 'id' && key !== 'created_at') {
        fields.push(`${key} = $${paramCount}`);
        if (key === 'stops') {
          values.push(JSON.stringify(value));
        } else {
          values.push(value);
        }
        paramCount++;
      }
    });

    if (fields.length === 0) return null;

    values.push(id);
    const result = await pool.query(
      `UPDATE routes 
       SET ${fields.join(', ')}, updated_at = NOW()
       WHERE id = $${paramCount}
       RETURNING *`,
      values
    );
    return result.rows[0] || null;
  }

  /**
   * [ADMIN] Supprimer une route
   */
  static async deleteRoute(id: string): Promise<boolean> {
    const result = await pool.query(
      'DELETE FROM routes WHERE id = $1',
      [id]
    );
    return (result.rowCount || 0) > 0;
  }

  /**
   * [ADMIN] Récupérer tous les tickets avec filtres et pagination
   */
  static async getAllTicketsWithFilters(
    page: number = 1,
    limit: number = 50,
    filters: any = {}
  ): Promise<{ tickets: Ticket[], total: number, page: number, limit: number }> {
    const offset = (page - 1) * limit;
    const conditions = ['1=1'];
    const values = [];
    let paramCount = 1;

    // Construire les conditions WHERE
    if (filters.status) {
      conditions.push(`t.status = $${paramCount}`);
      values.push(filters.status);
      paramCount++;
    }
    if (filters.user_id) {
      conditions.push(`t.user_id = $${paramCount}`);
      values.push(filters.user_id);
      paramCount++;
    }
    if (filters.product_code) {
      conditions.push(`t.product_code = $${paramCount}`);
      values.push(filters.product_code);
      paramCount++;
    }
    if (filters.start_date) {
      conditions.push(`t.purchased_at >= $${paramCount}`);
      values.push(filters.start_date);
      paramCount++;
    }
    if (filters.end_date) {
      conditions.push(`t.purchased_at <= $${paramCount}`);
      values.push(filters.end_date);
      paramCount++;
    }

    const whereClause = conditions.join(' AND ');

    // Requête pour récupérer les tickets
    const ticketsQuery = `
      SELECT t.*, tp.name as product_name, tp.price, r.name as route_name,
             u.email as user_email, u.name as user_name
      FROM tickets t
      JOIN ticket_products tp ON t.product_code = tp.code
      LEFT JOIN routes r ON t.route_code = r.code
      LEFT JOIN users u ON t.user_id = u.id
      WHERE ${whereClause}
      ORDER BY t.purchased_at DESC
      LIMIT $${paramCount} OFFSET $${paramCount + 1}
    `;

    values.push(limit, offset);

    // Requête pour compter le total
    const countQuery = `
      SELECT COUNT(*) as total
      FROM tickets t
      WHERE ${whereClause}
    `;

    const [ticketsResult, countResult] = await Promise.all([
      pool.query(ticketsQuery, values),
      pool.query(countQuery, values.slice(0, -2)) // Enlever limit et offset pour le count
    ]);

    return {
      tickets: ticketsResult.rows,
      total: parseInt(countResult.rows[0].total),
      page,
      limit
    };
  }

  /**
   * [ADMIN] Mettre à jour le statut d'un ticket par ID
   */
  static async updateTicketStatusById(id: string, status: string): Promise<Ticket | null> {
    const now = new Date();
    const result = await pool.query(
      `UPDATE tickets 
       SET status = $1, used_at = $2, updated_at = $3
       WHERE id = $4
       RETURNING *`,
      [status, status === 'used' ? now : null, now, id]
    );
    return result.rows[0] || null;
  }

  /**
   * [ADMIN] Supprimer plusieurs tickets par leurs ids
   */
  static async deleteTicketsByIds(ids: (number | string)[]): Promise<number> {
    if (!ids || ids.length === 0) return 0;
    // Use text[] to avoid casting issues when ids are integers or uuids.
    const stringIds = ids.map(id => String(id));
    const result = await pool.query(
      'DELETE FROM tickets WHERE id = ANY($1::text[])',
      [stringIds]
    );
    return result.rowCount || 0;
  }
}
