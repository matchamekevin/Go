// Configuration par défaut - à adapter selon l'environnement
const API_BASE_URL = 'http://localhost:7000';

// ==========================================
// TYPES POUR L'APPLICATION SCANNER
// ==========================================

export interface TicketValidationRequest {
  ticket_code: string;
  line_id?: number;
  stop_id?: number;
  validator_device_id?: string;
}

export interface ValidationResponse {
  success: boolean;
  message: string;
  ticket?: {
    id: number;
    ticket_code: string;
    line_name?: string;
    line_number?: number;
    stop_from?: string;
    stop_to?: string;
    trips_remaining: number;
    status: string;
    price_paid_fcfa: number;
    ticket_type?: string;
    user_id?: number;
  };
  validation?: {
    validated_at: string;
    location?: string;
    validator_id?: string;
  };
  error?: string;
}

export interface ScannerInfo {
  scanner_id: string;
  line_id?: number;
  stop_id?: number;
  location?: {
    latitude: number;
    longitude: number;
  };
}

// ==========================================
// CLIENT API POUR SCANNER
// ==========================================

class ScannerApiClient {
  private baseURL: string;
  private scannerToken: string | null = null;
  private scannerInfo: ScannerInfo | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  setScannerToken(token: string) {
    this.scannerToken = token;
  }

  setScannerInfo(info: ScannerInfo) {
    this.scannerInfo = info;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.scannerToken) {
      headers.Authorization = `Bearer ${this.scannerToken}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }
}

// ==========================================
// SERVICE SCANNER SOTRAL
// ==========================================

export class SotralScannerService {
  private static client = new ScannerApiClient(API_BASE_URL);
  private static scannerInfo: ScannerInfo | null = null;

  // ==========================================
  // CONFIGURATION DU SCANNER
  // ==========================================

  static initializeScanner(scannerInfo: ScannerInfo, authToken?: string) {
    this.scannerInfo = scannerInfo;
    this.client.setScannerInfo(scannerInfo);
    
    if (authToken) {
      this.client.setScannerToken(authToken);
    }
  }

  static getScannerInfo(): ScannerInfo | null {
    return this.scannerInfo;
  }

  // ==========================================
  // VALIDATION DE TICKETS
  // ==========================================

  static async validateTicketQR(qrCode: string): Promise<ValidationResponse> {
    try {
      // Extraire le code ticket du QR code
      const ticketCode = this.extractTicketCodeFromQR(qrCode);
      
      const validationRequest: TicketValidationRequest = {
        ticket_code: ticketCode,
        ...(this.scannerInfo?.scanner_id && { validator_device_id: this.scannerInfo.scanner_id }),
        ...(this.scannerInfo?.line_id && { line_id: this.scannerInfo.line_id }),
        ...(this.scannerInfo?.stop_id && { stop_id: this.scannerInfo.stop_id }),
      };

      const response = await this.client.post<ValidationResponse>('/sotral/validate-ticket', validationRequest);
      return response;
    } catch (error) {
      console.error('Error validating ticket:', error);
      return {
        success: false,
        message: 'Erreur lors de la validation du ticket',
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  }

  // ==========================================
  // VALIDATION HORS LIGNE (mode dégradé)
  // ==========================================

  static validateTicketOffline(qrCode: string): ValidationResponse {
    // Validation basique hors ligne
    // Dans un vrai système, on vérifierait la signature cryptographique du QR code
    
    try {
      // Exemple de format QR: SOTRAL_TICKET:CODE123456:EXPIRES_TIMESTAMP
      const parts = qrCode.split(':');
      
      if (parts.length < 3 || parts[0] !== 'SOTRAL_TICKET') {
        return {
          success: false,
          message: 'QR code invalide'
        };
      }

      const ticketCode = parts[1];
      const expiresTimestamp = parseInt(parts[2]);
      
      if (isNaN(expiresTimestamp)) {
        return {
          success: false,
          message: 'Format de QR code invalide'
        };
      }

      const now = Date.now();
      if (expiresTimestamp < now) {
        return {
          success: false,
          message: 'Ticket expiré'
        };
      }

      return {
        success: true,
        message: 'Ticket validé hors ligne',
        ticket: {
          id: 0,
          ticket_code: ticketCode,
          trips_remaining: 1,
          status: 'active',
          price_paid_fcfa: 0
        },
        validation: {
          validated_at: new Date().toISOString(),
          location: 'Validation hors ligne'
        }
      };
    } catch (error) {
      return {
        success: false,
        message: 'Erreur lors de la validation hors ligne',
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  }

  // ==========================================
  // HEALTH CHECK
  // ==========================================

  static async checkConnection(): Promise<boolean> {
    try {
      await this.client.get('/sotral/health');
      return true;
    } catch (error) {
      console.log('Connection check failed:', error);
      return false;
    }
  }

  // ==========================================
  // UTILITAIRES SCANNER
  // ==========================================

  static extractTicketCodeFromQR(qrCode: string): string {
    // Si le QR code est un simple code ticket, le retourner tel quel
    if (qrCode.startsWith('SOT')) {
      return qrCode;
    }
    
    // Si c'est un QR code complexe, essayer d'extraire le code
    try {
      // Format base64 décodé
      if (qrCode.startsWith('data:text/plain;base64,')) {
        const base64Data = qrCode.split(',')[1];
        return atob(base64Data);
      }
      
      // Format JSON
      const parsed = JSON.parse(qrCode);
      if (parsed.ticket_code) {
        return parsed.ticket_code;
      }
      
      // Format avec délimiteurs
      if (qrCode.includes(':')) {
        const parts = qrCode.split(':');
        for (const part of parts) {
          if (part.startsWith('SOT')) {
            return part;
          }
        }
      }
    } catch (error) {
      // Si l'extraction échoue, traiter comme un code simple
    }
    
    return qrCode;
  }

  static formatValidationMessage(response: ValidationResponse): string {
    if (!response.success) {
      return response.message || 'Validation échouée';
    }

    let message = '✅ Ticket valide';
    
    if (response.ticket) {
      if (response.ticket.line_name) {
        message += `\n🚌 ${response.ticket.line_name}`;
      }
      
      if (response.ticket.trips_remaining !== undefined) {
        message += `\n🎫 ${response.ticket.trips_remaining} voyage(s) restant(s)`;
      }
      
      if (response.ticket.price_paid_fcfa) {
        message += `\n💰 ${this.formatCurrency(response.ticket.price_paid_fcfa)}`;
      }
    }

    return message;
  }

  static formatCurrency(amount: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
    }).format(amount).replace('XOF', 'FCFA');
  }

  static getValidationResultColor(success: boolean): string {
    return success ? '#10B981' : '#EF4444'; // Green for success, Red for failure
  }

  static getValidationResultIcon(success: boolean): string {
    return success ? '✅' : '❌';
  }

  // ==========================================
  // STATISTIQUES SCANNER (optionnel)
  // ==========================================

  static async getScannerStats(scannerId: string, date?: string): Promise<{
    total_scans: number;
    successful_validations: number;
    failed_validations: number;
    unique_tickets: number;
  }> {
    try {
      const query = date ? `?date=${date}` : '';
      const response = await this.client.get<{ data: any }>(`/sotral/scanner/${scannerId}/stats${query}`);
      return response.data;
    } catch (error) {
      console.error('Error getting scanner stats:', error);
      return {
        total_scans: 0,
        successful_validations: 0,
        failed_validations: 0,
        unique_tickets: 0
      };
    }
  }

  // ==========================================
  // GESTION DES ERREURS COURANTES
  // ==========================================

  static getErrorHelpText(error: string): string {
    const errorHelp: Record<string, string> = {
      'QR code invalide': 'Assurez-vous que le QR code est bien visible et non endommagé',
      'Ticket expiré': 'Ce ticket n\'est plus valide. L\'utilisateur doit acheter un nouveau ticket',
      'Ticket déjà utilisé': 'Ce ticket a déjà été validé et ne peut plus être utilisé',
      'Ticket annulé': 'Ce ticket a été annulé et n\'est plus valide',
      'Erreur de connexion': 'Vérifiez votre connexion internet. Mode hors ligne disponible',
      'Format de QR code invalide': 'Le QR code ne correspond pas au format SOTRAL'
    };

    return errorHelp[error] || 'Erreur inconnue. Contactez le support technique.';
  }
}

export default SotralScannerService;