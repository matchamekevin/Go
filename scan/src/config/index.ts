// Configuration API pour l'app scan - Version simplifiée

// URL de production du backend GoSOTRAL
export const API_BASE_URL = 'https://go-j2rr.onrender.com'

// Clés de stockage AsyncStorage - Export direct
export const STORAGE_KEY_TOKEN = 'scan_token'
export const STORAGE_KEY_OPERATOR = 'scan_operator'
export const STORAGE_KEY_LAST_SYNC = 'scan_last_sync'

// Configuration
export const API_TIMEOUT = 15000
export const SCAN_INTERVAL = 1000
export const VIBRATION_ENABLED = true
export const SOUND_ENABLED = true
export const DEBUG_MODE = __DEV__ || false
export const APP_NAME = 'GoSOTRAL Scan'
export const APP_VERSION = '1.0.0'
