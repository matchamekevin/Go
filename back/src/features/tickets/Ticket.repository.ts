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
}
