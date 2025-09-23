import { PoolClient } from 'pg';
import pool from '../../shared/database/client';
import {
  SotralLine,
  SotralLineWithDetails,
  SotralStop,
  SotralTicket,
  SotralTicketWithDetails,
  SotralTicketType,
  SotralTicketPurchase,
  SotralTicketValidation,
  QRCodeValidation,
  SotralStats,
  SotralPricingZone,
  SotralLineCategory,
  SOTRAL_CONFIG,
  TicketStatus,
  ValidationMethod
} from './sotral.types';

export class SotralRepository {
  
  // ==========================================
  // GESTION DES LIGNES
  // ==========================================

  async getAllLines(): Promise<SotralLineWithDetails[]> {
    const client = await pool.connect();
    try {
      const query = `
        SELECT 
          l.*,
          c.name as category_name,
          c.description as category_description
        FROM sotral_lines l
        LEFT JOIN sotral_line_categories c ON l.category_id = c.id
        WHERE l.is_active = true
        ORDER BY l.line_number ASC
      `;
      
      const result = await client.query(query);
      return result.rows.map((row: any) => ({
        id: row.id,
        line_number: row.line_number,
        name: row.name,
        route_from: row.route_from,
        route_to: row.route_to,
        category_id: row.category_id,
        distance_km: parseFloat(row.distance_km) || 0,
        stops_count: row.stops_count,
        is_active: row.is_active,
        created_at: row.created_at,
        updated_at: row.updated_at,
        category: row.category_name ? {
          id: row.category_id,
          name: row.category_name,
          description: row.category_description
        } : undefined
      }));
    } finally {
      client.release();
    }
  }

  async getLineById(id: number): Promise<SotralLineWithDetails | null> {
    const client = await pool.connect();
    try {
      const query = `
        SELECT 
          l.*,
          c.name as category_name,
          c.description as category_description
        FROM sotral_lines l
        LEFT JOIN sotral_line_categories c ON l.category_id = c.id
        WHERE l.id = $1 AND l.is_active = true
      `;
      
      const result = await client.query(query, [id]);
      if (result.rows.length === 0) return null;
      
      const row = result.rows[0];
      return {
        id: row.id,
        line_number: row.line_number,
        name: row.name,
        route_from: row.route_from,
        route_to: row.route_to,
        category_id: row.category_id,
        distance_km: parseFloat(row.distance_km) || 0,
        stops_count: row.stops_count,
        is_active: row.is_active,
        created_at: row.created_at,
        updated_at: row.updated_at,
        category: row.category_name ? {
          id: row.category_id,
          name: row.category_name,
          description: row.category_description
        } : undefined
      };
    } finally {
      client.release();
    }
  }

  async getLinesByCategory(categoryId: number): Promise<SotralLineWithDetails[]> {
    const client = await pool.connect();
    try {
      const query = `
        SELECT 
          l.*,
          c.name as category_name,
          c.description as category_description
        FROM sotral_lines l
        LEFT JOIN sotral_line_categories c ON l.category_id = c.id
        WHERE l.category_id = $1 AND l.is_active = true
        ORDER BY l.line_number ASC
      `;
      
      const result = await client.query(query, [categoryId]);
      return result.rows.map((row: any) => ({
        id: row.id,
        line_number: row.line_number,
        name: row.name,
        route_from: row.route_from,
        route_to: row.route_to,
        category_id: row.category_id,
        distance_km: parseFloat(row.distance_km) || 0,
        stops_count: row.stops_count,
        is_active: row.is_active,
        created_at: row.created_at,
        updated_at: row.updated_at,
        category: {
          id: row.category_id,
          name: row.category_name,
          description: row.category_description
        }
      }));
    } finally {
      client.release();
    }
  }

  // ==========================================
  // GESTION DES ARRÊTS
  // ==========================================

  async getAllStops(): Promise<SotralStop[]> {
    const client = await pool.connect();
    try {
      const query = `
        SELECT * FROM sotral_stops 
        WHERE is_active = true 
        ORDER BY name ASC
      `;
      
      const result = await client.query(query);
      return result.rows;
    } finally {
      client.release();
    }
  }

  async getStopsByLine(lineId: number): Promise<SotralStop[]> {
    const client = await pool.connect();
    try {
      const query = `
        SELECT s.*, ls.sequence_order, ls.direction
        FROM sotral_stops s
        JOIN sotral_line_stops ls ON s.id = ls.stop_id
        WHERE ls.line_id = $1 AND s.is_active = true
        ORDER BY ls.direction, ls.sequence_order ASC
      `;
      
      const result = await client.query(query, [lineId]);
      return result.rows;
    } finally {
      client.release();
    }
  }

  // ==========================================
  // GESTION DES TYPES DE TICKETS
  // ==========================================

  async getAllTicketTypes(): Promise<SotralTicketType[]> {
    const client = await pool.connect();
    try {
      const query = `
        SELECT * FROM sotral_ticket_types 
        WHERE is_active = true 
        ORDER BY price_fcfa ASC
      `;
      
      const result = await client.query(query);
      return result.rows;
    } finally {
      client.release();
    }
  }

  async getTicketTypeByCode(code: string): Promise<SotralTicketType | null> {
    const client = await pool.connect();
    try {
      const query = `
        SELECT * FROM sotral_ticket_types 
        WHERE code = $1 AND is_active = true
      `;
      
      const result = await client.query(query, [code]);
      return result.rows[0] || null;
    } finally {
      client.release();
    }
  }

  // ==========================================
  // CALCUL DES TARIFS
  // ==========================================

  async calculatePrice(
    lineId: number, 
    stopFromId?: number, 
    stopToId?: number, 
    isStudent: boolean = false
  ): Promise<{ price: number; zone: string }> {
    const client = await pool.connect();
    try {
      // Pour les étudiants, tarif unique
      if (isStudent) {
        return { price: SOTRAL_CONFIG.STUDENT_PRICE_FCFA, zone: 'Étudiant' };
      }

      // Si pas d'arrêts spécifiés, utiliser la distance de la ligne
      let distance = 0;
      if (lineId) {
        const lineQuery = `SELECT distance_km FROM sotral_lines WHERE id = $1`;
        const lineResult = await client.query(lineQuery, [lineId]);
        distance = parseFloat(lineResult.rows[0]?.distance_km) || 0;
      }

      // Calculer selon les zones tarifaires
      const zone = SOTRAL_CONFIG.PRICE_ZONES.find(z => distance <= z.max_km);
      return { 
        price: zone?.price || 100, 
        zone: `Zone ${SOTRAL_CONFIG.PRICE_ZONES.indexOf(zone!) + 1}` 
      };
    } finally {
      client.release();
    }
  }

  // ==========================================
  // ACHAT DE TICKETS
  // ==========================================

  async purchaseTicket(
    userId: number | null,
    purchaseData: SotralTicketPurchase
  ): Promise<SotralTicketWithDetails> {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      // Récupérer le type de ticket
      const ticketType = await this.getTicketTypeByCode(purchaseData.ticket_type_code);
      if (!ticketType) {
        throw new Error('Type de ticket non trouvé');
      }

      // Calculer le prix si nécessaire
      let finalPrice = ticketType.price_fcfa;
      if (purchaseData.line_id && purchaseData.ticket_type_code === 'SIMPLE') {
        const priceCalc = await this.calculatePrice(
          purchaseData.line_id,
          purchaseData.stop_from_id,
          purchaseData.stop_to_id,
          ticketType.is_student_discount
        );
        finalPrice = priceCalc.price;
      }

      // Calculer la date d'expiration
      let expiresAt = null;
      if (ticketType.validity_duration_hours) {
        expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + ticketType.validity_duration_hours);
      }

      // Générer le QR code
      const ticketCode = await this.generateTicketCode();
      const qrCode = await this.generateQRCode(ticketCode);

      // Insérer le ticket
      const insertQuery = `
        INSERT INTO sotral_tickets (
          ticket_code, qr_code, user_id, ticket_type_id, line_id, 
          stop_from_id, stop_to_id, price_paid_fcfa, expires_at, 
          trips_remaining, payment_method, payment_reference
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        RETURNING *
      `;

      const values = [
        ticketCode,
        qrCode,
        userId,
        ticketType.id,
        purchaseData.line_id || null,
        purchaseData.stop_from_id || null,
        purchaseData.stop_to_id || null,
        finalPrice * purchaseData.quantity,
        expiresAt,
        ticketType.max_trips * purchaseData.quantity,
        purchaseData.payment_method,
        purchaseData.payment_details?.reference || null
      ];

      const result = await client.query(insertQuery, values);
      const ticket = result.rows[0];

      await client.query('COMMIT');

      // Retourner le ticket avec les détails
      return await this.getTicketById(ticket.id) as SotralTicketWithDetails;

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // ==========================================
  // VALIDATION DE TICKETS
  // ==========================================

  async validateTicketByQR(validation: QRCodeValidation): Promise<{
    success: boolean;
    ticket?: SotralTicketWithDetails;
    validation?: SotralTicketValidation;
    message?: string;
  }> {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      // Trouver le ticket par code QR
      const ticketQuery = `
        SELECT * FROM sotral_tickets 
        WHERE ticket_code = $1
      `;
      
      const ticketResult = await client.query(ticketQuery, [validation.ticket_code]);
      if (ticketResult.rows.length === 0) {
        return { success: false, message: 'Ticket non trouvé' };
      }

      const ticket = ticketResult.rows[0];

      // Vérifier le statut
      if (ticket.status === 'used' && ticket.trips_remaining <= 0) {
        return { success: false, message: 'Ticket déjà utilisé' };
      }
      
      if (ticket.status === 'expired') {
        return { success: false, message: 'Ticket expiré' };
      }
      
      if (ticket.status === 'cancelled') {
        return { success: false, message: 'Ticket annulé' };
      }

      // Vérifier l'expiration
      if (ticket.expires_at && new Date() > new Date(ticket.expires_at)) {
        await client.query(
          'UPDATE sotral_tickets SET status = $1 WHERE id = $2',
          ['expired', ticket.id]
        );
        return { success: false, message: 'Ticket expiré' };
      }

      // Enregistrer la validation
      const validationInsert = `
        INSERT INTO sotral_ticket_validations (
          ticket_id, line_id, stop_id, validator_device_id, validation_method
        ) VALUES ($1, $2, $3, $4, $5)
        RETURNING *
      `;

      const validationResult = await client.query(validationInsert, [
        ticket.id,
        validation.line_id || null,
        validation.stop_id || null,
        validation.validator_device_id || null,
        ValidationMethod.QR_SCAN
      ]);

      // Mettre à jour le ticket
      const newTripsRemaining = ticket.trips_remaining - 1;
      const newStatus = newTripsRemaining <= 0 ? TicketStatus.USED : ticket.status;

      await client.query(
        'UPDATE sotral_tickets SET trips_remaining = $1, status = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3',
        [newTripsRemaining, newStatus, ticket.id]
      );

      await client.query('COMMIT');

      const updatedTicket = await this.getTicketById(ticket.id);
      
      return {
        success: true,
        ticket: updatedTicket!,
        validation: validationResult.rows[0],
        message: 'Ticket validé avec succès'
      };

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // ==========================================
  // GESTION DES TICKETS UTILISATEUR
  // ==========================================

  async getUserTickets(userId: number): Promise<SotralTicketWithDetails[]> {
    const client = await pool.connect();
    try {
      const query = `
        SELECT 
          t.*,
          tt.name as ticket_type_name,
          tt.code as ticket_type_code,
          tt.description as ticket_type_description,
          l.name as line_name,
          l.line_number,
          sf.name as stop_from_name,
          st.name as stop_to_name
        FROM sotral_tickets t
        LEFT JOIN sotral_ticket_types tt ON t.ticket_type_id = tt.id
        LEFT JOIN sotral_lines l ON t.line_id = l.id
        LEFT JOIN sotral_stops sf ON t.stop_from_id = sf.id
        LEFT JOIN sotral_stops st ON t.stop_to_id = st.id
        WHERE t.user_id = $1
        ORDER BY t.created_at DESC
      `;
      
      const result = await client.query(query, [userId]);
      return result.rows.map(this.mapTicketWithDetails);
    } finally {
      client.release();
    }
  }

  async getTicketById(id: number): Promise<SotralTicketWithDetails | null> {
    const client = await pool.connect();
    try {
      const query = `
        SELECT 
          t.*,
          tt.name as ticket_type_name,
          tt.code as ticket_type_code,
          tt.description as ticket_type_description,
          l.name as line_name,
          l.line_number,
          sf.name as stop_from_name,
          st.name as stop_to_name
        FROM sotral_tickets t
        LEFT JOIN sotral_ticket_types tt ON t.ticket_type_id = tt.id
        LEFT JOIN sotral_lines l ON t.line_id = l.id
        LEFT JOIN sotral_stops sf ON t.stop_from_id = sf.id
        LEFT JOIN sotral_stops st ON t.stop_to_id = st.id
        WHERE t.id = $1
      `;
      
      const result = await client.query(query, [id]);
      return result.rows.length > 0 ? this.mapTicketWithDetails(result.rows[0]) : null;
    } finally {
      client.release();
    }
  }

  // ==========================================
  // STATISTIQUES POUR L'ADMIN
  // ==========================================

  async getAdminStats(dateFrom?: Date, dateTo?: Date): Promise<SotralStats> {
    const client = await pool.connect();
    try {
      const dateFilter = dateFrom && dateTo 
        ? 'AND t.purchased_at BETWEEN $1 AND $2'
        : '';
      const params = dateFrom && dateTo ? [dateFrom, dateTo] : [];

      // Statistiques générales
      const generalQuery = `
        SELECT 
          COUNT(*) as total_tickets,
          SUM(price_paid_fcfa) as total_revenue,
          COUNT(DISTINCT user_id) as active_users
        FROM sotral_tickets t
        WHERE 1=1 ${dateFilter}
      `;

      const generalResult = await client.query(generalQuery, params);
      const general = generalResult.rows[0];

      // Lignes populaires
      const popularLinesQuery = `
        SELECT 
          l.id as line_id,
          l.name as line_name,
          COUNT(t.id) as tickets_count,
          SUM(t.price_paid_fcfa) as revenue_fcfa
        FROM sotral_tickets t
        JOIN sotral_lines l ON t.line_id = l.id
        WHERE 1=1 ${dateFilter}
        GROUP BY l.id, l.name
        ORDER BY tickets_count DESC
        LIMIT 10
      `;

      const popularLinesResult = await client.query(popularLinesQuery, params);

      // Ventes quotidiennes (derniers 30 jours)
      const dailySalesQuery = `
        SELECT 
          DATE(purchased_at) as date,
          COUNT(*) as tickets_count,
          SUM(price_paid_fcfa) as revenue_fcfa
        FROM sotral_tickets
        WHERE purchased_at >= CURRENT_DATE - INTERVAL '30 days'
        GROUP BY DATE(purchased_at)
        ORDER BY date DESC
      `;

      const dailySalesResult = await client.query(dailySalesQuery);

      // Distribution des types de tickets
      const ticketTypesQuery = `
        SELECT 
          tt.name as type_name,
          COUNT(t.id) as count,
          ROUND(COUNT(t.id) * 100.0 / SUM(COUNT(t.id)) OVER(), 2) as percentage
        FROM sotral_tickets t
        JOIN sotral_ticket_types tt ON t.ticket_type_id = tt.id
        WHERE 1=1 ${dateFilter}
        GROUP BY tt.name
        ORDER BY count DESC
      `;

      const ticketTypesResult = await client.query(ticketTypesQuery, params);

      return {
        total_tickets_sold: parseInt(general.total_tickets) || 0,
        total_revenue_fcfa: parseFloat(general.total_revenue) || 0,
        active_users: parseInt(general.active_users) || 0,
        popular_lines: popularLinesResult.rows.map((row: any) => ({
          line_id: row.line_id,
          line_name: row.line_name,
          tickets_count: parseInt(row.tickets_count),
          revenue_fcfa: parseFloat(row.revenue_fcfa)
        })),
        daily_sales: dailySalesResult.rows.map((row: any) => ({
          date: row.date,
          tickets_count: parseInt(row.tickets_count),
          revenue_fcfa: parseFloat(row.revenue_fcfa)
        })),
        ticket_types_distribution: ticketTypesResult.rows.map((row: any) => ({
          type_name: row.type_name,
          count: parseInt(row.count),
          percentage: parseFloat(row.percentage)
        }))
      };
    } finally {
      client.release();
    }
  }

  // ==========================================
  // MÉTHODES ADMIN POUR LA GESTION DES LIGNES
  // ==========================================

  async createLine(lineData: Partial<SotralLine>): Promise<SotralLine> {
    const client = await pool.connect();
    try {
      const query = `
        INSERT INTO sotral_lines (
          line_number, name, route_from, route_to, 
          category_id, distance_km, stops_count, is_active
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
      `;
      
      const values = [
        lineData.line_number,
        lineData.name,
        lineData.route_from,
        lineData.route_to,
        lineData.category_id,
        lineData.distance_km,
        lineData.stops_count,
        lineData.is_active ?? true
      ];
      
      const result = await client.query(query, values);
      return result.rows[0];
    } finally {
      client.release();
    }
  }

  async updateLine(id: number, lineData: Partial<SotralLine>): Promise<SotralLine | null> {
    const client = await pool.connect();
    try {
      const updateFields = [];
      const values = [];
      let paramCount = 1;

      if (lineData.line_number !== undefined) {
        updateFields.push(`line_number = $${paramCount++}`);
        values.push(lineData.line_number);
      }
      if (lineData.name !== undefined) {
        updateFields.push(`name = $${paramCount++}`);
        values.push(lineData.name);
      }
      if (lineData.route_from !== undefined) {
        updateFields.push(`route_from = $${paramCount++}`);
        values.push(lineData.route_from);
      }
      if (lineData.route_to !== undefined) {
        updateFields.push(`route_to = $${paramCount++}`);
        values.push(lineData.route_to);
      }
      if (lineData.distance_km !== undefined) {
        updateFields.push(`distance_km = $${paramCount++}`);
        values.push(lineData.distance_km);
      }
      if (lineData.stops_count !== undefined) {
        updateFields.push(`stops_count = $${paramCount++}`);
        values.push(lineData.stops_count);
      }
      if (lineData.is_active !== undefined) {
        updateFields.push(`is_active = $${paramCount++}`);
        values.push(lineData.is_active);
      }

      if (updateFields.length === 0) {
        throw new Error('Aucun champ à mettre à jour');
      }

      updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
      values.push(id);

      const query = `
        UPDATE sotral_lines 
        SET ${updateFields.join(', ')}
        WHERE id = $${paramCount}
        RETURNING *
      `;
      
      const result = await client.query(query, values);
      return result.rows.length > 0 ? result.rows[0] : null;
    } finally {
      client.release();
    }
  }

  async deleteLine(id: number): Promise<boolean> {
    const client = await pool.connect();
    try {
      // Plutôt que supprimer, on désactive la ligne
      const query = `
        UPDATE sotral_lines 
        SET is_active = false, updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
      `;
      
      const result = await client.query(query, [id]);
      return (result.rowCount || 0) > 0;
    } finally {
      client.release();
    }
  }

  async createStop(stopData: Partial<SotralStop>): Promise<SotralStop> {
    const client = await pool.connect();
    try {
      const query = `
        INSERT INTO sotral_stops (
          name, code, latitude, longitude, address, 
          is_major_stop, is_active
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
      `;
      
      const values = [
        stopData.name,
        stopData.code,
        stopData.latitude,
        stopData.longitude,
        stopData.address,
        stopData.is_major_stop ?? false,
        stopData.is_active ?? true
      ];
      
      const result = await client.query(query, values);
      return result.rows[0];
    } finally {
      client.release();
    }
  }

  async createTicketType(ticketTypeData: Partial<SotralTicketType>): Promise<SotralTicketType> {
    const client = await pool.connect();
    try {
      const query = `
        INSERT INTO sotral_ticket_types (
          name, code, description, price_fcfa, 
          validity_duration_hours, max_trips, 
          is_student_discount, is_active
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
      `;
      
      const values = [
        ticketTypeData.name,
        ticketTypeData.code,
        ticketTypeData.description,
        ticketTypeData.price_fcfa,
        ticketTypeData.validity_duration_hours,
        ticketTypeData.max_trips ?? 1,
        ticketTypeData.is_student_discount ?? false,
        ticketTypeData.is_active ?? true
      ];
      
      const result = await client.query(query, values);
      return result.rows[0];
    } finally {
      client.release();
    }
  }

  async generateTicketsForLine(
    lineId: number, 
    ticketTypeCode: string, 
    quantity: number, 
    validityHours: number = 24
  ): Promise<SotralTicket[]> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Récupérer le type de ticket
      const ticketTypeQuery = `
        SELECT * FROM sotral_ticket_types 
        WHERE code = $1 AND is_active = true
      `;
      const ticketTypeResult = await client.query(ticketTypeQuery, [ticketTypeCode]);
      
      if (ticketTypeResult.rows.length === 0) {
        throw new Error(`Type de ticket '${ticketTypeCode}' non trouvé`);
      }
      
      const ticketType = ticketTypeResult.rows[0];

      // Récupérer la ligne
      const lineQuery = `SELECT * FROM sotral_lines WHERE id = $1 AND is_active = true`;
      const lineResult = await client.query(lineQuery, [lineId]);
      
      if (lineResult.rows.length === 0) {
        throw new Error(`Ligne ${lineId} non trouvée`);
      }

      const line = lineResult.rows[0];

      // Calculer le prix selon la distance
      const isStudent = ticketType.is_student_discount;
      const price = isStudent ? SOTRAL_CONFIG.STUDENT_PRICE_FCFA : 
        this.calculatePriceByDistance(line.distance_km);

      // Générer les tickets
      const generatedTickets: SotralTicket[] = [];
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + validityHours);

      for (let i = 0; i < quantity; i++) {
        const ticketCode = await this.generateTicketCode();
        const qrCode = await this.generateQRCode(ticketCode);

        const insertQuery = `
          INSERT INTO sotral_tickets (
            ticket_code, qr_code, ticket_type_id, line_id,
            price_paid_fcfa, status, expires_at, trips_remaining
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          RETURNING *
        `;

        const values = [
          ticketCode,
          qrCode,
          ticketType.id,
          lineId,
          price,
          'active',
          expiresAt,
          ticketType.max_trips
        ];

        const result = await client.query(insertQuery, values);
        generatedTickets.push(result.rows[0]);
      }

      await client.query('COMMIT');
      return generatedTickets;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async getAllTicketsWithFilters(
    page: number,
    limit: number,
    filters: {
      status?: string;
      lineId?: number;
      userId?: number;
      dateFrom?: Date;
      dateTo?: Date;
    }
  ): Promise<{ data: SotralTicketWithDetails[]; total: number }> {
    const client = await pool.connect();
    try {
      const conditions = [];
      const values = [];
      let paramCount = 1;

      if (filters.status) {
        conditions.push(`t.status = $${paramCount++}`);
        values.push(filters.status);
      }
      if (filters.lineId) {
        conditions.push(`t.line_id = $${paramCount++}`);
        values.push(filters.lineId);
      }
      if (filters.userId) {
        conditions.push(`t.user_id = $${paramCount++}`);
        values.push(filters.userId);
      }
      if (filters.dateFrom) {
        conditions.push(`t.created_at >= $${paramCount++}`);
        values.push(filters.dateFrom);
      }
      if (filters.dateTo) {
        conditions.push(`t.created_at <= $${paramCount++}`);
        values.push(filters.dateTo);
      }

      const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
      
      // Compter le total
      const countQuery = `
        SELECT COUNT(*) as total
        FROM sotral_tickets t
        ${whereClause}
      `;
      
      const countResult = await client.query(countQuery, values);
      const total = parseInt(countResult.rows[0].total);

      // Récupérer les tickets avec pagination
      const offset = (page - 1) * limit;
      values.push(limit, offset);

      const dataQuery = `
        SELECT 
          t.*,
          tt.name as ticket_type_name,
          tt.code as ticket_type_code,
          l.name as line_name,
          l.line_number,
          sf.name as stop_from_name,
          st.name as stop_to_name,
          u.name as user_name,
          u.email as user_email
        FROM sotral_tickets t
        LEFT JOIN sotral_ticket_types tt ON t.ticket_type_id = tt.id
        LEFT JOIN sotral_lines l ON t.line_id = l.id
        LEFT JOIN sotral_stops sf ON t.stop_from_id = sf.id
        LEFT JOIN sotral_stops st ON t.stop_to_id = st.id
        LEFT JOIN users u ON t.user_id = u.id
        ${whereClause}
        ORDER BY t.created_at DESC
        LIMIT $${paramCount++} OFFSET $${paramCount++}
      `;

      const dataResult = await client.query(dataQuery, values);
      const tickets = dataResult.rows.map(row => this.mapTicketWithDetails(row));

      return { data: tickets, total };
    } finally {
      client.release();
    }
  }

  private calculatePriceByDistance(distanceKm: number): number {
    for (const zone of SOTRAL_CONFIG.PRICE_ZONES) {
      if (distanceKm <= zone.max_km) {
        return zone.price;
      }
    }
    return SOTRAL_CONFIG.PRICE_ZONES[SOTRAL_CONFIG.PRICE_ZONES.length - 1].price;
  }

  // ==========================================
  // MÉTHODES UTILITAIRES PRIVÉES
  // ==========================================

  private async generateTicketCode(): Promise<string> {
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 999999).toString().padStart(6, '0');
    return `SOT${timestamp.slice(-8)}${random}`;
  }

  private async generateQRCode(ticketCode: string): Promise<string> {
    // En production, utiliser une vraie librairie QR
    return `data:text/plain;base64,${Buffer.from(ticketCode).toString('base64')}`;
  }

  private mapTicketWithDetails(row: any): SotralTicketWithDetails {
    return {
      id: row.id,
      ticket_code: row.ticket_code,
      qr_code: row.qr_code,
      user_id: row.user_id,
      ticket_type_id: row.ticket_type_id,
      line_id: row.line_id,
      stop_from_id: row.stop_from_id,
      stop_to_id: row.stop_to_id,
      price_paid_fcfa: row.price_paid_fcfa,
      status: row.status,
      purchased_at: row.purchased_at,
      expires_at: row.expires_at,
      trips_remaining: row.trips_remaining,
      payment_method: row.payment_method,
      payment_reference: row.payment_reference,
      created_at: row.created_at,
      updated_at: row.updated_at,
      ticket_type: row.ticket_type_name ? {
        id: row.ticket_type_id,
        name: row.ticket_type_name,
        code: row.ticket_type_code,
        description: row.ticket_type_description,
        price_fcfa: 0, // À récupérer séparément si nécessaire
        max_trips: 1,
        is_student_discount: false,
        is_active: true
      } : undefined,
      line: row.line_name ? {
        id: row.line_id,
        name: row.line_name,
        line_number: row.line_number,
        route_from: '',
        route_to: '',
        category_id: 0,
        is_active: true
      } : undefined,
      stop_from: row.stop_from_name ? {
        id: row.stop_from_id,
        name: row.stop_from_name,
        code: '',
        is_major_stop: false,
        is_active: true
      } : undefined,
      stop_to: row.stop_to_name ? {
        id: row.stop_to_id,
        name: row.stop_to_name,
        code: '',
        is_major_stop: false,
        is_active: true
      } : undefined
    };
  }
}

export const sotralRepository = new SotralRepository();