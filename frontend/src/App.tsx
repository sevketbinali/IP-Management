/**
 * Main Application Component
 * Industrial-grade IP Management interface for IT/OT network operations
 */

import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Layout } from '@/components/Layout';
import { Dashboard } from '@/components/Dashboard';
import { DomainManagement } from '@/components/DomainManagement';
import { useAppStore } from '@/stores/useAppStore';

const App: React.FC = () => {
  const { checkHealth } = useAppStore();

  // Initialize app on mount
  useEffect(() => {
    checkHealth();
  }, [checkHealth]);

  return (
    <Router>
      <div className="min-h-screen bg-secondary-50">
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/domains" element={<DomainManagement />} />
            <Route path="/vlans" element={<div>VLAN Management - Coming Soon</div>} />
            <Route path="/ip-management" element={<div>IP Management - Coming Soon</div>} />
            <Route path="/reports" element={<div>Reports - Coming Soon</div>} />
            <Route path="/settings" element={<div>Settings - Coming Soon</div>} />
          </Routes>
        </Layout>

        {/* Toast notifications */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#fff',
              color: '#1e293b',
              border: '1px solid #e2e8f0',
              borderRadius: '0.5rem',
              fontSize: '0.875rem',
            },
            success: {
              iconTheme: {
                primary: '#22c55e',
                secondary: '#fff',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
      </div>
    </Router>
  );
};

export default App;