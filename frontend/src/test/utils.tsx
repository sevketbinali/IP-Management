/**
 * Test Utilities
 * Helper functions and components for testing
 */

import React from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Custom render function with providers
const AllTheProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <BrowserRouter>
      {children}
      <Toaster />
    </BrowserRouter>
  );
};

const customRender = (ui: React.ReactElement, options?: Omit<RenderOptions, 'wrapper'>) =>
  render(ui, { wrapper: AllTheProviders, ...options });

// Re-export everything
export * from '@testing-library/react';
export { customRender as render };

// Mock data generators
export const mockDomain = (overrides = {}) => ({
  id: '1',
  name: 'MFG' as const,
  description: 'Manufacturing domain for production lines',
  valueStreamCount: 3,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  ...overrides,
});

export const mockVLAN = (overrides = {}) => ({
  id: '1',
  vlanId: 100,
  subnet: '192.168.1.0',
  subnetMask: 24,
  defaultGateway: '192.168.1.1',
  networkStart: '192.168.1.1',
  networkEnd: '192.168.1.254',
  zoneId: '1',
  zoneName: 'Manufacturing Zone A2',
  zoneManager: 'John Doe',
  lastFirewallCheck: null,
  firewall: 'bu4-fw-ha01',
  ipAllocationCount: 45,
  availableIpCount: 200,
  reservedIpCount: 7,
  totalIpCount: 254,
  utilizationPercentage: 18,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  ...overrides,
});

export const mockIPAllocation = (overrides = {}) => ({
  id: '1',
  vlanId: '1',
  vlanName: 'VLAN 100',
  ciName: 'TEST-DEVICE-01',
  macAddress: '00:11:22:33:44:55',
  ipAddress: '192.168.1.10',
  description: 'Test device for manufacturing line',
  allocationType: 'MANUAL' as const,
  status: 'ALLOCATED' as const,
  isReserved: false,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  ...overrides,
});

// Mock API responses
export const mockAPIResponse = <T>(data: T, meta = {}) => ({
  data,
  meta: {
    pagination: {
      page: 1,
      pageSize: 50,
      total: Array.isArray(data) ? data.length : 1,
      totalPages: 1,
    },
    ...meta,
  },
});

// Mock error response
export const mockAPIError = (message = 'Test error', code = 'TEST_ERROR') => ({
  code,
  message,
  timestamp: new Date().toISOString(),
});

// Wait for async operations
export const waitForAsync = () => new Promise(resolve => setTimeout(resolve, 0));