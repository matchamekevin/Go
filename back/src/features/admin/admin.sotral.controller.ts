import { Request, Response } from 'express';
import { sotralRepository } from '../sotral/sotral.repository';
import { SotralLineSchema, SotralStopSchema, SotralTicketTypeSchema } from '../sotral/sotral.types';

export class AdminSotralController {

  // ==========================================
  // GESTION DES LIGNES SOTRAL
  // ==========================================

  /**
   * GET /admin/sotral/lines
   * Récupérer toutes les lignes SOTRAL pour l'admin
   */
  async getAllLines(req: Request, res: Response): Promise<void> {
    try {
      const lines = await sotralRepository.getAllLinesForAdmin();
      
      res.json({
        success: true,
        data: lines,
        count: lines.length
      });
    } catch (error) {
      console.error('Erreur getAllLines admin:', error);
      res.status(500).json({
        success: false,
        error: 'Erreur lors de la récupération des lignes'
      });
    }
  }

  /**
   * POST /admin/sotral/lines
   * Créer une nouvelle ligne SOTRAL
   */
  async createLine(req: Request, res: Response): Promise<void> {
    try {
      const validationResult = SotralLineSchema.safeParse(req.body);
      if (!validationResult.success) {
        res.status(400).json({
          success: false,
          error: 'Données de ligne invalides',
          details: validationResult.error.issues
        });
        return;
      }

      const lineData = validationResult.data;
      const newLine = await sotralRepository.createLine(lineData);
      
      res.status(201).json({
        success: true,
        data: newLine,
        message: 'Ligne créée avec succès'
      });
    } catch (error) {
      console.error('Erreur createLine:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Erreur lors de la création de la ligne'
      });
    }
  }

  /**
   * PUT /admin/sotral/lines/:id
   * Mettre à jour une ligne SOTRAL
   */
  async updateLine(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const validationResult = SotralLineSchema.partial().safeParse(req.body);
      
      if (!validationResult.success) {
        res.status(400).json({
          success: false,
          error: 'Données de ligne invalides',
          details: validationResult.error.issues
        });
        return;
      }

      const lineData = validationResult.data;
      const updatedLine = await sotralRepository.updateLine(parseInt(id), lineData);
      
      if (!updatedLine) {
        res.status(404).json({
          success: false,
          error: 'Ligne non trouvée'
        });
        return;
      }

      res.json({
        success: true,
        data: updatedLine,
        message: 'Ligne mise à jour avec succès'
      });
    } catch (error) {
      console.error('Erreur updateLine:', error);
      res.status(500).json({
        success: false,
        error: 'Erreur lors de la mise à jour de la ligne'
      });
    }
  }

  /**
   * DELETE /admin/sotral/lines/:id
   * Supprimer une ligne SOTRAL
   */
  async deleteLine(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const deleted = await sotralRepository.deleteLine(parseInt(id));
      
      if (!deleted) {
        res.status(404).json({
          success: false,
          error: 'Ligne non trouvée'
        });
        return;
      }

      res.json({
        success: true,
        message: 'Ligne supprimée avec succès'
      });
    } catch (error) {
      console.error('Erreur deleteLine:', error);
      res.status(500).json({
        success: false,
        error: 'Erreur lors de la suppression de la ligne'
      });
    }
  }

  /**
   * POST /admin/sotral/lines/:id/toggle-status
   * Activer/désactiver une ligne
   */
  async toggleLineStatus(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      console.log('ToggleLineStatus called with id:', id);

      const line = await sotralRepository.getLineByIdForAdmin(parseInt(id));
      console.log('Line found:', line);

      if (!line) {
        console.log('Line not found, returning 404');
        res.status(404).json({
          success: false,
          error: 'Ligne non trouvée'
        });
        return;
      }

      const updatedLine = await sotralRepository.updateLine(parseInt(id), {
        is_active: !line.is_active
      });
      console.log('Line updated:', updatedLine);

      res.json({
        success: true,
        data: updatedLine,
        message: `Ligne ${updatedLine?.is_active ? 'activée' : 'désactivée'} avec succès`
      });
    } catch (error) {
      console.error('Erreur toggleLineStatus:', error);
      res.status(500).json({
        success: false,
        error: 'Erreur lors du changement de statut'
      });
    }
  }

  // ==========================================
  // GESTION DES ARRÊTS
  // ==========================================

  /**
   * GET /admin/sotral/stops
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
      console.error('Erreur getAllStops admin:', error);
      res.status(500).json({
        success: false,
        error: 'Erreur lors de la récupération des arrêts'
      });
    }
  }

  /**
   * POST /admin/sotral/stops
   * Créer un nouvel arrêt
   */
  async createStop(req: Request, res: Response): Promise<void> {
    try {
      const validationResult = SotralStopSchema.safeParse(req.body);
      if (!validationResult.success) {
        res.status(400).json({
          success: false,
          error: 'Données d\'arrêt invalides',
          details: validationResult.error.issues
        });
        return;
      }

      const stopData = validationResult.data;
      const newStop = await sotralRepository.createStop(stopData);
      
      res.status(201).json({
        success: true,
        data: newStop,
        message: 'Arrêt créé avec succès'
      });
    } catch (error) {
      console.error('Erreur createStop:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Erreur lors de la création de l\'arrêt'
      });
    }
  }

  // ==========================================
  // GESTION DES TYPES DE TICKETS
  // ==========================================

  /**
   * GET /admin/sotral/ticket-types
   * Récupérer tous les types de tickets
   */
  async getTicketTypes(req: Request, res: Response): Promise<void> {
    try {
      const ticketTypes = await sotralRepository.getAllTicketTypes();
      
      res.json({
        success: true,
        data: ticketTypes,
        count: ticketTypes.length
      });
    } catch (error) {
      console.error('Erreur getTicketTypes admin:', error);
      res.status(500).json({
        success: false,
        error: 'Erreur lors de la récupération des types de tickets'
      });
    }
  }

  /**
   * POST /admin/sotral/ticket-types
   * Créer un nouveau type de ticket
   */
  async createTicketType(req: Request, res: Response): Promise<void> {
    try {
      const validationResult = SotralTicketTypeSchema.safeParse(req.body);
      if (!validationResult.success) {
        res.status(400).json({
          success: false,
          error: 'Données de type de ticket invalides',
          details: validationResult.error.issues
        });
        return;
      }

      const ticketTypeData = validationResult.data;
      const newTicketType = await sotralRepository.createTicketType(ticketTypeData);
      
      res.status(201).json({
        success: true,
        data: newTicketType,
        message: 'Type de ticket créé avec succès'
      });
    } catch (error) {
      console.error('Erreur createTicketType:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Erreur lors de la création du type de ticket'
      });
    }
  }

  // ==========================================
  // GÉNÉRATION AUTOMATIQUE DE TICKETS
  // ==========================================

  /**
   * POST /admin/sotral/generate-tickets
   * Générer des tickets automatiquement pour une ligne
   */
  async generateTicketsForLine(req: Request, res: Response): Promise<void> {
    try {
      const { 
        lineId, 
        ticketTypeCode, 
        quantity = 100, 
        validityHours = 24 
      } = req.body;

      if (!lineId || !ticketTypeCode) {
        res.status(400).json({
          success: false,
          error: 'lineId et ticketTypeCode sont requis'
        });
        return;
      }

      // Vérifier que la ligne existe
      const line = await sotralRepository.getLineByIdForAdmin(lineId);
      if (!line) {
        res.status(404).json({
          success: false,
          error: 'Ligne non trouvée'
        });
        return;
      }

      // Générer les tickets
      const generatedTickets = await sotralRepository.generateTicketsForLine(
        lineId,
        ticketTypeCode,
        quantity,
        validityHours
      );

      res.status(201).json({
        success: true,
        data: {
          line: line,
          tickets_generated: generatedTickets.length,
          tickets: generatedTickets.slice(0, 5) // Retourner seulement les 5 premiers comme exemple
        },
        message: `${generatedTickets.length} tickets générés avec succès pour la ligne ${line.name}`
      });
    } catch (error) {
      console.error('Erreur generateTicketsForLine:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Erreur lors de la génération des tickets'
      });
    }
  }

  /**
   * POST /admin/sotral/bulk-generate-tickets
   * Générer des tickets en masse pour toutes les lignes actives
   */
  async bulkGenerateTickets(req: Request, res: Response): Promise<void> {
    try {
      const { 
        ticketTypeCode = 'SIMPLE', 
        quantityPerLine = 50, 
        validityHours = 24 
      } = req.body;

      // Récupérer toutes les lignes actives
      const lines = await sotralRepository.getAllLines();
      const activeLines = lines.filter(line => line.is_active);

      const results = [];

      for (const line of activeLines) {
        try {
          const generatedTickets = await sotralRepository.generateTicketsForLine(
            line.id!,
            ticketTypeCode,
            quantityPerLine,
            validityHours
          );

          results.push({
            line_id: line.id,
            line_name: line.name,
            tickets_generated: generatedTickets.length,
            success: true
          });
        } catch (error) {
          results.push({
            line_id: line.id,
            line_name: line.name,
            tickets_generated: 0,
            success: false,
            error: error instanceof Error ? error.message : 'Erreur inconnue'
          });
        }
      }

      const totalGenerated = results.reduce((sum, result) => sum + result.tickets_generated, 0);
      const successCount = results.filter(r => r.success).length;

      res.status(201).json({
        success: true,
        data: {
          total_lines_processed: activeLines.length,
          successful_generations: successCount,
          total_tickets_generated: totalGenerated,
          results: results
        },
        message: `Génération terminée: ${totalGenerated} tickets créés pour ${successCount}/${activeLines.length} lignes`
      });
    } catch (error) {
      console.error('Erreur bulkGenerateTickets:', error);
      res.status(500).json({
        success: false,
        error: 'Erreur lors de la génération en masse des tickets'
      });
    }
  }

  // ==========================================
  // STATISTIQUES ADMIN
  // ==========================================

  /**
   * GET /admin/sotral/dashboard-stats
   * Statistiques pour le dashboard admin SOTRAL
   */
  async getDashboardStats(req: Request, res: Response): Promise<void> {
    try {
      const { dateFrom, dateTo } = req.query;
      
      const dateFromObj = dateFrom ? new Date(dateFrom as string) : undefined;
      const dateToObj = dateTo ? new Date(dateTo as string) : undefined;
      
      const stats = await sotralRepository.getAdminStats(dateFromObj, dateToObj);
      
      // Ajouter des statistiques supplémentaires
      const lines = await sotralRepository.getAllLines();
      const ticketTypes = await sotralRepository.getAllTicketTypes();
      const stops = await sotralRepository.getAllStops();

      const enhancedStats = {
        ...stats,
        infrastructure: {
          total_lines: lines.length,
          active_lines: lines.filter(l => l.is_active).length,
          total_stops: stops.length,
          active_stops: stops.filter(s => s.is_active).length,
          ticket_types: ticketTypes.length
        }
      };
      
      res.json({
        success: true,
        data: enhancedStats
      });
    } catch (error) {
      console.error('Erreur getDashboardStats:', error);
      res.status(500).json({
        success: false,
        error: 'Erreur lors de la récupération des statistiques'
      });
    }
  }

  /**
   * GET /admin/sotral/tickets
   * Récupérer tous les tickets avec pagination
   */
  async getAllTickets(req: Request, res: Response): Promise<void> {
    try {
      const { 
        page = 1, 
        limit = 50, 
        status, 
        lineId, 
        userId,
        dateFrom,
        dateTo 
      } = req.query;

      const filters = {
        status: status as string,
        lineId: lineId ? parseInt(lineId as string) : undefined,
        userId: userId ? parseInt(userId as string) : undefined,
        dateFrom: dateFrom ? new Date(dateFrom as string) : undefined,
        dateTo: dateTo ? new Date(dateTo as string) : undefined
      };

      const tickets = await sotralRepository.getAllTicketsWithFilters(
        parseInt(page as string),
        parseInt(limit as string),
        filters
      );
      
      res.json({
        success: true,
        data: tickets.data,
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total: tickets.total,
          totalPages: Math.ceil(tickets.total / parseInt(limit as string))
        }
      });
    } catch (error) {
      console.error('Erreur getAllTickets admin:', error);
      res.status(500).json({
        success: false,
        error: 'Erreur lors de la récupération des tickets'
      });
    }
  }
}

export const adminSotralController = new AdminSotralController();