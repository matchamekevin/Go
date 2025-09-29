import { Request, Response } from 'express';
import { sotralRepository } from '../sotral/sotral.repository';
import { SotralLineSchema, SotralStopSchema, SotralTicketTypeSchema } from '../sotral/sotral.types';
import pool from '../../shared/database/client';

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

      // Émettre un événement temps réel - Désactivé (WebSocket supprimé)
      // await realtimeService.broadcastDataChange({
      //   type: 'line_created',
      //   data: newLine,
      //   timestamp: new Date(),
      //   userId: (req as any).user?.id
      // });
      
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

      // Émettre un événement temps réel - Désactivé (WebSocket supprimé)
      // await realtimeService.broadcastDataChange({
      //   type: 'line_updated',
      //   data: updatedLine,
      //   timestamp: new Date(),
      //   userId: (req as any).user?.id
      // });

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

      // Émettre un événement temps réel - Désactivé (WebSocket supprimé)
      // await realtimeService.broadcastDataChange({
      //   type: 'line_deleted',
      //   data: { id: parseInt(id) },
      //   timestamp: new Date(),
      //   userId: (req as any).user?.id
      // });

      res.json({
        success: true,
        message: 'Ligne supprimée définitivement avec succès'
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

      // Émettre un événement temps réel - Désactivé (WebSocket supprimé)
      // await realtimeService.broadcastDataChange({
      //   type: 'line_updated',
      //   data: updatedLine,
      //   timestamp: new Date(),
      //   userId: (req as any).user?.id
      // });

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

      // Émettre un événement temps réel - Désactivé (WebSocket supprimé)
      // await realtimeService.broadcastDataChange({
      //   type: 'ticket_type_created',
      //   data: newTicketType,
      //   timestamp: new Date(),
      //   userId: (req as any).user?.id
      // });
      
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
        validityHours = 24,
        price_fcfa // Prix personnalisé saisi par l'utilisateur
      } = req.body;

      if (!lineId || !ticketTypeCode) {
        res.status(400).json({
          success: false,
          error: 'lineId et ticketTypeCode sont requis'
        });
        return;
      }

      // Mapper les nouveaux codes vers les vrais codes de types de tickets
      let actualTicketTypeCode = ticketTypeCode;
      if (ticketTypeCode === 'ordinaires') {
        actualTicketTypeCode = 'SIMPLE';
      } else if (ticketTypeCode === 'etudiantes') {
        actualTicketTypeCode = 'STUDENT';
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

      // Générer les tickets avec le prix personnalisé si fourni
      const generatedTickets = await sotralRepository.generateTicketsForLine(
        lineId,
        actualTicketTypeCode,
        quantity,
        validityHours,
        price_fcfa ? parseInt(price_fcfa) : undefined
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
        validityHours = 24,
        price_fcfa // Prix personnalisé saisi par l'utilisateur
      } = req.body;

      // Mapper les nouveaux codes vers les vrais codes de types de tickets
      let actualTicketTypeCode = ticketTypeCode;
      if (ticketTypeCode === 'ordinaires') {
        actualTicketTypeCode = 'SIMPLE';
      } else if (ticketTypeCode === 'etudiantes') {
        actualTicketTypeCode = 'STUDENT';
      }

      // Récupérer toutes les lignes actives
      const lines = await sotralRepository.getAllLines();
      const activeLines = lines.filter(line => line.is_active);

      const results = [];

      for (const line of activeLines) {
        try {
          const generatedTickets = await sotralRepository.generateTicketsForLine(
            line.id!,
            actualTicketTypeCode,
            quantityPerLine,
            validityHours,
            price_fcfa ? parseInt(price_fcfa) : undefined
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
      
      // Récupérer les catégories de lignes
      const client = await pool.connect();
      const categoriesQuery = 'SELECT COUNT(*) as count FROM sotral_line_categories';
      const categoriesResult = await client.query(categoriesQuery);
      const totalCategories = parseInt(categoriesResult.rows[0].count);
      client.release();

      const enhancedStats = {
        ...stats,
        infrastructure: {
          total_lines: lines.length,
          active_lines: lines.filter(l => l.is_active).length,
          total_stops: stops.length,
          active_stops: stops.filter(s => s.is_active).length,
          ticket_types: totalCategories  // Nombre de catégories de lignes
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
   * Récupérer tous les tickets avec filtres et pagination pour l'admin
   */
  async getAllTickets(req: Request, res: Response): Promise<void> {
    try {
      const {
        page = 1,
        limit = 50,
        status,
        userId,
        dateFrom,
        dateTo
      } = req.query;

      const pageNum = parseInt(page as string) || 1;
      const limitNum = parseInt(limit as string) || 50;

      // Validation des paramètres
      if (pageNum < 1 || limitNum < 1 || limitNum > 10000) {
        res.status(400).json({
          success: false,
          error: 'Paramètres de pagination invalides'
        });
        return;
      }

      const filters = {
        status: status as string,
        lineId: undefined, // Pour l'admin, on peut ajouter ce filtre plus tard si nécessaire
        userId: userId ? parseInt(userId as string) : undefined,
        dateFrom: dateFrom ? new Date(dateFrom as string) : undefined,
        dateTo: dateTo ? new Date(dateTo as string) : undefined
      };

      const result = await sotralRepository.getAllTicketsWithFilters(pageNum, limitNum, filters);

      res.json({
        success: true,
        data: result.data,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: result.total,
          totalPages: Math.ceil(result.total / limitNum)
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

    /**
   * DELETE /admin/sotral/tickets/:id
   * Supprimer un ticket individuel
   */
  async deleteTicket(req: Request, res: Response): Promise<void> {
    const client = await pool.connect();

    try {
      const { id } = req.params;
      const ticketId = parseInt(id);

      if (isNaN(ticketId)) {
        res.status(400).json({
          success: false,
          error: 'ID de ticket invalide'
        });
        return;
      }

      // Démarrer la transaction
      await client.query('BEGIN');

      // Vérifier que le ticket existe
      const ticketQuery = 'SELECT id FROM sotral_tickets WHERE id = $1';
      const ticketResult = await client.query(ticketQuery, [ticketId]);

      if (ticketResult.rows.length === 0) {
        await client.query('ROLLBACK');
        res.status(404).json({
          success: false,
          error: 'Ticket non trouvé'
        });
        return;
      }

      // Supprimer le ticket
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

      // Valider la transaction
      await client.query('COMMIT');

      // Émettre un événement temps réel - Désactivé (WebSocket supprimé)
      // await realtimeService.broadcastDataChange({
      //   type: 'ticket_deleted',
      //   data: { id: ticketId },
      //   timestamp: new Date(),
      //   userId: (req as any).user?.id
      // });

      res.json({
        success: true,
        message: 'Ticket supprimé avec succès'
      });
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Erreur deleteTicket:', error);
      res.status(500).json({
        success: false,
        error: 'Erreur lors de la suppression du ticket'
      });
    } finally {
      client.release();
    }
  }

  /**
   * Supprimer plusieurs tickets
   */
  async deleteTickets(req: Request, res: Response): Promise<void> {
    const client = await pool.connect();

    try {
      const { ids } = req.body;

      if (!Array.isArray(ids) || ids.length === 0) {
        res.status(400).json({
          success: false,
          error: 'Aucun ID de ticket fourni'
        });
        return;
      }

      // Démarrer la transaction
      await client.query('BEGIN');

      // Convertir les IDs en nombres et filtrer les invalides
      const validIds = ids.map(id => parseInt(String(id))).filter(id => !isNaN(id));

      if (validIds.length === 0) {
        await client.query('ROLLBACK');
        res.status(400).json({
          success: false,
          error: 'Aucun ID de ticket valide fourni'
        });
        return;
      }

      // Supprimer les tickets
      const deleteQuery = 'DELETE FROM sotral_tickets WHERE id = ANY($1)';
      const deleteResult = await client.query(deleteQuery, [validIds]);

      // Valider la transaction
      await client.query('COMMIT');

      // Émettre des événements temps réel pour chaque ticket supprimé - Désactivé (WebSocket supprimé)
      // for (const id of validIds) {
      //   await realtimeService.broadcastDataChange({
      //     type: 'ticket_deleted',
      //     data: { id },
      //     timestamp: new Date(),
      //     userId: (req as any).user?.id
      //   });
      // }

      res.json({
        success: true,
        message: `${deleteResult.rowCount} ticket(s) supprimé(s) avec succès`
      });
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Erreur deleteTickets:', error);
      res.status(500).json({
        success: false,
        error: 'Erreur lors de la suppression des tickets'
      });
    } finally {
      client.release();
    }
  }
}

export const adminSotralController = new AdminSotralController();
