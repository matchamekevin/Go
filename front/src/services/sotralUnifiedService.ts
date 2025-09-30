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
   * Enrichir les lignes avec les informations de prix et nombre de tickets
   */
  private async enrichLinesWithPricing(lines: UnifiedSotralLine[]): Promise<UnifiedSotralLine[]> {
    try {
      // Récupérer tous les tickets générés pour calculer les prix
      const tickets = await this.getGeneratedTickets();

      // Récupérer les types de tickets pour les prix par défaut
      const ticketTypesResponse: ApiResponse<SotralTicketType[]> = await this.apiClient.get('/sotral/ticket-types');
      const ticketTypes = ticketTypesResponse.success ? ticketTypesResponse.data || [] : [];

      return lines.map(line => {
        // Chercher les tickets pour cette ligne
        const lineTickets = tickets.filter(ticket => ticket.line_id === line.id);
        const ticketCount = lineTickets.length;

        // Calculer le prix moyen ou prendre le premier ticket disponible
        let price = undefined;
        if (lineTickets.length > 0) {
          // Prendre le prix du ticket le plus récent ou le moins cher
          const availableTickets = lineTickets.filter(t => t.status === 'active');
          if (availableTickets.length > 0) {
            price = Math.min(...availableTickets.map(t => t.price_paid_fcfa));
          }
        } else {
          // Prix par défaut basé sur le type SIMPLE
          const simpleType = ticketTypes.find((t: SotralTicketType) => t.code === 'SIMPLE');
          if (simpleType) {
            price = simpleType.price_fcfa;
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
      return lines; // Retourner les lignes sans enrichissement en cas d'erreur
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
}

export const sotralUnifiedService = new SotralUnifiedService();