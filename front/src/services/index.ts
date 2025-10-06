/**
 * ✅ INDEX DES SERVICES - NOUVELLE INTÉGRATION
 * Export centralisé de tous les services
 */

// Client API principal
export { default as apiClient } from './api.client';
export * from './api.client';

// Services métiers
export { default as authService } from './authService.new';
export * from './authService.new';

export { default as ticketService } from './ticketService.new';
export * from './ticketService.new';

export { default as paymentService } from './paymentService.new';
export * from './paymentService.new';

export { default as sotralService } from './sotralService.new';
export * from './sotralService.new';

// Réexporter pour compatibilité
export { AuthService } from './authService.new';
export { TicketService } from './ticketService.new';
export { PaymentService } from './paymentService.new';
export { SotralService } from './sotralService.new';
