import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { DashboardLayout } from '@shared/components/DashboardLayout';
import { Dashboard } from '@features/analytics/pages/Dashboard';
import { LinesManagement } from '@features/lines/pages/LinesManagement';
import { TicketsManagement } from '@features/tickets/pages/TicketsManagement';
import { TicketGeneration } from '@features/tickets/pages/TicketGeneration';

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        {/* Redirection par défaut vers le dashboard */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        
        {/* Routes principales avec layout */}
        <Route path="/" element={<DashboardLayout />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="lines" element={<LinesManagement />} />
          <Route path="tickets" element={<TicketsManagement />} />
          <Route path="tickets/generate" element={<TicketGeneration />} />
        </Route>
        
        {/* Route 404 */}
        <Route 
          path="*" 
          element={
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
                <p className="text-gray-600 mb-6">Page non trouvée</p>
                <a 
                  href="/dashboard" 
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Retour au tableau de bord
                </a>
              </div>
            </div>
          } 
        />
      </Routes>
    </div>
  );
}

export default App;