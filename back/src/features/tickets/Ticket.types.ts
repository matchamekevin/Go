import { z } from 'zod';

// Schéma pour les trajets
export const RouteSchema = z.object({
  id: z.string(),
  name: z.string(),
  code: z.string(),
  start_point: z.string(),
  end_point: z.string(),
  distance_km: z.number().optional(),
  duration_minutes: z.number().optional(),
  price_category: z.enum(['T100', 'T150', 'T200', 'T250', 'T300']),
  is_active: z.boolean().default(true),
  stops: z.array(z.string()).optional(),
  metadata: z.record(z.string(), z.any()).optional(),
  created_at: z.date().optional(),
  updated_at: z.date().optional()
});

// Schéma pour les tickets
export const TicketSchema = z.object({
  id: z.string().optional(),
  user_id: z.number().optional(),
  product_code: z.string(),
  route_code: z.string().optional(),
  code: z.string().optional(),
  status: z.enum(['unused', 'used', 'expired']).default('unused'),
  purchased_at: z.date().optional(),
  used_at: z.date().optional(),
  purchase_method: z.enum(['mobile_money', 'cash', 'card', 'ussd']).optional(),
  metadata: z.record(z.string(), z.any()).optional()
});

// Schéma pour les produits de tickets
export const TicketProductSchema = z.object({
  id: z.string(),
  name: z.string(),
  code: z.string(),
  price: z.number(),
  rides: z.number().default(1),
  is_active: z.boolean().default(true),
  created_at: z.date().optional(),
  updated_at: z.date().optional()
});

// Schéma pour l'achat de tickets
export const TicketPurchaseSchema = z.object({
  product_code: z.string(),
  route_code: z.string().optional(),
  quantity: z.number().min(1).default(1),
  purchase_method: z.enum(['mobile_money', 'cash', 'card', 'ussd']),
  payment_details: z.record(z.string(), z.any()).optional()
});

// Schéma pour la validation de tickets
export const TicketValidationSchema = z.object({
  ticket_code: z.string()
});

// Types déduits des schémas Zod
export type Ticket = z.infer<typeof TicketSchema>;
export type TicketProduct = z.infer<typeof TicketProductSchema>;
export type TicketPurchase = z.infer<typeof TicketPurchaseSchema>;
export type TicketValidation = z.infer<typeof TicketValidationSchema>;
export type Route = z.infer<typeof RouteSchema>;
