/**
 * Simple Dashboard Component
 * Minimal dashboard for testing purposes
 */

import React from 'react';
import { Link } from 'react-router-dom';

const SimpleDashboard: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Simple Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-xl font-bold text-blue-600">IP Management</h1>
                <p className="text-xs text-gray-500">Bosch Rexroth - BURSA</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/" className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium">
                Dashboard
              </Link>
              <Link to="/domains" className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium">
                Domains
              </Link>
              <Link to="/vlans" className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium">
                VLANs
              </Link>
              <Link to="/ip-management" className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium">
                IP Management
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Dashboard Content */}
      <div className="p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Network Infrastructure Dashboard
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900">Active Domains</h3>
            <p className="text-3xl font-bold text-blue-600 mt-2">4</p>
            <p className="text-sm text-gray-500 mt-1">MFG, LOG, FCM, ENG</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900">VLANs</h3>
            <p className="text-3xl font-bold text-green-600 mt-2">47</p>
            <p className="text-sm text-gray-500 mt-1">Network segments active</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900">IP Allocations</h3>
            <p className="text-3xl font-bold text-purple-600 mt-2">1,247</p>
            <p className="text-sm text-gray-500 mt-1">Devices with assigned IPs</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900">Utilization</h3>
            <p className="text-3xl font-bold text-orange-600 mt-2">73%</p>
            <p className="text-sm text-gray-500 mt-1">Overall IP usage</p>
          </div>
        </div>

        {/* System Status */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">System Status</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
              <div>
                <p className="text-sm font-medium text-gray-900">System Health</p>
                <p className="text-xs text-gray-500">All services operational</p>
              </div>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
              <div>
                <p className="text-sm font-medium text-gray-900">Database</p>
                <p className="text-xs text-gray-500">Connected and responsive</p>
              </div>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
              <div>
                <p className="text-sm font-medium text-gray-900">API Services</p>
                <p className="text-xs text-gray-500">Online and available</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              to="/domains"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Manage Domains</p>
                <p className="text-xs text-gray-500">Add, edit business domains</p>
              </div>
            </Link>
            <Link
              to="/vlans"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Configure VLANs</p>
                <p className="text-xs text-gray-500">Network segmentation</p>
              </div>
            </Link>
            <Link
              to="/ip-management"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">IP Allocation</p>
                <p className="text-xs text-gray-500">Manage device IPs</p>
              </div>
            </Link>
            <Link
              to="/reports"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">View Reports</p>
                <p className="text-xs text-gray-500">Analytics & compliance</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export { SimpleDashboard };