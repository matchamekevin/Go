import { apiClient } from './apiClient';
import type { ApiResponse, SotralLine, SotralTicket, SotralTicketType } from '../types/api';

// ==========================================
// SERVICE UNIFIÉ SOTRAL POUR L'APP MOBILE
// ==========================================

export interface UnifiedSotralLine {
  id: number;
  line_number: number;
  name: string;
  route_from: string;
  route_to: string;
  category_id: number;
  distance_km?: number;
  duration_minutes?: number;
  stops_count?: number;
  is_active: boolean;
  category?: {
    id: number;
    name: string;
    description?: string;
  };
  // Prix calculé pour cette ligne
  price_fcfa?: number;
  ticket_count?: number;
}

export interface UnifiedSotralTicket {
  id: number;
  ticket_code: string;
  qr_code: string;
  user_id?: number;
  ticket_type_id: number;
  line_id?: number;
  stop_from_id?: number;
  stop_to_id?: number;
  price_paid_fcfa: number;
  status: 'active' | 'used' | 'expired' | 'cancelled';
  purchased_at: string;
  expires_at?: string;
  trips_remaining: number;
  payment_method?: string;
  payment_reference?: string;
  created_at: string;
  updated_at: string;
  // Informations jointes
  line_name?: string;
  ticket_type_name?: string;
  ticket_type_code?: string;
}

export interface SearchResult {
  id: string;
  from: string;
  to: string;
  price: string;
  duration: string;
  type: string;
  company?: string;
  line?: UnifiedSotralLine;
}

export interface UnifiedSearchData {
  lines: UnifiedSotralLine[];
  tickets: UnifiedSotralTicket[];
  searchResults: SearchResult[];
}

class SotralUnifiedService {
  private apiClient = apiClient;

  // ==========================================
  // RÉCUPÉRATION DES DONNÉES DE BASE
  // ==========================================

  /**
   * Récupérer toutes les lignes SOTRAL avec les prix calculés
   */
  async getLines(): Promise<UnifiedSotralLine[]> {
    try {
      console.log('[SotralUnifiedService] Récupération des lignes...');
      const response: ApiResponse<SotralLine[]> = await this.apiClient.get('/sotral/lines');

      if (!response.success || !response.data) {
        console.error('[SotralUnifiedService] Erreur récupération lignes:', response);
        return [];
      }

      const lines: UnifiedSotralLine[] = response.data;
      console.log(`[SotralUnifiedService] ${lines.length} lignes récupérées`);

      // Enrichir les lignes avec les informations de prix et tickets
      return await this.enrichLinesWithPricing(lines);
    } catch (error) {
      console.error('[SotralUnifiedService] Erreur réseau lignes:', error);
      return [];
    }
  }

  /**
   * Récupérer les tickets générés par l'admin
   */
  async getGeneratedTickets(): Promise<UnifiedSotralTicket[]> {
    try {
      console.log('[SotralUnifiedService] Récupération des tickets générés...');
      const response: ApiResponse<SotralTicket[]> = await this.apiClient.get('/sotral/generated-tickets');

      if (!response.success || !response.data) {
        console.error('[SotralUnifiedService] Erreur récupération tickets:', response);
        return [];
      }

      const tickets: UnifiedSotralTicket[] = response.data;
      console.log(`[SotralUnifiedService] ${tickets.length} tickets récupérés`);

      return tickets;
    } catch (error: any) {
      // Vérifier si c'est une erreur 404 (endpoint non déployé)
      if (error.status === 404) {
        console.warn('[SotralUnifiedService] Endpoint /sotral/generated-tickets non disponible sur ce serveur (404). Retour de tableau vide.');
        return [];
      }
      
      console.error('[SotralUnifiedService] Erreur réseau tickets:', error);
      return [];
    }
  }

  /**
   * Récupérer une ligne spécifique par ID
   */
  async getLineById(id: number): Promise<UnifiedSotralLine | null> {
    try {
      console.log(`[SotralUnifiedService] Récupération de la ligne ${id}...`);
      const response: ApiResponse<SotralLine> = await this.apiClient.get(`/sotral/lines/${id}`);

      if (!response.success || !response.data) {
        console.error('[SotralUnifiedService] Erreur récupération ligne:', response);
        return null;
      }

      const line: UnifiedSotralLine = response.data;
      console.log(`[SotralUnifiedService] Ligne ${id} récupérée`);

      // Enrichir la ligne avec les informations de prix
      const enrichedLines = await this.enrichLinesWithPricing([line]);
      return enrichedLines[0] || null;
    } catch (error) {
      console.error('[SotralUnifiedService] Erreur réseau ligne:', error);
      return null;
    }
  }

  /**
   * Récupérer les tickets pour une ligne spécifique
   * Note: Filtre les tickets depuis tous les tickets générés
   */
  async getTicketsByLine(lineId: number): Promise<UnifiedSotralTicket[]> {
    try {
      console.log(`[SotralUnifiedService] Récupération des tickets pour la ligne ${lineId}...`);
      
      // Récupérer tous les tickets générés (l'API filtre déjà pour status='active', trips_remaining > 0, user_id IS NULL)
      const allTickets = await this.getGeneratedTickets();
      
      // Filtrer uniquement les tickets de cette ligne spécifique
      const lineTickets = allTickets.filter(ticket => ticket.line_id === lineId);
      
      console.log(`[SotralUnifiedService] ${lineTickets.length} tickets disponibles trouvés pour la ligne ${lineId} sur ${allTickets.length} tickets totaux`);

      // Afficher les détails de chaque ticket pour debug
      if (lineTickets.length > 0) {
        console.log('[SotralUnifiedService] Détails des tickets:');
        lineTickets.forEach(t => {
          console.log(`  - Ticket ${t.ticket_code}: ${t.price_paid_fcfa} FCFA, status: ${t.status}, trips: ${t.trips_remaining}`);
        });
      }

      return lineTickets;
    } catch (error: any) {
      console.error('[SotralUnifiedService] Erreur récupération tickets ligne:', error);
      return [];
    }
  }

  /**
   * Récupérer un ticket spécifique par son ID
   */
  async getTicketById(ticketId: number): Promise<UnifiedSotralTicket | null> {
    try {
      console.log(`[SotralUnifiedService] Récupération du ticket ID ${ticketId}...`);

      // Récupérer tous les tickets générés
      const allTickets = await this.getGeneratedTickets();

      // Trouver le ticket spécifique
      const ticket = allTickets.find(ticket => ticket.id === ticketId);

      if (ticket) {
        console.log(`[SotralUnifiedService] Ticket trouvé: ${ticket.ticket_code} - ${ticket.price_paid_fcfa} FCFA`);
        return ticket;
      } else {
        console.warn(`[SotralUnifiedService] Ticket ID ${ticketId} non trouvé`);
        return null;
      }
    } catch (error: any) {
      console.error('[SotralUnifiedService] Erreur récupération ticket par ID:', error);
      return null;
    }
  }
  private async enrichLinesWithPricing(lines: UnifiedSotralLine[]): Promise<UnifiedSotralLine[]> {
    try {
      // Récupérer tous les tickets générés pour calculer les prix
      const tickets = await this.getGeneratedTickets();
      console.log(`[SotralUnifiedService] ${tickets.length} tickets générés récupérés pour enrichissement`);

      // Récupérer les types de tickets pour les prix par défaut
      const ticketTypesResponse: ApiResponse<SotralTicketType[]> = await this.apiClient.get('/sotral/ticket-types');
      const ticketTypes = ticketTypesResponse.success ? ticketTypesResponse.data || [] : [];
      console.log(`[SotralUnifiedService] ${ticketTypes.length} types de tickets récupérés`);

      return lines.map(line => {
        // Chercher les tickets pour cette ligne
        const lineTickets = tickets.filter(ticket => ticket.line_id === line.id);
        const ticketCount = lineTickets.length;
        console.log(`[SotralUnifiedService] Ligne ${line.id} (${line.name}): ${ticketCount} tickets trouvés`);

        // Calculer le prix moyen ou prendre le premier ticket disponible
        let price = undefined;
        if (lineTickets.length > 0) {
          // Prendre le prix du ticket le plus récent ou le moins cher
          const availableTickets = lineTickets.filter(t => t.status === 'active');
          if (availableTickets.length > 0) {
            price = Math.min(...availableTickets.map(t => t.price_paid_fcfa));
            console.log(`[SotralUnifiedService] Ligne ${line.id}: prix calculé ${price} FCFA depuis ${availableTickets.length} tickets actifs`);
          } else {
            console.log(`[SotralUnifiedService] Ligne ${line.id}: ${lineTickets.length} tickets trouvés mais aucun actif`);
          }
        } else {
          // Prix par défaut basé sur le type SIMPLE ou prix fixe par défaut
          const simpleType = ticketTypes.find((t: SotralTicketType) => t.code === 'SIMPLE');
          if (simpleType && simpleType.price_fcfa) {
            price = simpleType.price_fcfa;
            console.log(`[SotralUnifiedService] Ligne ${line.id}: prix par défaut depuis type SIMPLE: ${price} FCFA`);
          } else {
            // Prix par défaut fixe si aucun type de ticket n'est disponible
            price = 500; // Prix par défaut de 500 FCFA
            console.log(`[SotralUnifiedService] Ligne ${line.id}: prix fixe par défaut: ${price} FCFA`);
          }
        }

        return {
          ...line,
          price_fcfa: price,
          ticket_count: ticketCount
        };
      });
    } catch (error) {
      console.error('[SotralUnifiedService] Erreur enrichissement lignes:', error);
      // En cas d'erreur, définir un prix par défaut pour toutes les lignes
      return lines.map(line => ({
        ...line,
        price_fcfa: 500, // Prix par défaut en cas d'erreur
        ticket_count: 0
      }));
    }
  }

  // ==========================================
  // RECHERCHE ET FILTRAGE
  // ==========================================

  /**
   * Effectuer une recherche unifiée
   */
  async search(query: string): Promise<UnifiedSearchData> {
    try {
      console.log(`[SotralUnifiedService] Recherche pour: "${query}"`);

      // Récupérer les données de base
      const [lines, tickets] = await Promise.all([
        this.getLines(),
        this.getGeneratedTickets()
      ]);

      // Filtrer les lignes par recherche
      let filteredLines = lines;
      if (query && query.trim()) {
        const searchTerm = query.toLowerCase().trim();
        filteredLines = lines.filter(line =>
          line.name.toLowerCase().includes(searchTerm) ||
          line.route_from.toLowerCase().includes(searchTerm) ||
          line.route_to.toLowerCase().includes(searchTerm) ||
          line.line_number.toString().includes(searchTerm)
        );
      }

      // Filtrer les tickets par recherche
      let filteredTickets = tickets;
      if (query && query.trim()) {
        const searchTerm = query.toLowerCase().trim();
        filteredTickets = tickets.filter(ticket =>
          ticket.ticket_code.toLowerCase().includes(searchTerm) ||
          ticket.line_name?.toLowerCase().includes(searchTerm) ||
          ticket.ticket_type_name?.toLowerCase().includes(searchTerm) ||
          ticket.status.toLowerCase().includes(searchTerm)
        );
      }

      // Créer les résultats de recherche formatés
      const searchResults: SearchResult[] = filteredLines.map(line => ({
        id: line.id.toString(),
        from: line.route_from,
        to: line.route_to,
        price: line.price_fcfa ? `${line.price_fcfa} FCFA` : '-- FCFA',
        duration: line.distance_km ? `${Math.round(line.distance_km * 10)} min` : '--',
        type: `Ligne ${line.line_number}`,
        company: line.category?.name || 'SOTRAL',
        line: line
      }));

      console.log(`[SotralUnifiedService] Résultats: ${filteredLines.length} lignes, ${filteredTickets.length} tickets`);

      return {
        lines: filteredLines,
        tickets: filteredTickets,
        searchResults
      };
    } catch (error) {
      console.error('[SotralUnifiedService] Erreur recherche:', error);
      return {
        lines: [],
        tickets: [],
        searchResults: []
      };
    }
  }

  // ==========================================
  // MÉTHODES UTILITAIRES
  // ==========================================

  /**
   * Vérifier la santé du service
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response: ApiResponse<any> = await this.apiClient.get('/sotral/health');
      return response.success === true;
    } catch (error) {
      console.error('[SotralUnifiedService] Health check failed:', error);
      return false;
    }
  }

  /**
   * Formater un prix en FCFA
   */
  formatPrice(amount: number): string {
    return `${amount.toLocaleString('fr-FR')} FCFA`;
  }

  /**
   * Obtenir la couleur du statut d'un ticket
   */
  getTicketStatusColor(status: string): string {
    const colors: Record<string, string> = {
      active: '#10B981',    // Vert
      used: '#6B7280',      // Gris
      expired: '#EF4444',   // Rouge
      cancelled: '#F59E0B'  // Orange
    };
    return colors[status] || '#6B7280';
  }

  /**
   * Obtenir le label du statut d'un ticket
   */
  getTicketStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      active: 'Disponible',
      used: 'Utilisé',
      expired: 'Expiré',
      cancelled: 'Annulé'
    };
    return labels[status] || status;
  }

  // ==========================================
  // PAIEMENTS MOBILES (MIXX BY YAS / FLOOZ)
  // ==========================================

  /**
   * Initier un paiement mobile
   */
  async initiateMobilePayment(paymentData: {
    ticketId: number;
    paymentMethod: 'mixx' | 'flooz';
    phoneNumber: string;
    amount: number;
  }): Promise<{ success: boolean; paymentRef?: string; error?: string }> {
    try {
      console.log(`[SotralUnifiedService] Initiation paiement ${paymentData.paymentMethod} pour ticket ${paymentData.ticketId}`);

      const response: ApiResponse<{
        payment_ref: string;
        status: string;
        payment_url?: string;
      }> = await this.apiClient.post('/sotral/payments/initiate', {
        ticket_id: paymentData.ticketId,
        payment_method: paymentData.paymentMethod,
        phone_number: paymentData.phoneNumber,
        amount: paymentData.amount
      });

      if (!response.success || !response.data) {
        console.error('[SotralUnifiedService] Erreur initiation paiement:', response);
        return {
          success: false,
          error: response.error || 'Erreur lors de l\'initiation du paiement'
        };
      }

      return {
        success: true,
        paymentRef: response.data.payment_ref
      };
    } catch (error: any) {
      console.error('[SotralUnifiedService] Erreur réseau paiement:', error);
      return {
        success: false,
        error: error?.message || 'Erreur réseau lors du paiement'
      };
    }
  }

  /**
   * Attribuer un ticket généré par l'admin à un utilisateur après paiement
   */
  async assignTicketToUser(assignData: {
    ticketId: number;
    paymentMethod: string;
    paymentReference: string;
    phoneNumber?: string;
  }): Promise<{ success: boolean; ticket?: UnifiedSotralTicket; error?: string }> {
    try {
      console.log(`[SotralUnifiedService] Attribution du ticket ${assignData.ticketId} à l'utilisateur...`);
      console.log('[SotralUnifiedService] Données:', assignData);

      const response: ApiResponse<UnifiedSotralTicket> = await this.apiClient.post('/sotral/assign-ticket', assignData);

      if (!response.success || !response.data) {
        console.error('[SotralUnifiedService] Erreur attribution ticket:', response);
        return {
          success: false,
          error: response.error || 'Erreur lors de l\'attribution du ticket'
        };
      }

      console.log(`[SotralUnifiedService] ✅ Ticket attribué avec succès: ${response.data.ticket_code}`);
      return {
        success: true,
        ticket: response.data
      };
    } catch (error: any) {
      console.error('[SotralUnifiedService] Erreur réseau attribution ticket:', error);
      return {
        success: false,
        error: error?.message || 'Erreur réseau lors de l\'attribution'
      };
    }
  }
}

export const sotralUnifiedService = new SotralUnifiedService();