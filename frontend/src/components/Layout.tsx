/**
 * Layout Component
 * Industrial-grade layout with navigation and responsive design
 */

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  HomeIcon,
  BuildingOfficeIcon,
  ServerIcon,
  GlobeAltIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  Bars3Icon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { cn, formatDateTime } from '@/utils';
import { useAppStore } from '@/stores/useAppStore';
import { Badge } from '@/components/ui';

interface LayoutProps {
  children: React.ReactNode;
}

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
  description: string;
}

const navigation: NavigationItem[] = [
  {
    name: 'Dashboard',
    href: '/',
    icon: HomeIcon,
    description: 'System overview and statistics',
  },
  {
    name: 'Domains',
    href: '/domains',
    icon: BuildingOfficeIcon,
    description: 'Manage business domains (MFG, LOG, FCM, ENG)',
  },
  {
    name: 'VLANs',
    href: '/vlans',
    icon: ServerIcon,
    description: 'VLAN configuration and management',
  },
  {
    name: 'IP Management',
    href: '/ip-management',
    icon: GlobeAltIcon,
    description: 'Device IP allocation and tracking',
  },
  {
    name: 'Reports',
    href: '/reports',
    icon: ChartBarIcon,
    description: 'Network analytics and compliance reports',
  },
  {
    name: 'Settings',
    href: '/settings',
    icon: Cog6ToothIcon,
    description: 'System configuration and preferences',
  },
];

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const { sidebarOpen, setSidebarOpen, healthStatus, healthLoading } = useAppStore();

  const currentPath = location.pathname;

  // Generate breadcrumbs from current path
  const generateBreadcrumbs = (): Array<{ name: string; href: string }> => {
    const pathSegments = currentPath.split('/').filter(Boolean);
    const breadcrumbs = [{ name: 'Dashboard', href: '/' }];

    let currentHref = '';
    pathSegments.forEach((segment, index) => {
      currentHref += `/${segment}`;
      const navItem = navigation.find(item => item.href === currentHref);
      
      if (navItem) {
        breadcrumbs.push({
          name: navItem.name,
          href: currentHref,
        });
      } else {
        // Handle dynamic segments
        const formattedName = segment
          .split('-')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
        breadcrumbs.push({
          name: formattedName,
          href: currentHref,
        });
      }
    });

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  return (
    <div className="min-h-screen bg-secondary-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-25 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 transform bg-white shadow-lg transition-transform duration-300 ease-in-out lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Sidebar header */}
        <div className="flex h-16 items-center justify-between border-b border-secondary-200 px-6">
          <div className="flex items-center space-x-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600 text-white font-bold text-sm">
              IP
            </div>
            <div>
              <h1 className="text-lg font-semibold text-secondary-900">IP Management</h1>
              <p className="text-xs text-secondary-500">Bosch Rexroth - BURSA</p>
            </div>
          </div>
          <button
            type="button"
            className="lg:hidden rounded-md p-1 text-secondary-400 hover:text-secondary-500"
            onClick={() => setSidebarOpen(false)}
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-4">
          {navigation.map((item) => {
            const isActive = currentPath === item.href || 
              (item.href !== '/' && currentPath.startsWith(item.href));
            
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  'group flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-secondary-700 hover:bg-secondary-100 hover:text-secondary-900'
                )}
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon
                  className={cn(
                    'mr-3 h-5 w-5 flex-shrink-0',
                    isActive ? 'text-primary-500' : 'text-secondary-400 group-hover:text-secondary-500'
                  )}
                />
                <span className="flex-1">{item.name}</span>
                {item.badge && (
                  <Badge variant="primary" size="sm">
                    {item.badge}
                  </Badge>
                )}
              </Link>
            );
          })}
        </nav>

        {/* System status */}
        <div className="border-t border-secondary-200 p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-secondary-700">System Status</span>
            {healthLoading ? (
              <div className="h-2 w-2 animate-pulse rounded-full bg-secondary-400" />
            ) : healthStatus ? (
              <Badge
                variant={healthStatus.status === 'healthy' ? 'success' : 'warning'}
                size="sm"
                dot
              />
            ) : (
              <Badge variant="error" size="sm" dot />
            )}
          </div>
          {healthStatus && (
            <div className="mt-2 text-xs text-secondary-500">
              <div>Service: {healthStatus.service}</div>
              <div>Version: {healthStatus.version}</div>
              <div>Updated: {formatDateTime(healthStatus.timestamp)}</div>
            </div>
          )}
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top header */}
        <header className="sticky top-0 z-30 bg-white shadow-sm border-b border-secondary-200">
          <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
            {/* Mobile menu button */}
            <button
              type="button"
              className="lg:hidden rounded-md p-2 text-secondary-400 hover:text-secondary-500"
              onClick={() => setSidebarOpen(true)}
            >
              <Bars3Icon className="h-6 w-6" />
            </button>

            {/* Breadcrumbs */}
            <nav className="flex" aria-label="Breadcrumb">
              <ol className="flex items-center space-x-2">
                {breadcrumbs.map((breadcrumb, index) => (
                  <li key={breadcrumb.href} className="flex items-center">
                    {index > 0 && (
                      <svg
                        className="mr-2 h-4 w-4 text-secondary-400"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                    {index === breadcrumbs.length - 1 ? (
                      <span className="text-sm font-medium text-secondary-900">
                        {breadcrumb.name}
                      </span>
                    ) : (
                      <Link
                        to={breadcrumb.href}
                        className="text-sm font-medium text-secondary-500 hover:text-secondary-700"
                      >
                        {breadcrumb.name}
                      </Link>
                    )}
                  </li>
                ))}
              </ol>
            </nav>

            {/* User menu */}
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-sm font-medium text-secondary-900">Network Admin</div>
                <div className="text-xs text-secondary-500">admin@bosch.com</div>
              </div>
              <div className="h-8 w-8 rounded-full bg-primary-600 flex items-center justify-center">
                <span className="text-sm font-medium text-white">NA</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1">
          <div className="px-4 py-6 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export { Layout };