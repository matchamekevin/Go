// Types pour l'app scan
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

export interface ScanOperator {
  id: string
  email: string
  name: string
  role: 'scanner' | 'controller'
}

export interface TicketValidationResult {
  ticket: {
    id: string
    code: string
    status: 'unused' | 'used' | 'expired'
    product_name?: string
    product_price?: number
    user_email?: string
    purchased_at?: string
    used_at?: string
  }
  message: string
  isValid: boolean
}

export interface ScanHistoryItem {
  id: string
  ticketCode: string
  result: 'success' | 'failed' | 'already_used'
  timestamp: string
  operatorId: string
  message: string
}
