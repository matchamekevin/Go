import { apiClient } from './apiClient'
import type { ApiResponse, TicketValidationResult } from '../types/api'

export class ScanService {
  // Valider un ticket via code QR
  static async validateTicket(ticketCode: string): Promise<TicketValidationResult> {
    console.log('🎫 [SCAN SERVICE] Validation du ticket:', ticketCode)
    
    try {
      // Route correcte: /tickets/validate (nécessite authentification + rôle validator/admin)
      const response = await apiClient.post<ApiResponse<TicketValidationResult>>(
        '/tickets/validate',
        { ticket_code: ticketCode }
      )
      
      console.log('📥 Réponse validation:', response)
      
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Erreur lors de la validation du ticket')
      }
      
      console.log('✅ Ticket validé:', response.data)
      return response.data
    } catch (error: any) {
      console.error('❌ Erreur validation ticket:', error)
      
      // Transformer les erreurs réseau
      if (error.message === 'Network Error' || error.code === 'ECONNABORTED') {
        throw new Error('Impossible de contacter le serveur. Vérifiez votre connexion internet.')
      }
      
      if (error.response) {
        const status = error.response.status
        const message = error.response.data?.error || error.response.data?.message
        
        if (status === 400) {
          throw new Error(message || 'Code QR invalide')
        } else if (status === 404) {
          throw new Error('Ticket introuvable')
        } else if (status === 401) {
          throw new Error('Session expirée. Veuillez vous reconnecter.')
        } else if (status >= 500) {
          throw new Error('Erreur serveur. Réessayez plus tard.')
        }
        
        throw new Error(message || 'Erreur lors de la validation')
      }
      
      throw error
    }
  }

  // Vérifier la connexion au serveur
  static async healthCheck(): Promise<boolean> {
    try {
      console.log('🏥 Vérification santé serveur...')
      const response = await apiClient.get<any>('/health')
      const isHealthy = response.status === 'ok' || response.success === true
      console.log(`🏥 Serveur: ${isHealthy ? 'OK ✅' : 'KO ❌'}`)
      return isHealthy
    } catch (error) {
      console.error('❌ Health check échoué:', error)
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
      console.log('📊 Récupération statistiques...')
      const response = await apiClient.get<ApiResponse<any>>('/tickets/stats')
      
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Erreur lors de la récupération des stats')
      }
      
      console.log('📊 Stats récupérées:', response.data)
      return response.data
    } catch (error) {
      console.error('❌ Erreur récupération stats:', error)
      // Retourner des stats par défaut en cas d'erreur
      return {
        totalScansToday: 0,
        validScansToday: 0,
        invalidScansToday: 0,
      }
    }
  }

  // Récupérer l'historique des scans
  static async getScanHistory(limit: number = 50): Promise<Array<any>> {
    try {
      console.log(`📜 Récupération historique (limit: ${limit})...`)
      const response = await apiClient.get<ApiResponse<any>>(
        `/scan/history?limit=${limit}`
      )
      
      if (!response.success || !response.data) {
        console.warn('⚠️ Pas de données historique')
        return []
      }
      
      console.log('📜 Historique récupéré:', response.data.length, 'entrées')
      return response.data
    } catch (error) {
      console.error('❌ Erreur récupération historique:', error)
      return []
    }
  }

  // Enregistrer un scan local (cache)
  static async saveLocalScan(scan: any): Promise<void> {
    try {
      // TODO: Implémenter le cache local avec AsyncStorage
      console.log('💾 Sauvegarde scan local:', scan)
    } catch (error) {
      console.error('❌ Erreur sauvegarde scan local:', error)
    }
  }
}
