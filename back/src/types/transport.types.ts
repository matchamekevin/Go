// Types pour le système de transport SOTRAL

// Lignes de transport
export interface SotralLine {
  id: string;
  code: string; // L1, L2, etc.
  name: string;
  type: 'ordinary' | 'student';
  route: {
    start: string;
    end: string;
    stops: string[];
  };
  basePrice: number;
  estimatedDuration: number; // en minutes
  color: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

// Trajets programmés
export interface SotralTrip {
  id: string;
  lineId: string;
  line?: SotralLine;
  departureTime: string;
  arrivalTime: string;
  price: number;
  totalSeats: number;
  availableSeats: number;
  busNumber?: string;
  status: 'scheduled' | 'running' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

// Produits de tickets
export interface TicketProduct {
  id: string;
  name: string;
  type: 'single' | 'daily' | 'weekly' | 'monthly' | 'student_single' | 'student_monthly';
  price: number;
  validityDuration: number; // en minutes
  description?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

// Tickets virtuels avec QR
export interface VirtualTicket {
  id: string;
  ticketCode: string;
  userId: number;
  productId: string;
  product?: TicketProduct;
  lineId?: string;
  line?: SotralLine;
  tripId?: string;
  trip?: SotralTrip;
  qrCode: string;
  status: 'active' | 'used' | 'expired' | 'cancelled';
  purchasePrice: number;
  validFrom: string;
  validUntil: string;
  usedAt?: string;
  passengerName: string;
  passengerPhone: string;
  seatNumber?: string;
  createdAt: string;
  updatedAt: string;
}

// Paiements mobile money
export interface MobilePayment {
  id: string;
  ticketId: string;
  amount: number;
  currency: string;
  provider: 'yass' | 'flooz';
  phoneNumber: string;
  transactionId?: string;
  externalReference?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  initiatedAt: string;
  completedAt?: string;
  failureReason?: string;
  webhookData?: any;
  createdAt: string;
  updatedAt: string;
}

// Recherche de transport
export interface TransportSearchQuery {
  from?: string;
  to?: string;
  date?: string;
  type?: 'ordinary' | 'student';
  maxPrice?: number;
}

export interface TransportSearchResult {
  lines: SotralLine[];
  trips: SotralTrip[];
  totalResults: number;
}

// Achat de ticket
export interface TicketPurchaseRequest {
  productId: string;
  lineId?: string;
  tripId?: string;
  passengerName: string;
  passengerPhone: string;
  paymentMethod: 'yass' | 'flooz';
  paymentPhone: string;
}

export interface TicketPurchaseResponse {
  ticket: VirtualTicket;
  payment: MobilePayment;
  paymentUrl?: string; // Pour redirection si nécessaire
}

// Configuration paiement
export interface PaymentConfig {
  id: string;
  provider: 'yass' | 'flooz';
  apiKey: string;
  apiSecret: string;
  webhookUrl: string;
  isSandbox: boolean;
  active: boolean;
}

// Réponses API Yass
export interface YassPaymentResponse {
  success: boolean;
  transaction_id: string;
  reference: string;
  status: string;
  message?: string;
}

// Réponses API Flooz
export interface FloozPaymentResponse {
  status: string;
  transaction_id: string;
  reference: string;
  message?: string;
  success: boolean;
}

// Webhook data structure
export interface PaymentWebhookData {
  transaction_id: string;
  status: string;
  amount: number;
  phone: string;
  reference?: string;
  timestamp: string;
  provider: 'yass' | 'flooz';
}
