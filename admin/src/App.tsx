import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import DashboardLayout from './components/DashboardLayout';
import LoadingSpinner from './components/LoadingSpinner';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import UsersPage from './pages/UsersPage';
import TicketsPage from './pages/TicketsPage';
import PaymentsPage from './pages/PaymentsPage';
import ProductsPage from './pages/ProductsPage';
import ReportsPage from './pages/ReportsPage';
import MessagesPage from './pages/MessagesPage';
import HelpPage from './pages/HelpPage';
import SettingsPage from './pages/SettingsPage';
import StatisticsPage from './pages/StatisticsPage';
import SotralManagementPage from './pages/SotralManagementPage';
import './index.css';

// Configuration React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

// Composant pour protéger les routes privées
const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-mesh">
        <LoadingSpinner size="lg" color="green" text="Chargement..." />
      </div>
    );
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

// Composant pour rediriger les utilisateurs connectés
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-mesh">
        <LoadingSpinner size="lg" color="green" text="Chargement..." />
      </div>
    );
  }

  return !isAuthenticated ? <>{children}</> : <Navigate to="/dashboard" replace />;
};

const AppContent: React.FC = () => {
  return (
    <Router>
      <Routes>
        {/* Routes publiques */}
        <Route 
          path="/login" 
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          } 
        />

        {/* Routes privées */}
        <Route 
          path="/" 
          element={
            <PrivateRoute>
              <DashboardLayout />
            </PrivateRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="tickets" element={<TicketsPage />} />
          <Route path="payments" element={<PaymentsPage />} />
          <Route path="products" element={<ProductsPage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="messages" element={<MessagesPage />} />
          <Route path="help" element={<HelpPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="statistics" element={<StatisticsPage />} />
          <Route path="sotral" element={<SotralManagementPage />} />
          <Route path="routes" element={<Navigate to="/dashboard" replace />} />
          <Route path="transactions" element={<Navigate to="/dashboard" replace />} />
          <Route path="stats" element={<Navigate to="/statistics" replace />} />
        </Route>

        {/* Route 404 */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
};

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppContent />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: 'rgba(255, 255, 255, 0.9)',
              color: '#1e293b',
              borderRadius: '0.75rem',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
              padding: '0.75rem 1rem',
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#10B981',
                secondary: '#fff',
              },
              style: {
                background: 'rgba(240, 253, 244, 0.95)',
                borderLeft: '4px solid #10B981',
              },
            },
            error: {
              duration: 5000,
              iconTheme: {
                primary: '#F43F5E',
                secondary: '#fff',
              },
              style: {
                background: 'rgba(254, 242, 242, 0.95)',
                borderLeft: '4px solid #F43F5E',
              },
            },
          }}
        />
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
