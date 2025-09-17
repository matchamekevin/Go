// Services centralisés pour l'application
export { RouteService, type PopularRoute } from './routeService';
export { UserTicketService, type UserTicket, type UserTicketHistory } from './userTicketService';
export { apiClient } from './apiClient';

// Re-export des services existants pour compatibilité
export * from './ticketService';
export * from './authService';