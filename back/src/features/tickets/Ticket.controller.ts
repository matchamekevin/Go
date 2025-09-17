import { Request, Response } from 'express';
import { TicketRepository } from './Ticket.repository';
import { TicketPurchaseSchema, TicketValidationSchema } from './Ticket.types';
import { v4 as uuidv4 } from 'uuid';
import { RequestWithUser } from './ticket.request';

export class TicketController {
  /**
   * Récupère tous les produits de tickets disponibles
   */
  static async getAllProducts(req: Request, res: Response) {
    try {
      const products = await TicketRepository.getAllProducts();
      return res.status(200).json({ success: true, data: products });
    } catch (error) {
      console.error('[TicketController.getAllProducts] error:', error);
      return res.status(500).json({ success: false, error: 'Erreur lors de la récupération des produits' });
    }
  }

  /**
   * Récupère tous les trajets disponibles
   */
  static async getAllRoutes(req: Request, res: Response) {
    try {
      const routes = await TicketRepository.getAllRoutes();
      return res.status(200).json({ success: true, data: routes });
    } catch (error) {
      console.error('[TicketController.getAllRoutes] error:', error);
      return res.status(500).json({ success: false, error: 'Erreur lors de la récupération des trajets' });
    }
  }

  /**
   * Récupère les trajets disponibles pour une catégorie de prix
   */
  static async getRoutesByPriceCategory(req: Request, res: Response) {
    try {
      const { category } = req.params;
      
      if (!category || !['T100', 'T150', 'T200', 'T250', 'T300'].includes(category)) {
        return res.status(400).json({ 
          success: false, 
          error: 'Catégorie de prix invalide. Utilisez T100, T150, T200, T250 ou T300.'
        });
      }
      
      const routes = await TicketRepository.getRoutesByPriceCategory(category);
      return res.status(200).json({ success: true, data: routes });
    } catch (error) {
      console.error('[TicketController.getRoutesByPriceCategory] error:', error);
      return res.status(500).json({ success: false, error: 'Erreur lors de la récupération des trajets' });
    }
  }

  /**
   * Achète un ou plusieurs tickets
   */
  static async purchaseTicket(req: RequestWithUser, res: Response) {
    try {
      const userId = req.user?.id;
      
      // Validation des données d'entrée
      const validationResult = TicketPurchaseSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ 
          success: false, 
          error: 'Données d\'achat invalides',
          details: validationResult.error.format()
        });
      }
      
      const { product_code, route_code, quantity, purchase_method, payment_details } = validationResult.data;
      
      // Vérifier que le produit existe
      const product = await TicketRepository.getProductByCode(product_code);
      if (!product) {
        return res.status(404).json({ success: false, error: 'Produit de ticket non trouvé' });
      }
      
      // Vérifier que le trajet existe s'il est spécifié
      let route = null;
      if (route_code) {
        route = await TicketRepository.getRouteByCode(route_code);
        if (!route) {
          return res.status(404).json({ success: false, error: 'Trajet non trouvé' });
        }
        
        // Vérifier que la catégorie de prix du trajet correspond au produit
        if (route.price_category !== product_code) {
          return res.status(400).json({ 
            success: false, 
            error: `Le trajet nécessite un ticket de type ${route.price_category} mais vous avez sélectionné ${product_code}`
          });
        }
      }
      
      // Créer les tickets (un par trajet)
      const tickets = [];
      const totalRides = product.rides * (quantity as number);
      
      for (let i = 0; i < totalRides; i++) {
        const ticket = await TicketRepository.createTicket({
          user_id: parseInt(userId as string),
          product_code: product_code,
          route_code: route_code,
          purchase_method,
          metadata: { 
            payment_details,
            parent_purchase_id: i === 0 ? null : uuidv4(),
            purchase_batch: uuidv4()
          }
        });
        tickets.push(ticket);
      }
      
      return res.status(201).json({ 
        success: true, 
        data: { 
          tickets,
          total_price: product.price * (quantity as number),
          total_rides: totalRides
        } 
      });
    } catch (error) {
      console.error('[TicketController.purchaseTicket] error:', error);
      return res.status(500).json({ success: false, error: 'Erreur lors de l\'achat du ticket' });
    }
  }

  /**
   * Récupère tous les tickets d'un utilisateur
   */
  static async getUserTickets(req: RequestWithUser, res: Response) {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        console.log('[TicketController.getUserTickets] Utilisateur non authentifié');
        return res.status(401).json({ success: false, error: 'Utilisateur non authentifié' });
      }
      
      // Convertir userId en nombre de manière sécurisée
      // Le middleware retourne toujours une string, donc on parse directement
      const userIdNumber = parseInt(String(userId), 10);
      
      if (isNaN(userIdNumber)) {
        console.log('[TicketController.getUserTickets] ID utilisateur invalide:', userId);
        return res.status(400).json({ success: false, error: 'ID utilisateur invalide' });
      }
      
      console.log('[TicketController.getUserTickets] Recherche tickets pour userId:', userIdNumber);
      const tickets = await TicketRepository.getTicketsByUserId(userIdNumber);
      
      console.log('[TicketController.getUserTickets] Tickets trouvés:', tickets.length);
      return res.status(200).json({ success: true, data: tickets });
    } catch (error) {
      console.error('[TicketController.getUserTickets] error:', error);
      return res.status(500).json({ success: false, error: 'Erreur lors de la récupération des tickets' });
    }
  }

  /**
   * Valide un ticket (marque comme utilisé)
   */
  static async validateTicket(req: RequestWithUser, res: Response) {
    try {
      // Vérifier si l'utilisateur est un validateur (conducteur, contrôleur)
      if (req.user?.role !== 'validator' && req.user?.role !== 'admin') {
        return res.status(403).json({ success: false, error: 'Non autorisé à valider des tickets' });
      }
      
      // Validation des données d'entrée
      const validationResult = TicketValidationSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ 
          success: false, 
          error: 'Code de ticket invalide',
          details: validationResult.error.format()
        });
      }
      
      const { ticket_code } = validationResult.data;
      
      // Vérifier que le ticket existe
      const ticket = await TicketRepository.getTicketByCode(ticket_code);
      if (!ticket) {
        return res.status(404).json({ success: false, error: 'Ticket non trouvé' });
      }
      
      // Vérifier que le ticket n'a pas déjà été utilisé
      if (ticket.status !== 'unused') {
        return res.status(400).json({ 
          success: false, 
          error: `Ticket déjà ${ticket.status === 'used' ? 'utilisé' : 'expiré'}`,
          ticket_status: ticket.status
        });
      }
      
      // Marquer le ticket comme utilisé
      const updatedTicket = await TicketRepository.updateTicketStatus(ticket_code, 'used');
      
      return res.status(200).json({ 
        success: true, 
        data: updatedTicket,
        message: 'Ticket validé avec succès'
      });
    } catch (error) {
      console.error('[TicketController.validateTicket] error:', error);
      return res.status(500).json({ success: false, error: 'Erreur lors de la validation du ticket' });
    }
  }
  
  /**
   * Récupère les statistiques des tickets (admin uniquement)
   */
  static async getTicketStats(req: RequestWithUser, res: Response) {
    try {
      // Vérifier si l'utilisateur est admin
      if (req.user?.role !== 'admin') {
        return res.status(403).json({ success: false, error: 'Non autorisé à accéder aux statistiques' });
      }
      
      const stats = await TicketRepository.getTicketStats();
      
      return res.status(200).json({ success: true, data: stats });
    } catch (error) {
      console.error('[TicketController.getTicketStats] error:', error);
      return res.status(500).json({ success: false, error: 'Erreur lors de la récupération des statistiques' });
    }
  }
}
