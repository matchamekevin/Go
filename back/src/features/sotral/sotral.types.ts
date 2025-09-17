import { z } from 'zod';

// ==========================================
// SCHÉMAS ZOD POUR LE SYSTÈME SOTRAL
// ==========================================

// Schéma pour les catégories de lignes
export const SotralLineCategorySchema = z.object({
  id: z.number().optional(),
  name: z.string().min(1),
  description: z.string().optional(),
  created_at: z.date().optional(),
  updated_at: z.date().optional()
});

// Schéma pour les lignes SOTRAL
export const SotralLineSchema = z.object({
  id: z.number().optional(),
  line_number: z.number().min(1),
  name: z.string().min(1),
  route_from: z.string().min(1),
  route_to: z.string().min(1),
  category_id: z.number(),
  distance_km: z.number().positive().optional(),
  stops_count: z.number().int().positive().optional(),
  is_active: z.boolean().default(true),
  created_at: z.date().optional(),
  updated_at: z.date().optional()
});

// Schéma pour les arrêts
export const SotralStopSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(1),
  code: z.string().min(1),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  address: z.string().optional(),
  is_major_stop: z.boolean().default(false),
  is_active: z.boolean().default(true),
  created_at: z.date().optional(),
  updated_at: z.date().optional()
});

// Schéma pour les zones tarifaires
export const SotralPricingZoneSchema = z.object({
  id: z.number().optional(),
  zone_name: z.string().min(1),
  max_distance_km: z.number().positive(),
  price_fcfa: z.number().int().positive(),
  is_active: z.boolean().default(true),
  created_at: z.date().optional(),
  updated_at: z.date().optional()
});

// Schéma pour les types de tickets
export const SotralTicketTypeSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(1),
  code: z.string().min(1),
  description: z.string().optional(),
  price_fcfa: z.number().int().positive(),
  validity_duration_hours: z.number().int().positive().optional(),
  max_trips: z.number().int().positive().default(1),
  is_student_discount: z.boolean().default(false),
  is_active: z.boolean().default(true),
  created_at: z.date().optional(),
  updated_at: z.date().optional()
});

// Schéma pour les tickets SOTRAL
export const SotralTicketSchema = z.object({
  id: z.number().optional(),
  ticket_code: z.string().optional(), // Auto-généré
  qr_code: z.string().optional(), // Auto-généré
  user_id: z.number().optional(),
  ticket_type_id: z.number(),
  line_id: z.number().optional(),
  stop_from_id: z.number().optional(),
  stop_to_id: z.number().optional(),
  price_paid_fcfa: z.number().int().positive(),
  status: z.enum(['active', 'used', 'expired', 'cancelled']).default('active'),
  purchased_at: z.date().optional(),
  expires_at: z.date().optional(),
  trips_remaining: z.number().int().min(0).default(1),
  payment_method: z.string().optional(),
  payment_reference: z.string().optional(),
  created_at: z.date().optional(),
  updated_at: z.date().optional()
});

// Schéma pour l'achat de tickets
export const SotralTicketPurchaseSchema = z.object({
  ticket_type_code: z.string().min(1),
  line_id: z.number().optional(),
  stop_from_id: z.number().optional(),
  stop_to_id: z.number().optional(),
  quantity: z.number().int().min(1).default(1),
  payment_method: z.enum(['mobile_money', 'card', 'cash', 'ussd']),
  payment_details: z.object({
    phone: z.string().optional(),
    operator: z.string().optional(),
    reference: z.string().optional()
  }).optional()
});

// Schéma pour la validation de tickets
export const SotralTicketValidationSchema = z.object({
  id: z.number().optional(),
  ticket_id: z.number(),
  line_id: z.number().optional(),
  stop_id: z.number().optional(),
  validated_at: z.date().optional(),
  validator_device_id: z.string().optional(),
  validation_method: z.enum(['qr_scan', 'nfc', 'manual']).default('qr_scan'),
  created_at: z.date().optional()
});

// Schéma pour la validation via QR code
export const QRCodeValidationSchema = z.object({
  ticket_code: z.string().min(1),
  line_id: z.number().optional(),
  stop_id: z.number().optional(),
  validator_device_id: z.string().optional()
});

// Schéma pour les horaires
export const SotralScheduleSchema = z.object({
  id: z.number().optional(),
  line_id: z.number(),
  stop_id: z.number(),
  direction: z.enum(['aller', 'retour']),
  departure_time: z.string().regex(/^\d{2}:\d{2}$/), // Format HH:MM
  day_of_week: z.number().int().min(1).max(7).optional(),
  is_active: z.boolean().default(true),
  created_at: z.date().optional(),
  updated_at: z.date().optional()
});

// Schéma pour les statistiques admin
export const SotralStatsSchema = z.object({
  total_tickets_sold: z.number().int(),
  total_revenue_fcfa: z.number(),
  active_users: z.number().int(),
  popular_lines: z.array(z.object({
    line_id: z.number(),
    line_name: z.string(),
    tickets_count: z.number().int(),
    revenue_fcfa: z.number()
  })),
  daily_sales: z.array(z.object({
    date: z.string(),
    tickets_count: z.number().int(),
    revenue_fcfa: z.number()
  })),
  ticket_types_distribution: z.array(z.object({
    type_name: z.string(),
    count: z.number().int(),
    percentage: z.number()
  }))
});

// ==========================================
// TYPES TYPESCRIPT DÉDUITS
// ==========================================

export type SotralLineCategory = z.infer<typeof SotralLineCategorySchema>;
export type SotralLine = z.infer<typeof SotralLineSchema>;
export type SotralStop = z.infer<typeof SotralStopSchema>;
export type SotralPricingZone = z.infer<typeof SotralPricingZoneSchema>;
export type SotralTicketType = z.infer<typeof SotralTicketTypeSchema>;
export type SotralTicket = z.infer<typeof SotralTicketSchema>;
export type SotralTicketPurchase = z.infer<typeof SotralTicketPurchaseSchema>;
export type SotralTicketValidation = z.infer<typeof SotralTicketValidationSchema>;
export type QRCodeValidation = z.infer<typeof QRCodeValidationSchema>;
export type SotralSchedule = z.infer<typeof SotralScheduleSchema>;
export type SotralStats = z.infer<typeof SotralStatsSchema>;

// ==========================================
// TYPES POUR LES RÉPONSES API
// ==========================================

export interface SotralLineWithDetails extends SotralLine {
  category?: SotralLineCategory;
  stops?: SotralStop[];
  pricing_zones?: SotralPricingZone[];
}

export interface SotralTicketWithDetails extends SotralTicket {
  ticket_type?: SotralTicketType;
  line?: SotralLine;
  stop_from?: SotralStop;
  stop_to?: SotralStop;
  validations?: SotralTicketValidation[];
}

export interface PurchaseResponse {
  success: boolean;
  ticket?: SotralTicketWithDetails;
  qr_code?: string;
  message?: string;
  error?: string;
}

export interface ValidationResponse {
  success: boolean;
  ticket?: SotralTicketWithDetails;
  validation?: SotralTicketValidation;
  message?: string;
  error?: string;
}

export interface SotralPriceCalculation {
  distance_km: number;
  base_price_fcfa: number;
  is_student_discount: boolean;
  final_price_fcfa: number;
  zone_name: string;
}

// ==========================================
// ENUMS POUR LES CONSTANTES
// ==========================================

export enum TicketStatus {
  ACTIVE = 'active',
  USED = 'used',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled'
}

export enum PaymentMethod {
  MOBILE_MONEY = 'mobile_money',
  CARD = 'card',
  CASH = 'cash',
  USSD = 'ussd'
}

export enum ValidationMethod {
  QR_SCAN = 'qr_scan',
  NFC = 'nfc',
  MANUAL = 'manual'
}

export enum Direction {
  ALLER = 'aller',
  RETOUR = 'retour'
}

// ==========================================
// CONSTANTES MÉTIER
// ==========================================

export const SOTRAL_CONFIG = {
  TICKET_VALIDITY_HOURS: 2,
  STUDENT_PRICE_FCFA: 100,
  STUDENT_CARNET_PRICE_FCFA: 1000,
  STUDENT_YEARLY_PRICE_FCFA: 6500,
  MAX_TRIPS_YEARLY: 999999,
  QR_CODE_PREFIX: 'SOT',
  PRICE_ZONES: [
    { max_km: 5, price: 100 },
    { max_km: 10, price: 150 },
    { max_km: 15, price: 200 },
    { max_km: 20, price: 250 },
    { max_km: 999, price: 300 }
  ]
} as const;