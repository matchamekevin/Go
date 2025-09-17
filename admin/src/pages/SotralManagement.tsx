import React, { useState } from 'react';
import SotralDashboard from '../components/SotralDashboard';
import SotralLines from '../components/SotralLines';
import SotralTickets from '../components/SotralTickets';

type SotralTab = 'dashboard' | 'lines' | 'tickets';

interface TabButtonProps {
  tab: SotralTab;
  activeTab: SotralTab;
  onClick: (tab: SotralTab) => void;
  children: React.ReactNode;
  count?: number;
}

const TabButton: React.FC<TabButtonProps> = ({ tab, activeTab, onClick, children, count }) => {
  const isActive = activeTab === tab;
  
  return (
    <button
      onClick={() => onClick(tab)}
      className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
        isActive
          ? 'bg-indigo-600 text-white'
          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
      }`}
    >
      <span className="flex items-center space-x-2">
        <span>{children}</span>
        {count !== undefined && (
          <span className={`px-2 py-1 rounded-full text-xs ${
            isActive 
              ? 'bg-indigo-500 text-white' 
              : 'bg-gray-200 text-gray-600'
          }`}>
            {count}
          </span>
        )}
      </span>
    </button>
  );
};

const SotralManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<SotralTab>('dashboard');

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <SotralDashboard />;
      case 'lines':
        return <SotralLines />;
      case 'tickets':
        return <SotralTickets />;
      default:
        return <SotralDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header avec navigation */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Gestion SOTRAL
              </h1>
              <p className="mt-1 text-sm text-gray-600">
                Système de gestion des transports publics de Lomé
              </p>
            </div>
            
            {/* Health Check Button */}
            <div>
              <button
                onClick={async () => {
                  try {
                    const health = await import('../services/sotralService').then(
                      (module) => module.default.healthCheck()
                    );
                    alert(`Service Status: ${health.status}\nTimestamp: ${health.timestamp}`);
                  } catch (error) {
                    alert('Erreur lors de la vérification du service');
                  }
                }}
                className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
              >
                🩺 Health Check
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="border-t border-gray-200">
            <nav className="flex space-x-2 py-4">
              <TabButton
                tab="dashboard"
                activeTab={activeTab}
                onClick={setActiveTab}
              >
                📊 Tableau de bord
              </TabButton>
              
              <TabButton
                tab="lines"
                activeTab={activeTab}
                onClick={setActiveTab}
              >
                🚌 Lignes
              </TabButton>
              
              <TabButton
                tab="tickets"
                activeTab={activeTab}
                onClick={setActiveTab}
              >
                🎫 Tickets
              </TabButton>
            </nav>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderContent()}
      </div>
    </div>
  );
};

export default SotralManagement;