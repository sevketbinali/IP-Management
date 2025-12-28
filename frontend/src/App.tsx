/**
 * Main Application Component
 * 
 * Industrial-grade IP Management interface for IT/OT network operations
 * at Bosch Rexroth facilities.
 */

import React, { useState, useEffect } from 'react';
import axios from 'axios';

// API configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
const PLANT_CODE = import.meta.env.VITE_PLANT_CODE || 'BURSA';
const ORGANIZATION = import.meta.env.VITE_ORGANIZATION || 'Bosch Rexroth';

interface HealthStatus {
  status: string;
  service: string;
  version: string;
}

const App: React.FC = () => {
  const [healthStatus, setHealthStatus] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkHealth();
  }, []);

  const checkHealth = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL.replace('/api/v1', '')}/health`);
      setHealthStatus(response.data);
      setError(null);
    } catch (err) {
      setError('Unable to connect to backend API');
      console.error('Health check failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      {/* Header */}
      <header style={{ 
        backgroundColor: '#1e293b', 
        color: 'white', 
        padding: '1rem 0',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{
                width: '2.5rem',
                height: '2.5rem',
                backgroundColor: '#3b82f6',
                borderRadius: '0.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.25rem',
                fontWeight: 'bold'
              }}>
                IP
              </div>
              <div>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>
                  IP Management System
                </h1>
                <p style={{ fontSize: '0.875rem', opacity: 0.8, margin: 0 }}>
                  {ORGANIZATION} - {PLANT_CODE} Factory
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {loading ? (
                <div className="spinner"></div>
              ) : healthStatus ? (
                <div className="status-badge status-active">
                  ● {healthStatus.status}
                </div>
              ) : (
                <div className="status-badge status-inactive">
                  ● disconnected
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ padding: '2rem 0' }}>
        <div className="container">
          {error ? (
            <div className="card" style={{ borderLeft: '4px solid #ef4444' }}>
              <h2 style={{ color: '#dc2626', marginBottom: '1rem' }}>Connection Error</h2>
              <p style={{ marginBottom: '1rem' }}>{error}</p>
              <button className="btn btn-primary" onClick={checkHealth}>
                Retry Connection
              </button>
            </div>
          ) : (
            <>
              {/* Welcome Section */}
              <div className="card">
                <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>
                  Welcome to IP Management & VLAN Segmentation System
                </h2>
                <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
                  Enterprise-grade IP address management for IT/OT industrial environments.
                  Manage device IP allocations, VLAN segmentation, and security zone compliance
                  across manufacturing, logistics, facility, and engineering domains.
                </p>
                
                {healthStatus && (
                  <div style={{ 
                    backgroundColor: '#f0f9ff', 
                    border: '1px solid #0ea5e9',
                    borderRadius: '0.5rem',
                    padding: '1rem',
                    marginBottom: '1rem'
                  }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                      System Status
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                      <div>
                        <span style={{ fontWeight: '500' }}>Service:</span> {healthStatus.service}
                      </div>
                      <div>
                        <span style={{ fontWeight: '500' }}>Version:</span> {healthStatus.version}
                      </div>
                      <div>
                        <span style={{ fontWeight: '500' }}>Status:</span> 
                        <span className="status-badge status-active" style={{ marginLeft: '0.5rem' }}>
                          {healthStatus.status}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Features Grid */}
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
                gap: '1.5rem',
                marginBottom: '2rem'
              }}>
                <div className="card">
                  <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                    🏭 Domain Management
                  </h3>
                  <p style={{ color: '#6b7280', marginBottom: '1rem' }}>
                    Manage business domains: Manufacturing (MFG), Logistics (LOG), 
                    Facility Management (FCM), and Engineering (ENG).
                  </p>
                  <a 
                    href={`${API_BASE_URL.replace('/api/v1', '')}/api/docs#/Domains`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-secondary"
                  >
                    View API Docs
                  </a>
                </div>

                <div className="card">
                  <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                    🛡️ Security Zones
                  </h3>
                  <p style={{ color: '#6b7280', marginBottom: '1rem' }}>
                    Configure security zones with proper classifications: SL3, MFZ_SL4, 
                    LOG_SL4, FMZ_SL4, ENG_SL4, LRSZ_SL4, RSZ_SL4.
                  </p>
                  <a 
                    href={`${API_BASE_URL.replace('/api/v1', '')}/api/docs#/Zones`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-secondary"
                  >
                    View API Docs
                  </a>
                </div>

                <div className="card">
                  <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                    🌐 VLAN Management
                  </h3>
                  <p style={{ color: '#6b7280', marginBottom: '1rem' }}>
                    Automatic IP allocation with reserved management IPs. 
                    First 6 IPs and last IP are reserved and non-assignable.
                  </p>
                  <a 
                    href={`${API_BASE_URL.replace('/api/v1', '')}/api/docs#/VLANs`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-secondary"
                  >
                    View API Docs
                  </a>
                </div>

                <div className="card">
                  <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                    📊 IP Assignments
                  </h3>
                  <p style={{ color: '#6b7280', marginBottom: '1rem' }}>
                    Assign IP addresses to devices with CI Name, MAC Address, 
                    and description. Comprehensive validation and audit trail.
                  </p>
                  <a 
                    href={`${API_BASE_URL.replace('/api/v1', '')}/api/docs#/IP%20Assignments`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-secondary"
                  >
                    View API Docs
                  </a>
                </div>

                <div className="card">
                  <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                    📈 Reports & Analytics
                  </h3>
                  <p style={{ color: '#6b7280', marginBottom: '1rem' }}>
                    Network hierarchy visualization and security compliance reports 
                    for audit and operational purposes.
                  </p>
                  <a 
                    href={`${API_BASE_URL.replace('/api/v1', '')}/api/docs#/Reports`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-secondary"
                  >
                    View API Docs
                  </a>
                </div>

                <div className="card">
                  <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                    🔧 API Documentation
                  </h3>
                  <p style={{ color: '#6b7280', marginBottom: '1rem' }}>
                    Complete interactive API documentation with request/response 
                    examples and testing capabilities.
                  </p>
                  <a 
                    href={`${API_BASE_URL.replace('/api/v1', '')}/api/docs`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary"
                  >
                    Open API Docs
                  </a>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="card">
                <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>
                  Quick Actions
                </h3>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                  <a 
                    href={`${API_BASE_URL.replace('/api/v1', '')}/api/docs`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary"
                  >
                    📖 API Documentation
                  </a>
                  <a 
                    href={`${API_BASE_URL}/reports/network-hierarchy`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-secondary"
                  >
                    🌐 Network Hierarchy
                  </a>
                  <a 
                    href={`${API_BASE_URL}/reports/security-compliance`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-secondary"
                  >
                    🛡️ Security Report
                  </a>
                  <button 
                    className="btn btn-secondary"
                    onClick={checkHealth}
                  >
                    🔄 Refresh Status
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer style={{ 
        backgroundColor: '#1e293b', 
        color: 'white', 
        padding: '1.5rem 0',
        marginTop: '2rem'
      }}>
        <div className="container">
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            <div>
              <p style={{ margin: 0, fontSize: '0.875rem' }}>
                © 2024 {ORGANIZATION} - {PLANT_CODE} Factory
              </p>
              <p style={{ margin: 0, fontSize: '0.75rem', opacity: 0.8 }}>
                IT/OT Network Infrastructure Management
              </p>
            </div>
            <div style={{ fontSize: '0.875rem', opacity: 0.8 }}>
              Industrial IP Management System v1.0.0
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;