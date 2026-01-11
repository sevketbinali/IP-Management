/**
 * IP Management Dashboard
 * Comprehensive interface for managing device IP allocations across domains, VLANs, and zones
 * Industrial-grade design with real-time status monitoring
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ServerIcon,
  GlobeAltIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowPathIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';
import { Layout } from './Layout';
import { useDomainStore } from '@/stores/useDomainStore';
import { useVlanStore } from '@/stores/useVLANStore';
import { useIpStore } from '@/stores/useIPStore';
import { useAppStore } from '@/stores/useAppStore';
import { cn, formatDateTime } from '@/utils';

interface DashboardStats {
  totalDomains: number;
  totalVlans: number;
  totalDevices: number;
  ipUtilization: number;
  activeDevices: number;
  conflictCount: number;
  lastUpdate: string;
}

interface NetworkOverview {
  domainId: string;
  domainName: string;
  vlanCount: number;
  deviceCount: number;
  utilization: number;
  status: 'healthy' | 'warning' | 'error';
  lastActivity: string;
}

const IPManagementDashboard: React.FC = () => {
  const { domains, fetchDomains, loading: domainsLoading } = useDomainStore();
  const { vlans } = useVlanStore();
  const { devices } = useIpStore();
  const { checkHealth } = useAppStore();

  const [stats, setStats] = useState<DashboardStats>({
    totalDomains: 0,
    totalVlans: 0,
    totalDevices: 0,
    ipUtilization: 0,
    activeDevices: 0,
    conflictCount: 0,
    lastUpdate: new Date().toISOString(),
  });

  const [networkOverview, setNetworkOverview] = useState<NetworkOverview[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch initial data
  useEffect(() => {
    const initializeDashboard = async () => {
      await Promise.all([
        fetchDomains(),
        checkHealth(),
      ]);
    };

    initializeDashboard();
  }, [fetchDomains, checkHealth]);

  // Calculate statistics when data changes
  useEffect(() => {
    const calculateStats = () => {
      const totalDevices = devices.length;
      const activeDevices = devices.filter(d => d.status === 'active').length;
      const conflictDevices = devices.filter(d => d.status === 'conflict').length;
      
      // Calculate IP utilization across all VLANs
      const totalIps = vlans.reduce((sum, vlan) => sum + vlan.totalIps, 0);
      const usedIps = vlans.reduce((sum, vlan) => sum + vlan.usedIps, 0);
      const utilization = totalIps > 0 ? Math.round((usedIps / totalIps) * 100) : 0;

      setStats({
        totalDomains: domains.length,
        totalVlans: vlans.length,
        totalDevices,
        ipUtilization: utilization,
        activeDevices,
        conflictCount: conflictDevices,
        lastUpdate: new Date().toISOString(),
      });
    };

    calculateStats();
  }, [domains, vlans, devices]);

  // Generate network overview
  useEffect(() => {
    const generateOverview = () => {
      const overview = domains.map(domain => {
        const domainVlans = vlans.filter(v => v.domainId === domain.id);
        const domainDevices = devices.filter(d => 
          domainVlans.some(v => v.id === d.vlanId)
        );

        const totalIps = domainVlans.reduce((sum, vlan) => sum + vlan.totalIps, 0);
        const usedIps = domainVlans.reduce((sum, vlan) => sum + vlan.usedIps, 0);
        const utilization = totalIps > 0 ? Math.round((usedIps / totalIps) * 100) : 0;

        // Determine status based on utilization and conflicts
        let status: 'healthy' | 'warning' | 'error' = 'healthy';
        const hasConflicts = domainDevices.some(d => d.status === 'conflict');
        
        if (hasConflicts) {
          status = 'error';
        } else if (utilization > 85) {
          status = 'warning';
        }

        return {
          domainId: domain.id,
          domainName: domain.name,
          vlanCount: domainVlans.length,
          deviceCount: domainDevices.length,
          utilization,
          status,
          lastActivity: domain.updatedAt,
        };
      });

      setNetworkOverview(overview);
    };

    generateOverview();
  }, [domains, vlans, devices]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        fetchDomains(),
        checkHealth(),
      ]);
    } finally {
      setRefreshing(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'error': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return CheckCircleIcon;
      case 'warning': return ExclamationTriangleIcon;
      case 'error': return ExclamationTriangleIcon;
      default: return ClockIcon;
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">IP Management Dashboard</h1>
            <p className="mt-2 text-gray-600">
              Centralized IP address management for IT/OT devices across manufacturing domains
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className={cn(
                'inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500',
                refreshing && 'opacity-50 cursor-not-allowed'
              )}
            >
              <ArrowPathIcon className={cn('h-4 w-4 mr-2', refreshing && 'animate-spin')} />
              Refresh
            </button>
            <Link
              to="/ip-management/devices/new"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Add Device
            </Link>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ServerIcon className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Domains</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.totalDomains}</dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-5 py-3">
              <div className="text-sm">
                <Link to="/domains" className="font-medium text-blue-700 hover:text-blue-900">
                  Manage domains
                </Link>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <GlobeAltIcon className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Active Devices</dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats.activeDevices} / {stats.totalDevices}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-5 py-3">
              <div className="text-sm">
                <Link to="/ip-management/devices" className="font-medium text-blue-700 hover:text-blue-900">
                  View all devices
                </Link>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={cn(
                    'h-6 w-6 rounded-full flex items-center justify-center text-xs font-medium',
                    stats.ipUtilization > 85 ? 'bg-red-100 text-red-800' :
                    stats.ipUtilization > 70 ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  )}>
                    %
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">IP Utilization</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.ipUtilization}%</dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-5 py-3">
              <div className="text-sm">
                <Link to="/reports/utilization" className="font-medium text-blue-700 hover:text-blue-900">
                  View utilization report
                </Link>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ExclamationTriangleIcon className={cn(
                    'h-6 w-6',
                    stats.conflictCount > 0 ? 'text-red-500' : 'text-gray-400'
                  )} />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">IP Conflicts</dt>
                    <dd className={cn(
                      'text-lg font-medium',
                      stats.conflictCount > 0 ? 'text-red-600' : 'text-gray-900'
                    )}>
                      {stats.conflictCount}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-5 py-3">
              <div className="text-sm">
                {stats.conflictCount > 0 ? (
                  <Link to="/ip-management/conflicts" className="font-medium text-red-700 hover:text-red-900">
                    Resolve conflicts
                  </Link>
                ) : (
                  <span className="font-medium text-gray-500">No conflicts detected</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Network Overview */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Network Overview by Domain</h3>
              <div className="text-sm text-gray-500">
                Last updated: {formatDateTime(stats.lastUpdate)}
              </div>
            </div>

            {domainsLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600">Loading network data...</span>
              </div>
            ) : networkOverview.length === 0 ? (
              <div className="text-center py-8">
                <ServerIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No domains configured</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Get started by creating your first domain.
                </p>
                <div className="mt-6">
                  <Link
                    to="/domains"
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Create Domain
                  </Link>
                </div>
              </div>
            ) : (
              <div className="overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Domain
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        VLANs
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Devices
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Utilization
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Last Activity
                      </th>
                      <th className="relative px-6 py-3">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {networkOverview.map((overview) => {
                      const StatusIcon = getStatusIcon(overview.status);
                      return (
                        <tr key={overview.domainId} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-8 w-8">
                                <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center">
                                  <span className="text-sm font-medium text-blue-600">
                                    {overview.domainName}
                                  </span>
                                </div>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {overview.domainName}
                                </div>
                                <div className="text-sm text-gray-500">
                                  Domain ID: {overview.domainId.slice(0, 8)}...
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {overview.vlanCount}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {overview.deviceCount}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                                <div
                                  className={cn(
                                    'h-2 rounded-full',
                                    overview.utilization > 85 ? 'bg-red-500' :
                                    overview.utilization > 70 ? 'bg-yellow-500' :
                                    'bg-green-500'
                                  )}
                                  style={{ width: `${Math.min(overview.utilization, 100)}%` }}
                                />
                              </div>
                              <span className="text-sm text-gray-900 min-w-0">
                                {overview.utilization}%
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={cn(
                              'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                              getStatusColor(overview.status)
                            )}>
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {overview.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDateTime(overview.lastActivity)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <Link
                              to={`/domains/${overview.domainId}`}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              Manage
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link
                to="/ip-management/devices/new"
                className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-blue-500 border border-gray-200 rounded-lg hover:border-gray-300"
              >
                <div>
                  <span className="rounded-lg inline-flex p-3 bg-blue-50 text-blue-700 ring-4 ring-white">
                    <PlusIcon className="h-6 w-6" />
                  </span>
                </div>
                <div className="mt-8">
                  <h3 className="text-lg font-medium">
                    <span className="absolute inset-0" aria-hidden="true" />
                    Add New Device
                  </h3>
                  <p className="mt-2 text-sm text-gray-500">
                    Register a new OT device and assign IP address
                  </p>
                </div>
              </Link>

              <Link
                to="/vlans/new"
                className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-blue-500 border border-gray-200 rounded-lg hover:border-gray-300"
              >
                <div>
                  <span className="rounded-lg inline-flex p-3 bg-green-50 text-green-700 ring-4 ring-white">
                    <ServerIcon className="h-6 w-6" />
                  </span>
                </div>
                <div className="mt-8">
                  <h3 className="text-lg font-medium">
                    <span className="absolute inset-0" aria-hidden="true" />
                    Create VLAN
                  </h3>
                  <p className="mt-2 text-sm text-gray-500">
                    Set up new network segment with automatic IP allocation
                  </p>
                </div>
              </Link>

              <Link
                to="/reports"
                className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-blue-500 border border-gray-200 rounded-lg hover:border-gray-300"
              >
                <div>
                  <span className="rounded-lg inline-flex p-3 bg-purple-50 text-purple-700 ring-4 ring-white">
                    <ChartBarIcon className="h-6 w-6" />
                  </span>
                </div>
                <div className="mt-8">
                  <h3 className="text-lg font-medium">
                    <span className="absolute inset-0" aria-hidden="true" />
                    View Reports
                  </h3>
                  <p className="mt-2 text-sm text-gray-500">
                    Network analytics and compliance reports
                  </p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export { IPManagementDashboard };