import { Request, Response } from 'express';
import { sotralRepository } from './sotral.repository';
import pool from '../../shared/database/client';
import {
  SotralTicketPurchaseSchema,
  QRCodeValidationSchema,
  SotralTicketPurchase,
  QRCodeValidation
} from './sotral.types';
import { realtimeService } from '../../services/realtime.service';

export class SotralController {

  // ==========================================
  // ENDPOINTS PUBLICS POUR LE FRONT
  // ==========================================

  /**
   * GET /api/sotral/lines
   * Récupérer toutes les lignes SOTRAL
   */
  async getAllLines(req: Request, res: Response): Promise<void> {
    try {
      const includeInactive = req.query.includeInactive === 'true' || req.query.includeInactive === '1';
      const lines = await sotralRepository.getAllLines(includeInactive as boolean);
      res.json({
        success: true,
        data: lines,
        count: lines.length
      });
    } catch (error) {
      console.error('Erreur getAllLines:', error);
      res.status(500).json({
        success: false,
        error: 'Erreur lors de la récupération des lignes'
      });
    }
  }

  /**
   * GET /api/sotral/lines/:id
   * Récupérer une ligne par ID
   */
  async getLineById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const line = await sotralRepository.getLineById(parseInt(id));
      
      if (!line) {
        res.status(404).json({
          success: false,
          error: 'Ligne non trouvée'
        });
        return;
      }

      res.json({
        success: true,
        data: line
      });
    } catch (error) {
      console.error('Erreur getLineById:', error);
      res.status(500).json({
        success: false,
        error: 'Erreur lors de la récupération de la ligne'
      });
    }
  }

  /**
   * GET /api/sotral/lines/category/:categoryId
   * Récupérer les lignes par catégorie
   */
  async getLinesByCategory(req: Request, res: Response): Promise<void> {
    try {
      const { categoryId } = req.params;
      const lines = await sotralRepository.getLinesByCategory(parseInt(categoryId));
      
      res.json({
        success: true,
        data: lines,
        count: lines.length
      });
    } catch (error) {
      console.error('Erreur getLinesByCategory:', error);
      res.status(500).json({
        success: false,
        error: 'Erreur lors de la récupération des lignes'
      });
    }
  }

  /**
   * GET /api/sotral/stops
   * Récupérer tous les arrêts
   */
  async getAllStops(req: Request, res: Response): Promise<void> {
    try {
      const stops = await sotralRepository.getAllStops();
      res.json({
        success: true,
        data: stops,
        count: stops.length
      });
    } catch (error) {
      console.error('Erreur getAllStops:', error);
      res.status(500).json({
        success: false,
        error: 'Erreur lors de la récupération des arrêts'
      });
    }
  }

  /**
   * GET /api/sotral/lines/:id/stops
   * Récupérer les arrêts d'une ligne
   */
  async getStopsByLine(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const stops = await sotralRepository.getStopsByLine(parseInt(id));
      
      res.json({
        success: true,
        data: stops,
        count: stops.length
      });
    } catch (error) {
      console.error('Erreur getStopsByLine:', error);
      res.status(500).json({
        success: false,
        error: 'Erreur lors de la récupération des arrêts'
      });
    }
  }

  /**
   * GET /api/sotral/ticket-types
   * Récupérer tous les types de tickets
   */
  async getAllTicketTypes(req: Request, res: Response): Promise<void> {
    try {
      const ticketTypes = await sotralRepository.getAllTicketTypes();
      res.json({
        success: true,
        data: ticketTypes,
        count: ticketTypes.length
      });
    } catch (error) {
      console.error('Erreur getAllTicketTypes:', error);
      res.status(500).json({
        success: false,
        error: 'Erreur lors de la récupération des types de tickets'
      });
    }
  }

  /**
   * POST /api/sotral/calculate-price
   * Calculer le prix d'un ticket
   */
  async calculatePrice(req: Request, res: Response): Promise<void> {
    try {
      const { lineId, stopFromId, stopToId, isStudent } = req.body;
      
      const pricing = await sotralRepository.calculatePrice(
        lineId,
        stopFromId,
        stopToId,
        isStudent || false
      );
      
      res.json({
        success: true,
        data: pricing
      });
    } catch (error) {
      console.error('Erreur calculatePrice:', error);
      res.status(500).json({
        success: false,
        error: 'Erreur lors du calcul du prix'
      });
    }
  }

  /**
   * POST /api/sotral/purchase
   * Acheter un ticket
   */
  async purchaseTicket(req: Request, res: Response): Promise<void> {
    try {
      // Validation des données
      const validationResult = SotralTicketPurchaseSchema.safeParse(req.body);
      if (!validationResult.success) {
        res.status(400).json({
          success: false,
          error: 'Données de commande invalides',
          details: validationResult.error.issues
        });
        return;
      }

      const purchaseData: SotralTicketPurchase = validationResult.data;
      const userId = (req as any).user?.id || null; // De l'authentification

      const ticket = await sotralRepository.purchaseTicket(userId, purchaseData);
      
      // Diffuser l'événement temps réel pour l'achat de ticket
      realtimeService.broadcast('sotral_ticket_purchased', {
        user_id: userId,
        ticket_id: ticket.id,
        line_id: purchaseData.line_id,
        ticket_type_code: purchaseData.ticket_type_code
      });
      
      res.status(201).json({
        success: true,
        data: ticket,
        message: 'Ticket acheté avec succès'
      });
    } catch (error) {
      console.error('Erreur purchaseTicket:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Erreur lors de l\'achat du ticket'
      });
    }
  }

  /**
   * GET /api/sotral/my-tickets
   * Récupérer les tickets de l'utilisateur connecté
   */
  async getMyTickets(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        res.status(401).json({
          success: false,
          error: 'Authentification requise'
        });
        return;
      }

      const tickets = await sotralRepository.getUserTickets(userId);

      res.json({
        success: true,
        data: tickets,
        count: tickets.length
      });
    } catch (error) {
      console.error('Erreur getMyTickets:', error);
      res.status(500).json({
        success: false,
        error: 'Erreur lors de la récupération des tickets'
      });
    }
  }

  /**
   * DELETE /api/sotral/my-tickets/:id
   * Annuler un ticket utilisateur
   */
  async cancelUserTicket(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        res.status(401).json({
          success: false,
          error: 'Authentification requise'
        });
        return;
      }

      const ticketId = parseInt(req.params.id);
      if (!ticketId) {
        res.status(400).json({
          success: false,
          error: 'ID de ticket requis'
        });
        return;
      }

      const ticket = await sotralRepository.getTicketById(ticketId);
      if (!ticket) {
        res.status(404).json({
          success: false,
          error: 'Ticket non trouvé'
        });
        return;
      }

      // Vérifier que le ticket appartient à l'utilisateur
      if (ticket.user_id !== userId) {
        res.status(403).json({
          success: false,
          error: 'Accès non autorisé à ce ticket'
        });
        return;
      }

      // Vérifier que le ticket peut être annulé (actif et non utilisé)
      if (ticket.status !== 'active') {
        res.status(400).json({
          success: false,
          error: 'Seuls les tickets actifs peuvent être annulés'
        });
        return;
      }

      // Annuler le ticket (mettre à jour le statut à 'cancelled')
      const client = await pool.connect();
      try {
        await client.query('BEGIN');

        const updateQuery = `
          UPDATE sotral_tickets SET
            status = 'cancelled',
            updated_at = CURRENT_TIMESTAMP
          WHERE id = $1 AND user_id = $2 AND status = 'active'
        `;

        const updateResult = await client.query(updateQuery, [ticketId, userId]);

        if (updateResult.rowCount === 0) {
          await client.query('ROLLBACK');
          res.status(404).json({
            success: false,
            error: 'Ticket non trouvé ou déjà annulé'
          });
          return;
        }

        await client.query('COMMIT');

        // Diffuser l'événement temps réel pour l'annulation du ticket
        realtimeService.broadcast('sotral_ticket_cancelled', {
          ticket_id: ticketId,
          user_id: userId,
          previous_status: ticket.status,
          new_status: 'cancelled'
        });

        res.json({
          success: true,
          message: 'Ticket annulé avec succès'
        });
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('Erreur cancelUserTicket:', error);
      res.status(500).json({
        success: false,
        error: 'Erreur lors de l\'annulation du ticket'
      });
    }
  }

  // ==========================================
  // ENDPOINTS POUR LE SCANNER
  // ==========================================

  /**
   * POST /api/sotral/validate-ticket
   * Valider un ticket via QR code
   */
  async validateTicket(req: Request, res: Response): Promise<void> {
    try {
      // Validation des données
      const validationResult = QRCodeValidationSchema.safeParse(req.body);
      if (!validationResult.success) {
        res.status(400).json({
          success: false,
          error: 'Données de validation invalides',
          details: validationResult.error.issues
        });
        return;
      }

      const validationData: QRCodeValidation = validationResult.data;
      const result = await sotralRepository.validateTicketByQR(validationData);
      
      // Si la validation a réussi, diffuser l'événement temps réel
      if (result.success && result.ticket) {
        realtimeService.broadcast('sotral_ticket_validated', {
          ticket_code: validationData.ticket_code,
          validator_device_id: validationData.validator_device_id,
          ticket_id: result.ticket.id,
          previous_status: result.ticket.status,
          new_status: 'used'
        });
      }
      
      const statusCode = result.success ? 200 : 400;
      res.status(statusCode).json(result);
    } catch (error) {
      console.error('Erreur validateTicket:', error);
      res.status(500).json({
        success: false,
        error: 'Erreur lors de la validation du ticket'
      });
    }
  }

  /**
   * GET /api/sotral/ticket/:code
   * Récupérer les détails d'un ticket par code
   */
  async getTicketByCode(req: Request, res: Response): Promise<void> {
    try {
      const { code } = req.params;
      
      // Note: Cette méthode nécessiterait d'être ajoutée au repository
      // Pour l'instant, on peut utiliser la validation sans vraiment valider
      const result = await sotralRepository.validateTicketByQR({
        ticket_code: code,
        validator_device_id: 'info-only'
      });
      
      if (result.success && result.ticket) {
        res.json({
          success: true,
          data: result.ticket
        });
      } else {
        res.status(404).json({
          success: false,
          error: result.message || 'Ticket non trouvé'
        });
      }
    } catch (error) {
      console.error('Erreur getTicketByCode:', error);
      res.status(500).json({
        success: false,
        error: 'Erreur lors de la récupération du ticket'
      });
    }
  }

  // ==========================================
  // ENDPOINTS ADMIN
  // ==========================================

  /**
   * GET /api/admin/sotral/stats
   * Statistiques pour l'admin
   */
  async getAdminStats(req: Request, res: Response): Promise<void> {
    try {
      const { dateFrom, dateTo } = req.query;
      
      const dateFromObj = dateFrom ? new Date(dateFrom as string) : undefined;
      const dateToObj = dateTo ? new Date(dateTo as string) : undefined;
      
      const stats = await sotralRepository.getAdminStats(dateFromObj, dateToObj);
      
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Erreur getAdminStats:', error);
      res.status(500).json({
        success: false,
        error: 'Erreur lors de la récupération des statistiques'
      });
    }
  }

  /**
   * GET /api/admin/sotral/tickets
   * Récupérer tous les tickets (admin)
   */
  async getAllTicketsAdmin(req: Request, res: Response): Promise<void> {
    try {
      const { page = 1, limit = 50, status, userId } = req.query;
      
      // Cette méthode nécessiterait d'être implémentée dans le repository
      // Pour l'instant, retourner une réponse basique
      res.json({
        success: true,
        data: [],
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total: 0
        },
        message: 'Endpoint en cours de développement'
      });
    } catch (error) {
      console.error('Erreur getAllTicketsAdmin:', error);
      res.status(500).json({
        success: false,
        error: 'Erreur lors de la récupération des tickets'
      });
    }
  }

  /**
   * GET /api/admin/sotral/users/:userId/tickets
   * Récupérer les tickets d'un utilisateur (admin)
   */
  async getUserTicketsAdmin(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const tickets = await sotralRepository.getUserTickets(parseInt(userId));
      
      res.json({
        success: true,
        data: tickets,
        count: tickets.length
      });
    } catch (error) {
      console.error('Erreur getUserTicketsAdmin:', error);
      res.status(500).json({
        success: false,
        error: 'Erreur lors de la récupération des tickets utilisateur'
      });
    }
  }

  // ==========================================
  // HEALTH CHECK
  // ==========================================

  /**
   * GET /api/sotral/generated-tickets
   * Récupérer les tickets générés par l'admin pour l'affichage mobile public
   */
  async getGeneratedTickets(req: Request, res: Response): Promise<void> {
    try {
      const { 
        lineId, 
        ticketTypeCode,
        page = 1, 
        limit = 20 
      } = req.query;

      const options = {
        lineId: lineId ? parseInt(lineId as string) : undefined,
        ticketTypeCode: ticketTypeCode as string,
        page: parseInt(page as string),
        limit: Math.min(parseInt(limit as string), 50) // Limiter à 50 max
      };

      const result = await sotralRepository.getPublicGeneratedTickets(options);
      
      res.json({
        success: true,
        data: result.data,
        pagination: {
          page: options.page,
          limit: options.limit,
          total: result.total,
          totalPages: Math.ceil(result.total / options.limit)
        },
        count: result.data.length
      });
    } catch (error) {
      console.error('Erreur getGeneratedTickets:', error);
      res.status(500).json({
        success: false,
        error: 'Erreur lors de la récupération des tickets générés'
      });
    }
  }

  /**
   * DELETE /api/admin/sotral/tickets/:id
   * Supprimer définitivement un ticket (admin)
   */
  async deleteTicketAdmin(req: Request, res: Response): Promise<void> {
    try {
      const ticketId = parseInt(req.params.id);
      if (!ticketId) {
        res.status(400).json({
          success: false,
          error: 'ID de ticket requis'
        });
        return;
      }

      // Vérifier que le ticket existe
      const ticket = await sotralRepository.getTicketById(ticketId);
      if (!ticket) {
        res.status(404).json({
          success: false,
          error: 'Ticket non trouvé'
        });
        return;
      }

      // Supprimer définitivement le ticket
      const client = await pool.connect();
      try {
        await client.query('BEGIN');

        const deleteQuery = 'DELETE FROM sotral_tickets WHERE id = $1';
        const deleteResult = await client.query(deleteQuery, [ticketId]);

        if (deleteResult.rowCount === 0) {
          await client.query('ROLLBACK');
          res.status(404).json({
            success: false,
            error: 'Ticket non trouvé'
          });
          return;
        }

        await client.query('COMMIT');

        // Diffuser l'événement temps réel pour la suppression du ticket
        realtimeService.broadcast('sotral_ticket_deleted', {
          ticket_id: ticketId,
          admin_user_id: (req as any).user?.id
        });

        res.json({
          success: true,
          message: 'Ticket supprimé définitivement avec succès'
        });
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('Erreur deleteTicketAdmin:', error);
      res.status(500).json({
        success: false,
        error: 'Erreur lors de la suppression du ticket'
      });
    }
  }

  /**
   * GET /api/sotral/health
   * Vérification de l'état du service
   */
  async healthCheck(req: Request, res: Response): Promise<void> {
    try {
      // Tester une requête simple
      const lines = await sotralRepository.getAllLines();

      res.json({
        success: true,
        service: 'SOTRAL API',
        status: 'healthy',
        timestamp: new Date().toISOString(),
        data: {
          total_lines: lines.length,
          database: 'connected'
        }
      });
    } catch (error) {
      console.error('Erreur healthCheck:', error);
      res.status(500).json({
        success: false,
        service: 'SOTRAL API',
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: 'Database connection failed'
      });
    }
  }
}

export const sotralController = new SotralController();
