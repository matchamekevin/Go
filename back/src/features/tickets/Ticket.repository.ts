import { Pool } from "pg";
import { v4 as uuidv4 } from "uuid";
import pool from "../../shared/database/client";
import { Ticket, TicketProduct, Route } from "./Ticket.types";

export class TicketRepository {
  /**
   * Récupère tous les produits de tickets disponibles
   */
  static async getAllProducts(): Promise<TicketProduct[]> {
    const result = await pool.query(
      "SELECT * FROM ticket_products WHERE is_active = true ORDER BY price ASC",
    );
    return result.rows;
  }

  /**
   * Récupère tous les trajets disponibles
   */
  static async getAllRoutes(): Promise<Route[]> {
    const result = await pool.query(
      "SELECT * FROM routes WHERE is_active = true ORDER BY name ASC",
    );
    return result.rows;
  }

  /**
   * Récupère une ligne par son id
   */
  static async getLineById(lineId: number): Promise<any | null> {
    const result = await pool.query(
      "SELECT * FROM sotral_lines WHERE id = $1 AND is_active = true",
      [lineId],
    );
    return result.rows[0] || null;
  }

  /**
   * Récupère tous les trajets pour une catégorie de prix
   */
  static async getRoutesByPriceCategory(category: string): Promise<Route[]> {
    const result = await pool.query(
      "SELECT * FROM routes WHERE price_category = $1 AND is_active = true ORDER BY name ASC",
      [category],
    );
    return result.rows;
  }

  /**
   * Récupère un produit de ticket par son code
   */
  static async getProductByCode(code: string): Promise<TicketProduct | null> {
    const result = await pool.query(
      "SELECT * FROM ticket_products WHERE code = $1 AND is_active = true",
      [code],
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
        ticket.line_id || null,
        ticketCode,
        ticket.status || "unused",
        ticket.purchase_method,
        ticket.metadata || {},
      ],
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
      [userId],
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
      [code],
    );
    return result.rows[0] || null;
  }

  /**
   * Met à jour le statut d'un ticket
   */
  static async updateTicketStatus(
    code: string,
    status: "used" | "unused" | "expired",
  ): Promise<Ticket | null> {
    const now = new Date();
    const result = await pool.query(
      `UPDATE tickets
       SET status = $1, used_at = $2, updated_at = $3
       WHERE code = $4
       RETURNING *`,
      [status, status === "used" ? now : null, now, code],
    );
    return result.rows[0] || null;
  }

  /**
   * Met à jour/merge la metadata du ticket (jsonb ||)
   */
  static async updateTicketMetadataMerge(
    code: string,
    metadata: Record<string, any>,
  ): Promise<Ticket | null> {
    const result = await pool.query(
      `UPDATE tickets
       SET metadata = COALESCE(metadata, '{}'::jsonb) || $1::jsonb,
           updated_at = NOW()
       WHERE code = $2
       RETURNING *`,
      [JSON.stringify(metadata), code],
    );
    return result.rows[0] || null;
  }

  /**
   * Compte le nombre de tickets non utilisés pour un utilisateur
   */
  static async countUnusedTickets(userId: number): Promise<number> {
    const result = await pool.query(
      "SELECT COUNT(*) FROM tickets WHERE user_id = $1 AND status = $2",
      [userId, "unused"],
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

  /**
   * Compte le nombre de tickets disponibles pour une route donnée (exemple simple)
   * À adapter selon ta logique métier (stock, quota, etc.)
   */
  static async countAvailableTickets(line_id: number): Promise<number> {
    // Debug: vérifier la valeur reçue dans le repository
    console.log(
      "[TicketRepository.countAvailableTickets] line_id reçu:",
      line_id,
      "type:",
      typeof line_id,
    );
    const result = await pool.query(
      `SELECT COUNT(*) FROM sotral_tickets
       WHERE line_id = $1 AND status = 'active' AND user_id IS NULL`,
      [Number(line_id)],
    );
    return parseInt(result.rows[0].count, 10);
  }

  /**
   * Assigne des tickets disponibles à un utilisateur (après paiement)
   * Crée des entrées dans user_tickets sans modifier sotral_tickets
   */
  static async assignAvailableTickets(
    line_id: number,
    user_id: number,
    quantity: number = 1,
    external_id?: string,
  ): Promise<any[]> {
    // Debug: vérifier les paramètres reçus
    console.log(
      "[TicketRepository.assignAvailableTickets] line_id:",
      line_id,
      "user_id:",
      user_id,
      "quantity:",
      quantity,
    );

    // Transaction pour assigner les tickets de manière atomique
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      // Vérifier la disponibilité (sans verrouiller sotral_tickets)
      const availableQuery = `SELECT COUNT(*) as count FROM sotral_tickets
         WHERE line_id = $1 AND status = 'active'`;
      console.log("[DEBUG] Checking availability:", availableQuery);

      const availableResult = await client.query(availableQuery, [line_id]);
      const available = parseInt(availableResult.rows[0].count, 10);

      if (available < quantity) {
        await client.query("ROLLBACK");
        throw new Error(
          `Pas assez de tickets disponibles. Demandé: ${quantity}, Disponible: ${available}`,
        );
      }

      // Sélectionner quelques tickets sotral pour référence (optionnel)
      const selectQuery = `SELECT id FROM sotral_tickets
         WHERE line_id = $1 AND status = 'active'
         ORDER BY created_at ASC
         LIMIT $2`;

      const selectResult = await client.query(selectQuery, [line_id, quantity]);
      const sotralTicketIds = selectResult.rows.map((row) => row.id);

      // Créer les entrées user_tickets
      const userTickets = [];
      for (let i = 0; i < quantity; i++) {
        const ticketCode = `USR${Date.now()}${Math.floor(Math.random() * 10000)}${i}`;
        const sotralTicketId = sotralTicketIds[i] || sotralTicketIds[0]; // Utiliser un ticket de référence

        const insertQuery = `
          INSERT INTO user_tickets
          (user_id, sotral_ticket_id, purchase_external_id, line_id, ticket_code, status, expires_at)
          VALUES ($1, $2, $3, $4, $5, 'unused', NOW() + INTERVAL '24 hours')
          RETURNING *
        `;

        const insertResult = await client.query(insertQuery, [
          user_id,
          sotralTicketId,
          external_id,
          line_id,
          ticketCode,
        ]);

        userTickets.push(insertResult.rows[0]);
      }

      await client.query("COMMIT");

      console.log(
        `[TicketRepository.assignAvailableTickets] ${userTickets.length} user_tickets créés`,
      );
      return userTickets;
    } catch (error) {
      await client.query("ROLLBACK");
      console.error("[DEBUG] SQL Error in assignAvailableTickets:", error);
      console.error("[DEBUG] Error details:", {
        message: (error as any).message,
        code: (error as any).code,
        position: (error as any).position,
      });
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Récupère les tickets d'un utilisateur depuis user_tickets
   */
  static async getUserTicketsFromSotral(userId: number): Promise<any[]> {
    const result = await pool.query(
      `SELECT ut.*, sl.name as line_name, sl.route as line_route
       FROM user_tickets ut
       LEFT JOIN sotral_lines sl ON ut.line_id = sl.id
       WHERE ut.user_id = $1
       ORDER BY ut.created_at DESC`,
      [userId],
    );
    return result.rows;
  }

  /**
   * Récupère un ticket utilisateur par son code
   */
  static async getUserTicketByCode(ticketCode: string): Promise<any | null> {
    const result = await pool.query(
      `SELECT ut.*, sl.name as line_name, sl.route as line_route
       FROM user_tickets ut
       LEFT JOIN sotral_lines sl ON ut.line_id = sl.id
       WHERE ut.ticket_code = $1`,
      [ticketCode],
    );
    return result.rows[0] || null;
  }

  /**
   * Met à jour le statut d'un ticket utilisateur (ex: 'unused' -> 'used')
   */
  static async updateUserTicketStatus(
    ticketCode: string,
    status: string,
  ): Promise<any | null> {
    const result = await pool.query(
      `UPDATE user_tickets
       SET status = $1,
           used_at = CASE WHEN $1 = 'used' THEN NOW() ELSE used_at END,
           updated_at = NOW()
       WHERE ticket_code = $2
       RETURNING *`,
      [status, ticketCode],
    );
    return result.rows[0] || null;
  }

  /**
   * Valide/Scanne un ticket utilisateur (pour validation dans les bus)
   */
  static async validateUserTicket(ticketCode: string): Promise<{
    success: boolean;
    message: string;
    ticket?: any;
  }> {
    try {
      // Récupérer le ticket avec les infos de ligne
      const ticket = await this.getUserTicketByCode(ticketCode);

      if (!ticket) {
        return {
          success: false,
          message: "Ticket non trouvé",
        };
      }

      // Vérifications de validité
      if (ticket.status === "used") {
        return {
          success: false,
          message: "Ticket déjà utilisé",
          ticket,
        };
      }

      if (ticket.status === "expired") {
        return {
          success: false,
          message: "Ticket expiré",
          ticket,
        };
      }

      // Vérifier si le ticket n'est pas expiré par date
      if (ticket.expires_at && new Date() > new Date(ticket.expires_at)) {
        // Marquer comme expiré
        await this.updateUserTicketStatus(ticketCode, "expired");
        return {
          success: false,
          message: "Ticket expiré",
          ticket: { ...ticket, status: "expired" },
        };
      }

      // Valider le ticket (marquer comme utilisé)
      const validatedTicket = await this.updateUserTicketStatus(
        ticketCode,
        "used",
      );

      return {
        success: true,
        message: "Ticket validé avec succès",
        ticket: validatedTicket,
      };
    } catch (error) {
      console.error("[TicketRepository.validateUserTicket] error:", error);
      return {
        success: false,
        message: `Erreur lors de la validation: ${(error as Error).message}`,
      };
    }
  }

  /**
   * Récupère les statistiques des tickets utilisateur
   */
  static async getUserTicketStats(userId?: number): Promise<any> {
    const baseQuery = `
      SELECT
        status,
        COUNT(*) as count,
        line_id
      FROM user_tickets
    `;

    let query = baseQuery;
    let params: any[] = [];

    if (userId) {
      query += " WHERE user_id = $1";
      params.push(userId);
    }

    query += " GROUP BY status, line_id ORDER BY status, line_id";

    const result = await pool.query(query, params);
    return result.rows;
  }

  // =====================
  // MÉTHODES ADMIN CRUD
  // =====================

  /**
   * [ADMIN] Créer un nouveau produit de ticket
   */
  static async createProduct(
    product: Omit<TicketProduct, "id" | "created_at" | "updated_at">,
  ): Promise<TicketProduct> {
    const result = await pool.query(
      `INSERT INTO ticket_products (name, code, price, rides, is_active)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [
        product.name,
        product.code,
        product.price,
        product.rides,
        product.is_active,
      ],
    );
    return result.rows[0];
  }

  /**
   * [ADMIN] Mettre à jour un produit de ticket
   */
  static async updateProduct(
    id: string,
    updates: Partial<TicketProduct>,
  ): Promise<TicketProduct | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    Object.entries(updates).forEach(([key, value]) => {
      if (value !== undefined && key !== "id" && key !== "created_at") {
        fields.push(`${key} = $${paramCount}`);
        values.push(value);
        paramCount++;
      }
    });

    if (fields.length === 0) return null;

    values.push(id);
    const result = await pool.query(
      `UPDATE ticket_products
       SET ${fields.join(", ")}, updated_at = NOW()
       WHERE id = $${paramCount}
       RETURNING *`,
      values,
    );
    return result.rows[0] || null;
  }

  /**
   * [ADMIN] Supprimer un produit de ticket
   */
  static async deleteProduct(id: string): Promise<boolean> {
    const result = await pool.query(
      "DELETE FROM ticket_products WHERE id = $1",
      [id],
    );
    return (result.rowCount || 0) > 0;
  }

  /**
   * [ADMIN] Créer une nouvelle route
   */
  static async createRoute(
    route: Omit<Route, "id" | "created_at" | "updated_at">,
  ): Promise<Route> {
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
        route.is_active,
      ],
    );
    return result.rows[0];
  }

  /**
   * [ADMIN] Mettre à jour une route
   */
  static async updateRoute(
    id: string,
    updates: Partial<Route>,
  ): Promise<Route | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    Object.entries(updates).forEach(([key, value]) => {
      if (value !== undefined && key !== "id" && key !== "created_at") {
        fields.push(`${key} = $${paramCount}`);
        if (key === "stops") {
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
       SET ${fields.join(", ")}, updated_at = NOW()
       WHERE id = $${paramCount}
       RETURNING *`,
      values,
    );
    return result.rows[0] || null;
  }

  /**
   * [ADMIN] Supprimer une route
   */
  static async deleteRoute(id: string): Promise<boolean> {
    const result = await pool.query("DELETE FROM routes WHERE id = $1", [id]);
    return (result.rowCount || 0) > 0;
  }

  /**
   * [ADMIN] Récupérer tous les tickets avec filtres et pagination
   */
  static async getAllTicketsWithFilters(
    page: number = 1,
    limit: number = 50,
    filters: any = {},
  ): Promise<{
    tickets: Ticket[];
    total: number;
    page: number;
    limit: number;
  }> {
    const offset = (page - 1) * limit;
    const conditions = ["1=1"];
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

    const whereClause = conditions.join(" AND ");

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
      pool.query(countQuery, values.slice(0, -2)), // Enlever limit et offset pour le count
    ]);

    return {
      tickets: ticketsResult.rows,
      total: parseInt(countResult.rows[0].total),
      page,
      limit,
    };
  }

  /**
   * [ADMIN] Mettre à jour le statut d'un ticket par ID
   */
  static async updateTicketStatusById(
    id: string,
    status: string,
  ): Promise<Ticket | null> {
    const now = new Date();
    const result = await pool.query(
      `UPDATE tickets
       SET status = $1, used_at = $2, updated_at = $3
       WHERE id = $4
       RETURNING *`,
      [status, status === "used" ? now : null, now, id],
    );
    return result.rows[0] || null;
  }

  /**
   * [ADMIN] Supprimer plusieurs tickets par leurs ids
   */
  static async deleteTicketsByIds(ids: (number | string)[]): Promise<number> {
    if (!ids || ids.length === 0) return 0;
    // Use text[] to avoid casting issues when ids are integers or uuids.
    const stringIds = ids.map((id) => String(id));
    const result = await pool.query(
      "DELETE FROM tickets WHERE id = ANY($1::text[])",
      [stringIds],
    );
    return result.rowCount || 0;
  }
  // Récupérer les tickets assignés par external_id (transaction_id)
  static async getTicketsByExternalId(external_id: string) {
    try {
      const query = `
        SELECT
          t.id,
          t.code,
          t.line_id,
          t.user_id,
          t.status,
          t.created_at,
          t.updated_at,
          t.external_id,
          l.name as line_name,
          l.price
        FROM tickets t
        LEFT JOIN lines l ON t.line_id = l.id
        WHERE t.external_id = $1
        ORDER BY t.created_at DESC
      `;

      const result = await pool.query(query, [external_id]);
      return result.rows;
    } catch (error) {
      console.error("[TicketRepository.getTicketsByExternalId] Erreur:", error);
      throw new Error(
        `Impossible de récupérer les tickets: ${(error as Error).message}`,
      );
    }
  }
}
