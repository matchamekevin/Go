// Types TypeScript pour l'API GoSOTRAL Scan

/**
 * Réponse générique de l'API
 */
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

/**
 * Opérateur de scan (contrôleur)
 */
export interface ScanOperator {
  id: string
  email: string
  name: string
  role: 'scanner' | 'controller' | 'admin'
  createdAt?: string
}

/**
 * Informations détaillées d'un ticket
 */
export interface TicketInfo {
  id: string
  code: string
  status: 'unused' | 'used' | 'expired' | 'cancelled'
  product_name?: string
  product_price?: number
  product_type?: string
  user_id?: string
  user_email?: string
  user_name?: string
  purchased_at?: string
  used_at?: string | null
  expires_at?: string | null
  qr_code?: string
}

/**
 * Résultat de la validation d'un ticket
 */
export interface TicketValidationResult {
  isValid: boolean
  message: string
  ticket?: TicketInfo | null
  validation_time?: string
  operator_id?: string
}

/**
 * Entrée de l'historique des scans
 */
export interface ScanHistoryItem {
  id: string
  ticket_code: string
  ticket_id?: string
  result: 'valid' | 'invalid' | 'already_used' | 'expired' | 'not_found'
  message: string
  scanned_at: string
  operator_id: string
  operator_name?: string
  ticket_info?: Partial<TicketInfo>
}

/**
 * Statistiques de scan
 */
export interface ScanStats {
  totalScansToday: number
  validScansToday: number
  invalidScansToday: number
  lastScanTime?: string
}
