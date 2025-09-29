import { apiClient } from './apiClient';
import type { ApiResponse, Route, SotralLine, SotralTicketType, SotralTicket } from '../types/api';
import { DEV_CONFIG, devLog, devError } from '../config/devConfig';

export interface SearchResult {
  id: string;
  from: string;
  to: string;
  price: string;
  duration: string;
  type: string;
  company?: string;
}

export class SearchService {
  // Recherche de lignes SOTRAL via l'API
  static async searchRoutes(query: string): Promise<SearchResult[]> {
    devLog('SearchService', `searchRoutes query=${query} (utilise maintenant les lignes SOTRAL)`);

    if (DEV_CONFIG.FORCE_FALLBACK) {
      devLog('SearchService', 'Mode fallback activé, retour des résultats mockés');
      return this.getFallbackResults(query);
    }

    try {
      console.log('[SearchService] Début de la recherche pour:', query);

      // Récupérer les lignes SOTRAL
      const linesResponse = await apiClient.get<ApiResponse<SotralLine[]>>('/sotral/lines');
      console.log('[SearchService] Réponse lignes:', {
        success: linesResponse.success,
        count: linesResponse.data?.length || 0
      });

      if (!linesResponse.success) {
        devError('SearchService', new Error(linesResponse.error || 'API error'), 'searchRoutes');
        return this.getFallbackResults(query);
      }

      const lines = linesResponse.data || [];
      
      // Récupérer les types de tickets pour avoir les prix
      const ticketTypesResponse = await apiClient.get<ApiResponse<SotralTicketType[]>>('/sotral/ticket-types');
      console.log('[SearchService] Réponse types de tickets:', {
        success: ticketTypesResponse.success,
        count: ticketTypesResponse.data?.length || 0
      });

      const ticketTypes = ticketTypesResponse.success ? ticketTypesResponse.data || [] : [];
      
      // Récupérer les tickets générés pour voir les prix réels
      const generatedTicketsResponse = await apiClient.get<ApiResponse<SotralTicket[]>>('/sotral/generated-tickets');
      console.log('[SearchService] Réponse tickets générés:', {
        success: generatedTicketsResponse.success,
        count: generatedTicketsResponse.data?.length || 0
      });

      const generatedTickets = generatedTicketsResponse.success ? generatedTicketsResponse.data || [] : [];

      // Filtrer par la requête si elle existe
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

      console.log('[SearchService] Lignes filtrées:', filteredLines.length);

      // Transformer les lignes en résultats de recherche avec les vrais prix
      const results = filteredLines.map(line => {
        // Chercher un ticket généré pour cette ligne pour avoir le prix réel
        const ticketForLine = generatedTickets.find(ticket => ticket.line_id === line.id);
        let price = '-- FCFA';
        
        if (ticketForLine && ticketForLine.price_paid_fcfa) {
          price = `${ticketForLine.price_paid_fcfa} FCFA`;
        } else {
          // Sinon utiliser le prix du type de ticket par défaut (SIMPLE)
          const simpleTicketType = ticketTypes.find(type => type.code === 'SIMPLE');
          if (simpleTicketType && simpleTicketType.price_fcfa) {
            price = `${simpleTicketType.price_fcfa} FCFA`;
          }
        }

        return {
          id: line.id.toString(),
          from: line.route_from,
          to: line.route_to,
          price: price,
          duration: '--', // Durée déterminée par l'admin
          type: `Ligne ${line.line_number}`,
          company: line.category?.name || 'SOTRAL'
        };
      });

      console.log('[SearchService] Résultats finaux:', results.length);
      return results;
    } catch (error) {
      console.error('[SearchService] Erreur complète:', error);
      devError('SearchService', error, 'searchRoutes - network');
      return this.getFallbackResults(query);
    }
  }

  private static getFallbackResults(query: string): SearchResult[] {
    // Plus de données hardcodées - utiliser uniquement les données de l'admin via l'API
    devLog('SearchService', 'Aucun résultat API disponible, retour vide (pas de fallback)');
    return [];
  }
}
