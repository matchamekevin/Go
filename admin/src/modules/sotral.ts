// Export centralisé pour tous les modules SOTRAL

// Types
export * from '../types/sotral';

// Hooks
export * from '../hooks/sotral';

// Composants
export * from '../components/sotral';

// Services  
export * as adminSotralService from '../services/adminSotralService';

// Pages (nouvelle architecture)
// La page principale actuelle
export { default as SotralTicketManagementPage } from '../pages/SotralTicketManagementPage';