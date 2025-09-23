/**
 * ====================================
 * CONFIGURATION ARCHITECTURE SOTRAL
 * ====================================
 * 
 * Ce fichier centralise la configuration de l'architecture modulaire SOTRAL
 */

export const SOTRAL_CONFIG = {
  // API Configuration
  API: {
    BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:3001/api',
    TIMEOUT: 10000,
    RETRY_ATTEMPTS: 3,
    CACHE_EXPIRY: 5 * 60 * 1000, // 5 minutes
  },

  // Pagination par défaut
  PAGINATION: {
    DEFAULT_LIMIT: 10,
    MAX_LIMIT: 100,
    DEFAULT_PAGE: 1,
  },

  // Configuration des tickets
  TICKETS: {
    STATUSES: ['active', 'used', 'expired', 'cancelled'] as const,
    DEFAULT_VALIDITY_HOURS: 24,
    MAX_GENERATION_BATCH: 1000,
    QR_CODE_SIZE: 200,
  },

  // Configuration des filtres
  FILTERS: {
    DATE_FORMAT: 'YYYY-MM-DD',
    MAX_DATE_RANGE_DAYS: 365,
  },

  // Configuration des analytics
  ANALYTICS: {
    REFRESH_INTERVAL: 30000, // 30 secondes
    CHART_COLORS: {
      primary: '#3B82F6',
      secondary: '#EF4444',
      success: '#10B981',
      warning: '#F59E0B',
    },
  },

  // Messages par défaut
  MESSAGES: {
    SUCCESS: {
      TICKET_GENERATED: 'Tickets générés avec succès',
      TICKET_CANCELLED: 'Ticket annulé avec succès',
      DATA_REFRESHED: 'Données actualisées',
    },
    ERROR: {
      NETWORK_ERROR: 'Erreur de connexion réseau',
      VALIDATION_ERROR: 'Données invalides',
      GENERATION_ERROR: 'Erreur lors de la génération',
      UNKNOWN_ERROR: 'Une erreur inattendue s\'est produite',
    },
  },
} as const;

// Types dérivés de la configuration
export type SotralTicketStatus = typeof SOTRAL_CONFIG.TICKETS.STATUSES[number];
export type SotralMessageType = keyof typeof SOTRAL_CONFIG.MESSAGES.SUCCESS | keyof typeof SOTRAL_CONFIG.MESSAGES.ERROR;

// Helpers de configuration
export const getSotralApiUrl = (endpoint: string) => {
  return `${SOTRAL_CONFIG.API.BASE_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
};

export const getSotralTicketStatusColor = (status: SotralTicketStatus) => {
  const colors = {
    active: SOTRAL_CONFIG.ANALYTICS.CHART_COLORS.success,
    used: SOTRAL_CONFIG.ANALYTICS.CHART_COLORS.primary,
    expired: SOTRAL_CONFIG.ANALYTICS.CHART_COLORS.warning,
    cancelled: SOTRAL_CONFIG.ANALYTICS.CHART_COLORS.secondary,
  };
  return colors[status];
};

export default SOTRAL_CONFIG;