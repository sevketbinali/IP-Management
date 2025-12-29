/**
 * Dashboard Component
 * Industrial-grade dashboard with system overview and key metrics
 */

import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  BuildingOfficeIcon,
  ServerIcon,
  GlobeAltIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import { useAppStore } from '@/stores/useAppStore';
import { useDomainStore } from '@/stores/useDomainStore';
import { Badge, Button } from '@/components/ui';
import { formatDateTime } from '@/utils';
import { apiConfig } from '@/services/api';

interface StatCard {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'increase' | 'decrease' | 'neutral';
  icon: React.ComponentType<{ className?: string }>;
  href?: string;
  description: string;
}

interface SystemAlert {
  id: string;
  type: 'warning' | 'error' | 'info';
  title: string;
  message: string;
  timestamp: string;
  action?: {
    label: string;
    href: string;
  };
}

const Dashboard: React.FC = () => {
  const { healthStatus, healthLoading, checkHealth } = useAppStore();
  const { domains, fetchDomains } = useDomainStore();

  useEffect(() => {
    fetchDomains();
    checkHealth();
  }, [fetchDomains, checkHealth]);

  // Mock data for demonstration - replace with real API calls
  const stats: StatCard[] = [
    {
      title: 'Active Domains',
      value: domains.length,
      change: '+2',
      changeType: 'increase',
      icon: BuildingOfficeIcon,
      href: '/domains',
      description: 'Business domains configured',
    },
    {
      title: 'VLANs Configured',
      value: 47,
      change: '+5',
      changeType: 'increase',
      icon: ServerIcon,
      href: '/vlans',
      description: 'Network segments active',
    },
    {
      title: 'IP Allocations',
      value: '1,247',
      change: '+23',
      changeType: 'increase',
      icon: GlobeAltIcon,
      href: '/ip-management',
      description: 'Devices with assigned IPs',
    },
    {
      title: 'Network Utilization',
      value: '73%',
      change: '+2.1%',
      changeType: 'increase',
      icon: ChartBarIcon,
      href: '/reports',
      description: 'Overall IP usage',
    },
  ];

  const alerts: SystemAlert[] = [
    {
      id: '1',
      type: 'warning',
      title: 'Firewall Review Required',
      message: '3 VLANs require firewall rule review (>30 days since last check)',
      timestamp: new Date().toISOString(),
      action: {
        label: 'Review VLANs',
        href: '/vlans?filter=review-required',
      },
    },
    {
      id: '2',
      type: 'info',
      title: 'High IP Utilization',
      message: 'Manufacturing Zone A2 is at 89% IP utilization',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      action: {
        label: 'View Details',
        href: '/vlans?zone=mfg-a2',
      },
    },
  ];

  const getAlertIcon = (type: SystemAlert['type']): React.ReactNode => {
    switch (type) {
      case 'error':
        return <ExclamationTriangleIcon className="h-5 w-5 text-error-500" />;
      case 'warning':
        return <ExclamationTriangleIcon className="h-5 w-5 text-warning-500" />;
      case 'info':
        return <CheckCircleIcon className="h-5 w-5 text-primary-500" />;
      default:
        return <CheckCircleIcon className="h-5 w-5 text-secondary-500" />;
    }
  };

  const getAlertBorderColor = (type: SystemAlert['type']): string => {
    switch (type) {
      case 'error':
        return 'border-l-error-500 bg-error-50';
      case 'warning':
        return 'border-l-warning-500 bg-warning-50';
      case 'info':
        return 'border-l-primary-500 bg-primary-50';
      default:
        return 'border-l-secondary-500 bg-secondary-50';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Dashboard</h1>
          <p className="mt-1 text-sm text-secondary-600">
            IP Management & VLAN Segmentation System - {apiConfig.organization} {apiConfig.plantCode} Factory
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="text-right">
            <div className="text-sm font-medium text-secondary-900">
              Last Updated: {formatDateTime(new Date().toISOString())}
            </div>
            <div className="text-xs text-secondary-500">
              System Status: {healthStatus?.status || 'Unknown'}
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={checkHealth}
            loading={healthLoading}
            leftIcon={<ClockIcon className="h-4 w-4" />}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* System Status */}
      {healthStatus && (
        <div className="rounded-lg bg-white p-6 shadow-sm border border-secondary-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-secondary-900">System Health</h3>
              <p className="text-sm text-secondary-600">Real-time system status and connectivity</p>
            </div>
            <Badge
              variant={healthStatus.status === 'healthy' ? 'success' : 'warning'}
              size="lg"
            >
              {healthStatus.status.toUpperCase()}
            </Badge>
          </div>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="flex items-center space-x-2">
              <CheckCircleIcon className="h-5 w-5 text-success-500" />
              <span className="text-sm text-secondary-700">Service: {healthStatus.service}</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircleIcon className="h-5 w-5 text-success-500" />
              <span className="text-sm text-secondary-700">Version: {healthStatus.version}</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircleIcon className="h-5 w-5 text-success-500" />
              <span className="text-sm text-secondary-700">
                Updated: {formatDateTime(healthStatus.timestamp)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.title}
            className="rounded-lg bg-white p-6 shadow-sm border border-secondary-200 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="rounded-lg bg-primary-100 p-2">
                  <stat.icon className="h-6 w-6 text-primary-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-secondary-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-secondary-900">{stat.value}</p>
                </div>
              </div>
              {stat.change && (
                <div className="text-right">
                  <Badge
                    variant={
                      stat.changeType === 'increase'
                        ? 'success'
                        : stat.changeType === 'decrease'
                        ? 'error'
                        : 'secondary'
                    }
                    size="sm"
                  >
                    {stat.change}
                  </Badge>
                </div>
              )}
            </div>
            <div className="mt-4 flex items-center justify-between">
              <p className="text-xs text-secondary-500">{stat.description}</p>
              {stat.href && (
                <Link
                  to={stat.href}
                  className="text-xs font-medium text-primary-600 hover:text-primary-700"
                >
                  View Details →
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Alerts and Notifications */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* System Alerts */}
        <div className="rounded-lg bg-white p-6 shadow-sm border border-secondary-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-secondary-900">System Alerts</h3>
            <Badge variant="warning" size="sm">
              {alerts.length} Active
            </Badge>
          </div>
          <div className="space-y-3">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={`rounded-md border-l-4 p-4 ${getAlertBorderColor(alert.type)}`}
              >
                <div className="flex items-start space-x-3">
                  {getAlertIcon(alert.type)}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-secondary-900">{alert.title}</h4>
                    <p className="text-sm text-secondary-700 mt-1">{alert.message}</p>
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-xs text-secondary-500">
                        {formatDateTime(alert.timestamp)}
                      </p>
                      {alert.action && (
                        <Link
                          to={alert.action.href}
                          className="text-xs font-medium text-primary-600 hover:text-primary-700"
                        >
                          {alert.action.label} →
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="rounded-lg bg-white p-6 shadow-sm border border-secondary-200">
          <h3 className="text-lg font-medium text-secondary-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <Link
              to="/domains"
              className="flex items-center justify-between p-3 rounded-md border border-secondary-200 hover:bg-secondary-50 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <BuildingOfficeIcon className="h-5 w-5 text-secondary-400" />
                <div>
                  <p className="text-sm font-medium text-secondary-900">Manage Domains</p>
                  <p className="text-xs text-secondary-500">Add, edit, or remove business domains</p>
                </div>
              </div>
              <span className="text-secondary-400">→</span>
            </Link>

            <Link
              to="/vlans"
              className="flex items-center justify-between p-3 rounded-md border border-secondary-200 hover:bg-secondary-50 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <ServerIcon className="h-5 w-5 text-secondary-400" />
                <div>
                  <p className="text-sm font-medium text-secondary-900">Configure VLANs</p>
                  <p className="text-xs text-secondary-500">Set up network segmentation</p>
                </div>
              </div>
              <span className="text-secondary-400">→</span>
            </Link>

            <Link
              to="/ip-management"
              className="flex items-center justify-between p-3 rounded-md border border-secondary-200 hover:bg-secondary-50 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <GlobeAltIcon className="h-5 w-5 text-secondary-400" />
                <div>
                  <p className="text-sm font-medium text-secondary-900">Assign IP Addresses</p>
                  <p className="text-xs text-secondary-500">Manage device IP allocations</p>
                </div>
              </div>
              <span className="text-secondary-400">→</span>
            </Link>

            <Link
              to="/reports"
              className="flex items-center justify-between p-3 rounded-md border border-secondary-200 hover:bg-secondary-50 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <ChartBarIcon className="h-5 w-5 text-secondary-400" />
                <div>
                  <p className="text-sm font-medium text-secondary-900">View Reports</p>
                  <p className="text-xs text-secondary-500">Network analytics and compliance</p>
                </div>
              </div>
              <span className="text-secondary-400">→</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="rounded-lg bg-white p-6 shadow-sm border border-secondary-200">
        <h3 className="text-lg font-medium text-secondary-900 mb-4">Recent Activity</h3>
        <div className="space-y-4">
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex-shrink-0">
              <Badge variant="success" size="sm" dot />
            </div>
            <div className="flex-1">
              <p className="text-secondary-900">
                Domain <strong>MFG</strong> created successfully
              </p>
              <p className="text-secondary-500 text-xs">2 minutes ago</p>
            </div>
          </div>
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex-shrink-0">
              <Badge variant="primary" size="sm" dot />
            </div>
            <div className="flex-1">
              <p className="text-secondary-900">
                VLAN 100 configured for Manufacturing Zone A2
              </p>
              <p className="text-secondary-500 text-xs">15 minutes ago</p>
            </div>
          </div>
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex-shrink-0">
              <Badge variant="warning" size="sm" dot />
            </div>
            <div className="flex-1">
              <p className="text-secondary-900">
                IP allocation reached 85% in Engineering Zone
              </p>
              <p className="text-secondary-500 text-xs">1 hour ago</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export { Dashboard };