/**
 * Layout Component
 * Main application layout with navigation and sidebar
 */

import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Bars3Icon,
  XMarkIcon,
  HomeIcon,
  ServerIcon,
  GlobeAltIcon,
  ChartBarIcon,
  CogIcon,
  BuildingOfficeIcon,
  TableCellsIcon,
  PlusIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline';
import { cn } from '@/utils';

interface LayoutProps {
  children: React.ReactNode;
}

const navigation = [
  { name: 'Dashboard', href: '/', icon: HomeIcon, description: 'System overview and statistics' },
  { 
    name: 'IP Management', 
    icon: GlobeAltIcon,
    children: [
      { name: 'IP Allocation Table', href: '/ip-allocation', icon: TableCellsIcon, description: 'View and manage all IP assignments' },
      { name: 'Device Assignment', href: '/ip-assignment', icon: PlusIcon, description: 'Assign IPs to new devices' },
      { name: 'Device Management', href: '/ip-management', icon: GlobeAltIcon, description: 'Manage registered devices' },
    ]
  },
  { 
    name: 'Network Configuration', 
    icon: ServerIcon,
    children: [
      { name: 'Domains', href: '/domains', icon: BuildingOfficeIcon, description: 'Manage business domains' },
      { name: 'VLAN Management', href: '/vlans', icon: ServerIcon, description: 'Configure network segmentation' },
    ]
  },
  { name: 'Reports & Analytics', href: '/reports', icon: ChartBarIcon, description: 'Network usage and compliance reports' },
  { name: 'System Configuration', href: '/system', icon: Cog6ToothIcon, description: 'System health and settings' },
  { name: 'Settings', href: '/settings', icon: CogIcon, description: 'Application preferences' },
];

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState<string[]>(['IP Management', 'Network Configuration']);
  const location = useLocation();

  const toggleSection = (sectionName: string) => {
    setExpandedSections(prev => 
      prev.includes(sectionName) 
        ? prev.filter(name => name !== sectionName)
        : [...prev, sectionName]
    );
  };

  const isActiveRoute = (href: string) => {
    return location.pathname === href || 
      (href !== '/' && location.pathname.startsWith(href));
  };

  const renderNavigationItem = (item: any, isMobile: boolean = false) => {
    if (item.children) {
      const isExpanded = expandedSections.includes(item.name);
      const hasActiveChild = item.children.some((child: any) => isActiveRoute(child.href));
      
      return (
        <div key={item.name}>
          <button
            onClick={() => toggleSection(item.name)}
            className={cn(
              'group flex items-center w-full px-2 py-2 text-sm font-medium rounded-md',
              hasActiveChild || isExpanded
                ? 'bg-blue-100 text-blue-900'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            )}
          >
            <item.icon
              className={cn(
                'mr-3 flex-shrink-0 h-5 w-5',
                hasActiveChild || isExpanded ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
              )}
            />
            <span className="flex-1 text-left">{item.name}</span>
            <svg
              className={cn(
                'ml-3 h-4 w-4 transition-transform',
                isExpanded ? 'rotate-90' : ''
              )}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          
          {isExpanded && (
            <div className="mt-1 space-y-1">
              {item.children.map((child: any) => (
                <Link
                  key={child.href}
                  to={child.href}
                  className={cn(
                    'group flex items-center pl-8 pr-2 py-2 text-sm font-medium rounded-md',
                    isActiveRoute(child.href)
                      ? 'bg-blue-200 text-blue-900'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  )}
                  onClick={() => isMobile && setSidebarOpen(false)}
                  title={child.description}
                >
                  <child.icon
                    className={cn(
                      'mr-3 flex-shrink-0 h-4 w-4',
                      isActiveRoute(child.href) ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                    )}
                  />
                  {child.name}
                </Link>
              ))}
            </div>
          )}
        </div>
      );
    }

    return (
      <Link
        key={item.href}
        to={item.href}
        className={cn(
          'group flex items-center px-2 py-2 text-sm font-medium rounded-md',
          isActiveRoute(item.href)
            ? 'bg-blue-100 text-blue-900'
            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
        )}
        onClick={() => isMobile && setSidebarOpen(false)}
        title={item.description}
      >
        <item.icon
          className={cn(
            'mr-3 flex-shrink-0 h-5 w-5',
            isActiveRoute(item.href) ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
          )}
        />
        {item.name}
      </Link>
    );
  };

  return (
    <div className="h-screen flex overflow-hidden bg-gray-100">
      {/* Mobile sidebar */}
      <div className={cn(
        'fixed inset-0 flex z-40 md:hidden',
        sidebarOpen ? 'block' : 'hidden'
      )}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              type="button"
              className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              onClick={() => setSidebarOpen(false)}
            >
              <XMarkIcon className="h-6 w-6 text-white" />
            </button>
          </div>
          <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
            <div className="flex-shrink-0 flex items-center px-4">
              <h1 className="text-xl font-bold text-gray-900">IP Management</h1>
            </div>
            <nav className="mt-5 px-2 space-y-1">
              {navigation.map((item) => renderNavigationItem(item, true))}
            </nav>
          </div>
        </div>
      </div>

      {/* Static sidebar for desktop */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-64">
          <div className="flex flex-col h-0 flex-1 border-r border-gray-200 bg-white">
            <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
              <div className="flex items-center flex-shrink-0 px-4">
                <h1 className="text-xl font-bold text-gray-900">IP Management</h1>
              </div>
              <nav className="mt-5 flex-1 px-2 bg-white space-y-1">
                {navigation.map((item) => renderNavigationItem(item))}
              </nav>
            </div>
            <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center">
                    <span className="text-sm font-medium text-white">BR</span>
                  </div>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-700">Bosch Rexroth</p>
                  <p className="text-xs font-medium text-gray-500">Bursa Factory</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        <div className="md:hidden pl-1 pt-1 sm:pl-3 sm:pt-3">
          <button
            type="button"
            className="-ml-0.5 -mt-0.5 h-12 w-12 inline-flex items-center justify-center rounded-md text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
            onClick={() => setSidebarOpen(true)}
          >
            <Bars3Icon className="h-6 w-6" />
          </button>
        </div>
        <main className="flex-1 relative z-0 overflow-y-auto focus:outline-none">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};