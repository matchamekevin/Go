import { apiClient } from './apiClient'
import type { ApiResponse, TicketValidationResult } from '../types/api'

export class ScanService {
  // Valider un ticket via code QR
  static async validateTicket(ticketCode: string): Promise<TicketValidationResult> {
    try {
      const response = await apiClient.post<ApiResponse<TicketValidationResult>>(
        '/tickets/validate',
        { ticket_code: ticketCode }
      )
      
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Erreur lors de la validation')
      }
      
      return response.data
    } catch (error: any) {
      // Transformer les erreurs réseau
      if (error.message === 'Network Error') {
        throw new Error('Impossible de contacter le serveur')
      }
      throw error
    }
  }

  // Vérifier la connexion au serveur
  static async healthCheck(): Promise<boolean> {
    try {
      const response = await apiClient.get<ApiResponse<any>>('/health')
      return response.success === true
    } catch (error) {
      return false
    }
  }

  // Récupérer les statistiques de scan
  static async getScanStats(): Promise<{
    totalScansToday: number
    validScansToday: number
    invalidScansToday: number
  }> {
    try {
      const response = await apiClient.get<ApiResponse<any>>('/scan/stats')
      
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Erreur lors de la récupération des stats')
      }
      
      return response.data
    } catch (error) {
      // Retourner des stats par défaut en cas d'erreur
      return {
        totalScansToday: 0,
        validScansToday: 0,
        invalidScansToday: 0,
      }
    }
  }
}
