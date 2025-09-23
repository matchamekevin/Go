import { Request, Response } from 'express';
import { sotralRepository } from './sotral.repository';
import {
  SotralTicketPurchaseSchema,
  QRCodeValidationSchema,
  SotralTicketPurchase,
  QRCodeValidation
} from './sotral.types';

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
      const lines = await sotralRepository.getAllLines();
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