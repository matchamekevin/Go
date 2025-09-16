import { Request, Response } from 'express';
import { TicketRepository } from '../tickets/Ticket.repository';
import { RequestWithUser } from '../tickets/ticket.request';

export class AdminTicketsController {
  /**
   * [ADMIN] Créer un nouveau produit de ticket
   */
  static async createProduct(req: RequestWithUser, res: Response) {
    try {
      if (req.user?.role !== 'admin') {
        return res.status(403).json({ success: false, error: 'Accès admin requis' });
      }

      const { name, code, price, rides, is_active = true } = req.body;

      if (!name || !code || !price || !rides) {
        return res.status(400).json({ 
          success: false, 
          error: 'Nom, code, prix et trajets sont requis' 
        });
      }

      const product = await TicketRepository.createProduct({
        name,
        code,
        price: parseFloat(price),
        rides: parseInt(rides),
        is_active
      });

      return res.status(201).json({ success: true, data: product });
    } catch (error: any) {
      console.error('[AdminTicketsController.createProduct] error:', error);
      if (error.message?.includes('UNIQUE constraint')) {
        return res.status(409).json({ success: false, error: 'Un produit avec ce code existe déjà' });
      }
      return res.status(500).json({ success: false, error: 'Erreur lors de la création du produit' });
    }
  }

  /**
   * [ADMIN] Mettre à jour un produit de ticket
   */
  static async updateProduct(req: RequestWithUser, res: Response) {
    try {
      if (req.user?.role !== 'admin') {
        return res.status(403).json({ success: false, error: 'Accès admin requis' });
      }

      const { id } = req.params;
      const updates = req.body;

      const product = await TicketRepository.updateProduct(id, updates);
      
      if (!product) {
        return res.status(404).json({ success: false, error: 'Produit non trouvé' });
      }

      return res.status(200).json({ success: true, data: product });
    } catch (error) {
      console.error('[AdminTicketsController.updateProduct] error:', error);
      return res.status(500).json({ success: false, error: 'Erreur lors de la mise à jour du produit' });
    }
  }

  /**
   * [ADMIN] Supprimer un produit de ticket
   */
  static async deleteProduct(req: RequestWithUser, res: Response) {
    try {
      if (req.user?.role !== 'admin') {
        return res.status(403).json({ success: false, error: 'Accès admin requis' });
      }

      const { id } = req.params;
      const deleted = await TicketRepository.deleteProduct(id);
      
      if (!deleted) {
        return res.status(404).json({ success: false, error: 'Produit non trouvé' });
      }

      return res.status(200).json({ success: true, message: 'Produit supprimé' });
    } catch (error) {
      console.error('[AdminTicketsController.deleteProduct] error:', error);
      return res.status(500).json({ success: false, error: 'Erreur lors de la suppression du produit' });
    }
  }

  /**
   * [ADMIN] Créer une nouvelle route
   */
  static async createRoute(req: RequestWithUser, res: Response) {
    try {
      if (req.user?.role !== 'admin') {
        return res.status(403).json({ success: false, error: 'Accès admin requis' });
      }

      const { 
        name, 
        code, 
        start_point, 
        end_point, 
        price_category, 
        distance_km, 
        duration_minutes, 
        stops, 
        is_active = true 
      } = req.body;

      if (!name || !code || !start_point || !end_point || !price_category) {
        return res.status(400).json({ 
          success: false, 
          error: 'Nom, code, point de départ, arrivée et catégorie de prix sont requis' 
        });
      }

      const route = await TicketRepository.createRoute({
        name,
        code,
        start_point,
        end_point,
        price_category,
        distance_km: distance_km ? parseFloat(distance_km) : undefined,
        duration_minutes: duration_minutes ? parseInt(duration_minutes) : undefined,
        stops: Array.isArray(stops) ? stops : (stops ? JSON.parse(stops) : undefined),
        is_active
      });

      return res.status(201).json({ success: true, data: route });
    } catch (error: any) {
      console.error('[AdminTicketsController.createRoute] error:', error);
      if (error.message?.includes('UNIQUE constraint')) {
        return res.status(409).json({ success: false, error: 'Une route avec ce code existe déjà' });
      }
      return res.status(500).json({ success: false, error: 'Erreur lors de la création de la route' });
    }
  }

  /**
   * [ADMIN] Mettre à jour une route
   */
  static async updateRoute(req: RequestWithUser, res: Response) {
    try {
      if (req.user?.role !== 'admin') {
        return res.status(403).json({ success: false, error: 'Accès admin requis' });
      }

      const { id } = req.params;
      const updates = req.body;

      const route = await TicketRepository.updateRoute(id, updates);
      
      if (!route) {
        return res.status(404).json({ success: false, error: 'Route non trouvée' });
      }

      return res.status(200).json({ success: true, data: route });
    } catch (error) {
      console.error('[AdminTicketsController.updateRoute] error:', error);
      return res.status(500).json({ success: false, error: 'Erreur lors de la mise à jour de la route' });
    }
  }

  /**
   * [ADMIN] Supprimer une route
   */
  static async deleteRoute(req: RequestWithUser, res: Response) {
    try {
      if (req.user?.role !== 'admin') {
        return res.status(403).json({ success: false, error: 'Accès admin requis' });
      }

      const { id } = req.params;
      const deleted = await TicketRepository.deleteRoute(id);
      
      if (!deleted) {
        return res.status(404).json({ success: false, error: 'Route non trouvée' });
      }

      return res.status(200).json({ success: true, message: 'Route supprimée' });
    } catch (error) {
      console.error('[AdminTicketsController.deleteRoute] error:', error);
      return res.status(500).json({ success: false, error: 'Erreur lors de la suppression de la route' });
    }
  }

  /**
   * [ADMIN] Récupérer tous les tickets avec pagination et filtres
   */
  static async getAllTickets(req: RequestWithUser, res: Response) {
    try {
      if (req.user?.role !== 'admin') {
        return res.status(403).json({ success: false, error: 'Accès admin requis' });
      }

      const { 
        page = 1, 
        limit = 50, 
        status, 
        user_id, 
        product_code,
        start_date,
        end_date 
      } = req.query;

      const filters: any = {};
      if (status) filters.status = status;
      if (user_id) filters.user_id = parseInt(user_id as string);
      if (product_code) filters.product_code = product_code;
      if (start_date) filters.start_date = start_date;
      if (end_date) filters.end_date = end_date;

      const tickets = await TicketRepository.getAllTicketsWithFilters(
        parseInt(page as string),
        parseInt(limit as string),
        filters
      );

      return res.status(200).json({ success: true, data: tickets });
    } catch (error) {
      console.error('[AdminTicketsController.getAllTickets] error:', error);
      return res.status(500).json({ success: false, error: 'Erreur lors de la récupération des tickets' });
    }
  }

  /**
   * [ADMIN] Mettre à jour le statut d'un ticket
   */
  static async updateTicketStatus(req: RequestWithUser, res: Response) {
    try {
      if (req.user?.role !== 'admin') {
        return res.status(403).json({ success: false, error: 'Accès admin requis' });
      }

      const { id } = req.params;
      const { status } = req.body;

      if (!['unused', 'used', 'expired', 'cancelled'].includes(status)) {
        return res.status(400).json({ 
          success: false, 
          error: 'Statut invalide. Utilisez: unused, used, expired, cancelled' 
        });
      }

      const ticket = await TicketRepository.updateTicketStatusById(id, status);
      
      if (!ticket) {
        return res.status(404).json({ success: false, error: 'Ticket non trouvé' });
      }

      return res.status(200).json({ success: true, data: ticket });
    } catch (error) {
      console.error('[AdminTicketsController.updateTicketStatus] error:', error);
      return res.status(500).json({ success: false, error: 'Erreur lors de la mise à jour du statut' });
    }
  }
}