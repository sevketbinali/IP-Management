/**
 * Main Layout Component
 * 
 * Avant-garde industrial interface with intentional minimalism.
 * Designed for high-stakes IT/OT network operations with zero cognitive load.
 */

import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  HomeIcon, 
  ServerIcon, 
  GlobeAltIcon, 
  ShieldCheckIcon,
  ChartBarIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { cn } from '../utils/cn';

interface LayoutProps {
  children: React.ReactNode;
}

const navigation = [
  { name: 'Dashboard', href: '/', icon: HomeIcon },
  { name: 'Domains', href: '/domains', icon: ChartBarIcon },
  { name: 'VLANs', href: '/vlans', icon: ServerIcon },
  { name: 'IP Management', href: '/ip-management', icon: GlobeAltIcon },
  { name: 'Security', href: '/security', icon: ShieldCheckIcon },
  { name: 'Network Hierarchy', href: '/hierarchy', icon: ChartBarIcon },
];

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between h-16 px-6 bg-slate-800">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <ServerIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-sm font-semibold text-white">IP Management</h1>
                <p className="text-xs text-slate-400">Bosch Rexroth</p>
              </div>
            </div>
            
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-slate-400 hover:text-white"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors duration-200",
                    isActive
                      ? "bg-blue-600 text-white"
                      : "text-slate-300 hover:bg-slate-800 hover:text-white"
                  )}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-slate-800">
            <div className="text-xs text-slate-500">
              <p>Bursa Factory</p>
              <p>IT/OT Network Management</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-6">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-slate-500 hover:text-slate-700"
          >
            <Bars3Icon className="w-6 h-6" />
          </button>
          
          <div className="flex items-center space-x-4">
            <div className="text-sm text-slate-600">
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;