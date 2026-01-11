/**
 * Enhanced IP Allocation Table
 * Advanced table with filtering, sorting, status indicators, and bulk operations
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowsUpDownIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  ArrowDownTrayIcon,
  Cog6ToothIcon,
  ComputerDesktopIcon,
} from '@heroicons/react/24/outline';
import { cn } from '@/utils';

interface IPAllocation {
  id: string;
  ipAddress: string;
  macAddress: string;
  deviceName: string;
  deviceType: string;
  domain: string;
  vlan: string;
  status: 'active' | 'inactive' | 'reserved' | 'conflict' | 'pending' | 'warning';
  lastSeen: string;
  assignedDate: string;
  description: string;
  location: string;
  owner: string;
  lease: {
    type: 'static' | 'dhcp' | 'reserved';
    expires?: string;
  };
  health: {
    ping: boolean;
    response: number;
    uptime: number;
  };
}

interface TableFilters {
  search: string;
  status: string;
  domain: string;
  deviceType: string;
  vlan: string;
  leaseType: string;
}

interface SortConfig {
  key: keyof IPAllocation | string;
  direction: 'asc' | 'desc';
}

const IPAllocationTable: React.FC = () => {
  const [allocations, setAllocations] = useState<IPAllocation[]>([]);
  const [filters, setFilters] = useState<TableFilters>({
    search: '',
    status: '',
    domain: '',
    deviceType: '',
    vlan: '',
    leaseType: '',
  });
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'ipAddress', direction: 'asc' });
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);

  // Mock data for demonstration
  useEffect(() => {
    const mockData: IPAllocation[] = [
      {
        id: '1',
        ipAddress: '192.168.100.10',
        macAddress: '00:1B:44:11:3A:B7',
        deviceName: 'PLC-A2-001',
        deviceType: 'PLC Controller',
        domain: 'Manufacturing',
        vlan: 'VLAN-100',
        status: 'active',
        lastSeen: new Date(Date.now() - 300000).toISOString(),
        assignedDate: new Date(Date.now() - 86400000 * 30).toISOString(),
        description: 'Main production line controller',
        location: 'Production Floor A2',
        owner: 'Manufacturing Team',
        lease: { type: 'static' },
        health: { ping: true, response: 12, uptime: 99.8 },
      },
      {
        id: '2',
        ipAddress: '192.168.100.11',
        macAddress: '00:1B:44:11:3A:B8',
        deviceName: 'HMI-A2-001',
        deviceType: 'HMI Panel',
        domain: 'Manufacturing',
        vlan: 'VLAN-100',
        status: 'active',
        lastSeen: new Date(Date.now() - 120000).toISOString(),
        assignedDate: new Date(Date.now() - 86400000 * 25).toISOString(),
        description: 'Operator interface panel',
        location: 'Control Room A2',
        owner: 'Operations Team',
        lease: { type: 'static' },
        health: { ping: true, response: 8, uptime: 99.9 },
      },
      {
        id: '3',
        ipAddress: '192.168.101.15',
        macAddress: '00:1B:44:11:3A:C1',
        deviceName: 'ROBOT-A4-001',
        deviceType: 'Industrial Robot',
        domain: 'Manufacturing',
        vlan: 'VLAN-101',
        status: 'warning',
        lastSeen: new Date(Date.now() - 1800000).toISOString(),
        assignedDate: new Date(Date.now() - 86400000 * 15).toISOString(),
        description: 'Welding robot controller',
        location: 'Assembly Line A4',
        owner: 'Robotics Team',
        lease: { type: 'dhcp', expires: new Date(Date.now() + 86400000 * 7).toISOString() },
        health: { ping: false, response: 0, uptime: 95.2 },
      },
      {
        id: '4',
        ipAddress: '192.168.200.20',
        macAddress: '00:1B:44:11:3A:D1',
        deviceName: 'GATEWAY-LOG21',
        deviceType: 'Network Gateway',
        domain: 'Logistics',
        vlan: 'VLAN-200',
        status: 'active',
        lastSeen: new Date(Date.now() - 60000).toISOString(),
        assignedDate: new Date(Date.now() - 86400000 * 45).toISOString(),
        description: 'Logistics network gateway',
        location: 'Warehouse LOG21',
        owner: 'IT Infrastructure',
        lease: { type: 'static' },
        health: { ping: true, response: 5, uptime: 99.95 },
      },
      {
        id: '5',
        ipAddress: '192.168.300.25',
        macAddress: '00:1B:44:11:3A:E1',
        deviceName: 'CAM-SEC-001',
        deviceType: 'Security Camera',
        domain: 'Facility',
        vlan: 'VLAN-300',
        status: 'conflict',
        lastSeen: new Date(Date.now() - 3600000).toISOString(),
        assignedDate: new Date(Date.now() - 86400000 * 10).toISOString(),
        description: 'Entrance security camera',
        location: 'Main Entrance',
        owner: 'Security Team',
        lease: { type: 'reserved' },
        health: { ping: false, response: 0, uptime: 87.3 },
      },
    ];

    setTimeout(() => {
      setAllocations(mockData);
      setLoading(false);
    }, 1000);
  }, []);

  // Filtered and sorted data
  const processedData = useMemo(() => {
    let filtered = allocations.filter(item => {
      const matchesSearch = !filters.search || 
        item.ipAddress.includes(filters.search) ||
        item.deviceName.toLowerCase().includes(filters.search.toLowerCase()) ||
        item.macAddress.toLowerCase().includes(filters.search.toLowerCase());
      
      const matchesStatus = !filters.status || item.status === filters.status;
      const matchesDomain = !filters.domain || item.domain === filters.domain;
      const matchesDeviceType = !filters.deviceType || item.deviceType === filters.deviceType;
      const matchesVlan = !filters.vlan || item.vlan === filters.vlan;
      const matchesLeaseType = !filters.leaseType || item.lease.type === filters.leaseType;

      return matchesSearch && matchesStatus && matchesDomain && matchesDeviceType && matchesVlan && matchesLeaseType;
    });

    // Sort data
    filtered.sort((a, b) => {
      let aValue: any = a[sortConfig.key as keyof IPAllocation];
      let bValue: any = b[sortConfig.key as keyof IPAllocation];

      // Handle nested properties
      if (sortConfig.key === 'health.uptime') {
        aValue = a.health.uptime;
        bValue = b.health.uptime;
      } else if (sortConfig.key === 'lease.type') {
        aValue = a.lease.type;
        bValue = b.lease.type;
      }

      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [allocations, filters, sortConfig]);

  const handleSort = (key: string) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleFilterChange = (key: keyof TableFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      status: '',
      domain: '',
      deviceType: '',
      vlan: '',
      leaseType: '',
    });
  };

  const handleSelectAll = (checked: boolean) => {
    setSelectedRows(checked ? processedData.map(item => item.id) : []);
  };

  const handleSelectRow = (id: string, checked: boolean) => {
    setSelectedRows(prev => 
      checked ? [...prev, id] : prev.filter(rowId => rowId !== id)
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return CheckCircleIcon;
      case 'inactive': return ClockIcon;
      case 'conflict': return XCircleIcon;
      case 'warning': return ExclamationTriangleIcon;
      default: return ClockIcon;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'inactive': return 'text-gray-600 bg-gray-100';
      case 'conflict': return 'text-red-600 bg-red-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'reserved': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const exportData = () => {
    if (processedData.length === 0) return;
    
    const csvData = processedData.map(item => ({
      'IP Address': item.ipAddress,
      'MAC Address': item.macAddress,
      'Device Name': item.deviceName,
      'Device Type': item.deviceType,
      'Domain': item.domain,
      'VLAN': item.vlan,
      'Status': item.status,
      'Location': item.location,
      'Owner': item.owner,
      'Lease Type': item.lease.type,
      'Uptime %': item.health.uptime,
      'Last Seen': new Date(item.lastSeen).toLocaleString(),
    }));

    const headers = Object.keys(csvData[0]);
    const csv = [
      headers.join(','),
      ...csvData.map(row => Object.values(row).map(val => `"${val}"`).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ip-allocations-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">IP Allocation Management</h2>
          <p className="text-gray-600">Monitor and manage IP address assignments across all network segments</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={exportData}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
            Export CSV
          </button>
          <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
            <ComputerDesktopIcon className="h-4 w-4 mr-2" />
            Add Device
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white shadow rounded-lg">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex-1 max-w-lg">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by IP, device name, or MAC address..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={cn(
                  'inline-flex items-center px-3 py-2 border rounded-md text-sm font-medium',
                  showFilters 
                    ? 'border-blue-300 bg-blue-50 text-blue-700' 
                    : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                )}
              >
                <FunnelIcon className="h-4 w-4 mr-2" />
                Filters
              </button>
              {Object.values(filters).some(v => v) && (
                <button
                  onClick={clearFilters}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Clear all
                </button>
              )}
            </div>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="border-t pt-4">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="conflict">Conflict</option>
                  <option value="warning">Warning</option>
                  <option value="reserved">Reserved</option>
                </select>

                <select
                  value={filters.domain}
                  onChange={(e) => handleFilterChange('domain', e.target.value)}
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Domains</option>
                  <option value="Manufacturing">Manufacturing</option>
                  <option value="Logistics">Logistics</option>
                  <option value="Facility">Facility</option>
                  <option value="Engineering">Engineering</option>
                </select>

                <select
                  value={filters.deviceType}
                  onChange={(e) => handleFilterChange('deviceType', e.target.value)}
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Device Types</option>
                  <option value="PLC Controller">PLC Controller</option>
                  <option value="HMI Panel">HMI Panel</option>
                  <option value="Industrial Robot">Industrial Robot</option>
                  <option value="Network Gateway">Network Gateway</option>
                  <option value="Security Camera">Security Camera</option>
                </select>

                <select
                  value={filters.vlan}
                  onChange={(e) => handleFilterChange('vlan', e.target.value)}
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All VLANs</option>
                  <option value="VLAN-100">VLAN-100</option>
                  <option value="VLAN-101">VLAN-101</option>
                  <option value="VLAN-200">VLAN-200</option>
                  <option value="VLAN-300">VLAN-300</option>
                </select>

                <select
                  value={filters.leaseType}
                  onChange={(e) => handleFilterChange('leaseType', e.target.value)}
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Lease Types</option>
                  <option value="static">Static</option>
                  <option value="dhcp">DHCP</option>
                  <option value="reserved">Reserved</option>
                </select>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Results Summary */}
      <div className="bg-white shadow rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Showing {processedData.length} of {allocations.length} IP allocations
            {selectedRows.length > 0 && (
              <span className="ml-2 text-blue-600 font-medium">
                ({selectedRows.length} selected)
              </span>
            )}
          </div>
          {selectedRows.length > 0 && (
            <div className="flex items-center space-x-2">
              <button className="text-sm text-blue-600 hover:text-blue-800">Bulk Edit</button>
              <button className="text-sm text-red-600 hover:text-red-800">Delete Selected</button>
            </div>
          )}
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Loading IP allocations...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedRows.length === processedData.length && processedData.length > 0}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('ipAddress')}
                  >
                    <div className="flex items-center">
                      IP Address
                      <ArrowsUpDownIcon className="ml-1 h-4 w-4" />
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Device Info
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('domain')}
                  >
                    <div className="flex items-center">
                      Domain/VLAN
                      <ArrowsUpDownIcon className="ml-1 h-4 w-4" />
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('status')}
                  >
                    <div className="flex items-center">
                      Status
                      <ArrowsUpDownIcon className="ml-1 h-4 w-4" />
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Health
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('lease.type')}
                  >
                    <div className="flex items-center">
                      Lease
                      <ArrowsUpDownIcon className="ml-1 h-4 w-4" />
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {processedData.map((item) => {
                  const StatusIcon = getStatusIcon(item.status);
                  return (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedRows.includes(item.id)}
                          onChange={(e) => handleSelectRow(item.id, e.target.checked)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-mono font-medium text-gray-900">{item.ipAddress}</div>
                        <div className="text-sm font-mono text-gray-500">{item.macAddress}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-8 w-8">
                            <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center">
                              <ComputerDesktopIcon className="h-4 w-4 text-blue-600" />
                            </div>
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">{item.deviceName}</div>
                            <div className="text-sm text-gray-500">{item.deviceType}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{item.domain}</div>
                        <div className="text-sm text-gray-500">{item.vlan}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={cn(
                          'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                          getStatusColor(item.status)
                        )}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {item.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className={cn(
                            'h-2 w-2 rounded-full mr-2',
                            item.health.ping ? 'bg-green-400' : 'bg-red-400'
                          )}></div>
                          <div className="text-sm text-gray-900">
                            {item.health.uptime.toFixed(1)}%
                          </div>
                        </div>
                        <div className="text-xs text-gray-500">
                          {item.health.ping ? `${item.health.response}ms` : 'No response'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 capitalize">{item.lease.type}</div>
                        {item.lease.expires && (
                          <div className="text-xs text-gray-500">
                            Expires: {new Date(item.lease.expires).toLocaleDateString()}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button className="text-blue-600 hover:text-blue-900">
                            <EyeIcon className="h-4 w-4" />
                          </button>
                          <button className="text-gray-600 hover:text-gray-900">
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          <button className="text-gray-600 hover:text-gray-900">
                            <Cog6ToothIcon className="h-4 w-4" />
                          </button>
                          <button className="text-red-600 hover:text-red-900">
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
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
  );
};

export { IPAllocationTable };