/**
 * Main Application Component
 * 
 * Industrial-grade IP Management interface with avant-garde design
 * optimized for IT/OT network operations at Bosch Rexroth facilities.
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Toaster } from 'react-hot-toast';

import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import DomainManagement from './pages/DomainManagement';
import VLANManagement from './pages/VLANManagement';
import IPManagement from './pages/IPManagement';
import SecurityCompliance from './pages/SecurityCompliance';
import NetworkHierarchy from './pages/NetworkHierarchy';

// React Query client with optimized settings for industrial environments
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      retry: 3,
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      retry: 1,
    },
  },
});

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="min-h-screen bg-slate-50">
          <Layout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/domains" element={<DomainManagement />} />
              <Route path="/vlans" element={<VLANManagement />} />
              <Route path="/ip-management" element={<IPManagement />} />
              <Route path="/security" element={<SecurityCompliance />} />
              <Route path="/hierarchy" element={<NetworkHierarchy />} />
            </Routes>
          </Layout>
          
          {/* Toast notifications with industrial styling */}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#1e293b',
                color: '#f1f5f9',
                border: '1px solid #334155',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '500',
              },
              success: {
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#f1f5f9',
                },
              },
              error: {
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#f1f5f9',
                },
              },
            }}
          />
        </div>
      </Router>
    </QueryClientProvider>
  );
};

export default App;