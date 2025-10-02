/**
 * ====================================
 * UTILITAIRES SOTRAL
 * ====================================
 * 
 * Fonctions utilitaires pour l'application SOTRAL
 */

import { SOTRAL_CONFIG, SotralTicketStatus } from '../config/sotral.config';

// ====================================
// FORMATAGE DES DONNÉES
// ====================================

/**
 * Formate un prix en FCFA
 */
export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('fr-FR').format(price);
};

/**
 * Formate une date pour l'affichage
 */
export const formatDate = (dateString: string, includeTime: boolean = true): string => {
  const date = new Date(dateString);
  const options: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    ...(includeTime && {
      hour: '2-digit',
      minute: '2-digit',
    }),
  };
  return date.toLocaleDateString('fr-FR', options);
};

/**
 * Formate une date pour les inputs HTML
 */
export const formatDateForInput = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toISOString().split('T')[0];
};

/**
 * Formate la durée de validité
 */
export const formatValidityDuration = (hours: number): string => {
  if (hours < 24) {
    return `${hours}h`;
  }
  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;
  
  if (remainingHours === 0) {
    return `${days}j`;
  }
  return `${days}j ${remainingHours}h`;
};

// ====================================
// VALIDATION DES DONNÉES
// ====================================

/**
 * Valide un code de ticket SOTRAL
 */
export const isValidTicketCode = (code: string): boolean => {
  const regex = /^SOT-\d{4}-\d{3,6}$/;
  return regex.test(code);
};

/**
 * Valide une plage de dates
 */
export const isValidDateRange = (startDate: string, endDate: string): boolean => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const maxRangeDays = SOTRAL_CONFIG.FILTERS.MAX_DATE_RANGE_DAYS;
  
  if (start > end) return false;
  
  const diffDays = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
  return diffDays <= maxRangeDays;
};

/**
 * Valide la quantité de génération de tickets
 */
export const isValidGenerationQuantity = (quantity: number): boolean => {
  return quantity > 0 && quantity <= SOTRAL_CONFIG.TICKETS.MAX_GENERATION_BATCH;
};

// ====================================
// UTILITAIRES DE STATUT
// ====================================

/**
 * Obtient la couleur CSS pour un statut de ticket
 */
export const getStatusColor = (status: SotralTicketStatus): string => {
  const colors: Record<SotralTicketStatus, string> = {
    active: 'bg-green-100 text-green-800 border-green-200',
    used: 'bg-gray-100 text-gray-800 border-gray-200',
    expired: 'bg-red-100 text-red-800 border-red-200',
    cancelled: 'bg-orange-100 text-orange-800 border-orange-200',
  };
  return colors[status] || colors.active;
};

/**
 * Obtient le libellé français d'un statut
 */
export const getStatusLabel = (status: SotralTicketStatus): string => {
  const labels: Record<SotralTicketStatus, string> = {
    active: 'Actif',
    used: 'Utilisé',
    expired: 'Expiré',
    cancelled: 'Annulé',
  };
  return labels[status] || status;
};

/**
 * Détermine si un ticket est actif
 */
export const isTicketActive = (status: SotralTicketStatus, expiresAt: string): boolean => {
  if (status !== 'active') return false;
  return new Date(expiresAt) > new Date();
};

// ====================================
// UTILITAIRES DE GÉNÉRATION
// ====================================

/**
 * Génère un ID unique pour les composants
 */
export const generateId = (prefix: string = 'sotral'): string => {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Génère une couleur aléatoire pour les graphiques
 */
export const generateRandomColor = (): string => {
  const colors = Object.values(SOTRAL_CONFIG.ANALYTICS.CHART_COLORS);
  return colors[Math.floor(Math.random() * colors.length)];
};

// ====================================
// UTILITAIRES D'URL ET DE NAVIGATION
// ====================================

/**
 * Construit une URL avec des paramètres de requête
 */
export const buildQueryString = (params: Record<string, any>): string => {
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, value.toString());
    }
  });
  
  return searchParams.toString();
};

/**
 * Télécharge un blob en tant que fichier
 */
export const downloadBlob = (blob: Blob, filename: string): void => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

// ====================================
// UTILITAIRES DE DEBOUNCE ET THROTTLE
// ====================================

/**
 * Fonction de debounce pour optimiser les recherches
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: ReturnType<typeof setTimeout>;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

/**
 * Fonction de throttle pour limiter les appels fréquents
 */
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// ====================================
// UTILITAIRES DE STOCKAGE LOCAL
// ====================================

/**
 * Sauvegarde des données dans le localStorage avec préfixe SOTRAL
 */
export const saveToLocalStorage = (key: string, data: any): void => {
  try {
    const sotralKey = `sotral_${key}`;
    localStorage.setItem(sotralKey, JSON.stringify(data));
  } catch (error) {
    console.warn('Erreur lors de la sauvegarde locale:', error);
  }
};

/**
 * Récupère des données du localStorage avec préfixe SOTRAL
 */
export const loadFromLocalStorage = <T>(key: string, defaultValue: T): T => {
  try {
    const sotralKey = `sotral_${key}`;
    const item = localStorage.getItem(sotralKey);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.warn('Erreur lors de la récupération locale:', error);
    return defaultValue;
  }
};

/**
 * Supprime des données du localStorage avec préfixe SOTRAL
 */
export const removeFromLocalStorage = (key: string): void => {
  try {
    const sotralKey = `sotral_${key}`;
    localStorage.removeItem(sotralKey);
  } catch (error) {
    console.warn('Erreur lors de la suppression locale:', error);
  }
};