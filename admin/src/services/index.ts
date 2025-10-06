export { default as apiClient } from './apiClient.new';
export { default as authService } from './authService.new';
export { default as dashboardService } from './dashboardService.new';
export { default as userService } from './userService.new';
export { default as ticketService } from './ticketService.new';
export { default as paymentService } from './paymentService.new';
export { default as sotralService } from './sotralService.new';

// Export types
export type { AdminUser, LoginResponse } from './authService.new';
export type { DashboardStats, RevenueData as DashboardRevenueData } from './dashboardService.new';
export type { User, UsersResponse } from './userService.new';
export type { Ticket, TicketsResponse, TicketStats } from './ticketService.new';
export type { Payment, PaymentsResponse, RevenueData } from './paymentService.new';
export type { Line, Stop, Schedule, Vehicle } from './sotralService.new';
