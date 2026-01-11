import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { IPManagementDashboard } from '@/components/IPManagementDashboard';
import { DeviceManagement } from '@/components/DeviceManagement';
import { ReportsAnalytics } from '@/components/ReportsAnalytics';
import { DomainVlanView } from '@/components/DomainVlanView';
import { DomainManagement } from '@/components/DomainManagement';

// Error Boundary Component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('App Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h1>
            <p className="text-gray-700 mb-4">
              The application encountered an error. Please refresh the page or contact support.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Refresh Page
            </button>
            {this.state.error && (
              <details className="mt-4">
                <summary className="text-sm text-gray-500 cursor-pointer">Error Details</summary>
                <pre className="text-xs text-gray-600 mt-2 overflow-auto">
                  {this.state.error.toString()}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            <Route path="/" element={<IPManagementDashboard />} />
            <Route path="/domains" element={<DomainManagement />} />
            <Route path="/domains/:domainId" element={<DomainVlanView />} />
            <Route path="/vlans" element={
              <div className="p-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">VLAN Management</h1>
                <div className="bg-white p-6 rounded-lg shadow">
                  <p className="text-gray-600 mb-4">Configure network segmentation and VLAN settings</p>
                  <div className="text-center py-8">
                    <p className="text-gray-500">VLAN configuration interface coming soon...</p>
                  </div>
                </div>
              </div>
            } />
            <Route path="/ip-management" element={<DeviceManagement />} />
            <Route path="/ip-management/devices" element={<DeviceManagement />} />
            <Route path="/reports" element={<ReportsAnalytics />} />
            <Route path="/settings" element={
              <div className="p-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">System Settings</h1>
                <div className="bg-white p-6 rounded-lg shadow">
                  <p className="text-gray-600 mb-4">System configuration and preferences</p>
                  <div className="text-center py-8">
                    <p className="text-gray-500">Settings interface coming soon...</p>
                  </div>
                </div>
              </div>
            } />
            <Route path="*" element={<IPManagementDashboard />} />
          </Routes>
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
            }}
          />
        </div>
      </Router>
    </ErrorBoundary>
  );
};

export default App;