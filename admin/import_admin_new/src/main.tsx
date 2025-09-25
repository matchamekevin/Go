import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import App from './App';
import './index.css';

// Configuration React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

// Configuration Toast
const toastOptions = {
  duration: 5000,
  position: 'top-right' as const,
  style: {
    background: '#363636',
    color: '#fff',
    borderRadius: '8px',
    padding: '12px 16px',
    fontSize: '14px',
    maxWidth: '400px',
  },
  success: {
    iconTheme: {
      primary: '#10B981',
      secondary: '#fff',
    },
  },
  error: {
    iconTheme: {
      primary: '#EF4444',
      secondary: '#fff',
    },
    duration: 6000,
  },
};

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
        <Toaster {...toastOptions} />
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
);