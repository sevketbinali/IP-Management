/**
 * Device Management Component
 * Comprehensive interface for managing IP assignments and devices
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowDownTrayIcon,
  ComputerDesktopIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  XCircleIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
} from '@heroicons/react/24/outline';
import { Layout } from './Layout';
import { useIpStore } from '@/stores/useIPStore';
import { useVlanStore } from '@/stores/useVLANStore';
import { useDomainStore } from '@/stores/useDomainStore';
import { cn, formatDateTime } from '@/utils';
import { DeviceFilters } from '@/types';

const DeviceManagement: React.FC = () => {
  const { 
    devices, 
    selectedDevice, 
    loading, 
    fetchDevices, 
    selectDevice, 
    setShowCreateModal,
    setShowEditModal,
    setShowDeleteModal 
  } = useIpStore();
  const { vlans, fetchVlans } = useVlanStore();
  const { domains, fetchDomains } = useDomainStore();

  const [filters, setFilters] = useState<DeviceFilters>({
    search: '',
    vlan: '',
    status: '',
    deviceType: '',
    domain: '',
  });

  const [showFilters, setShowFilters] = useState(false);
  const [selectedDevices, setSelectedDevices] = useState<string[]>([]);

  // Device types for filtering
  const deviceTypes = [
    'PLC', 'HMI', 'Robot Controller', 'Vision System', 'Sensor', 
    'Gateway', 'Switch', 'Server', 'Analyzer', 'Test Equipment', 'Unknown Device'
  ];

  // Status options
  const statusOptions = [
    { value: 'active', label: 'Active', color: 'green' },
    { value: 'inactive', label: 'Inactive', color: 'gray' },
    { value: 'reserved', label: 'Reserved', color: 'blue' },
    { value: 'conflict', label: 'Conflict', color: 'red' },
  ];

  // Fetch initial data
  useEffect(() => {
    const initializeData = async () => {
      await Promise.all([
        fetchDevices(),
        fetchVlans(),
        fetchDomains(),
      ]);
    };

    initializeData();
  }, [fetchDevices, fetchVlans, fetchDomains]);

  // Filter devices based on current filters
  const filteredDevices = (devices || []).filter(device => {
    const vlan = vlans.find(v => v.id === device.vlanId);
    const domain = domains.find(d => d.id === vlan?.domainId);

    const matchesSearch = !filters.search || 
      device.ciName.toLowerCase().includes(filters.search.toLowerCase()) ||
      device.ipAddress.includes(filters.search) ||
      device.macAddress.toLowerCase().includes(filters.search.toLowerCase()) ||
      device.description.toLowerCase().includes(filters.search.toLowerCase());

    const matchesVlan = !filters.vlan || device.vlanId === filters.vlan;
    const matchesStatus = !filters.status || device.status === filters.status;
    const matchesDeviceType = !filters.deviceType || device.deviceType === filters.deviceType;
    const matchesDomain = !filters.domain || domain?.id === filters.domain;

    return matchesSearch && matchesVlan && matchesStatus && matchesDeviceType && matchesDomain;
  });

  // Handle filter changes
  const handleFilterChange = (key: keyof DeviceFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      search: '',
      vlan: '',
      status: '',
      deviceType: '',
      domain: '',
    });
  };

  // Export devices data
  const handleExport = () => {
    const csvData = filteredDevices.map(device => {
      const vlan = vlans.find(v => v.id === device.vlanId);
      const domain = domains.find(d => d.id === vlan?.domainId);
      
      return {
        'CI Name': device.ciName,
        'IP Address': device.ipAddress,
        'MAC Address': device.macAddress,
        'Device Type': device.deviceType,
        'Status': device.status,
        'VLAN': vlan ? `${vlan.vlanId} - ${vlan.name}` : 'Unknown',
        'Domain': domain?.name || 'Unknown',
        'Description': device.description,
        'Last Seen': formatDateTime(device.lastSeen),
      };
    });
    
    const csv = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).map(val => `"${val}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `devices-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return CheckCircleIcon;
      case 'inactive': return ClockIcon;
      case 'reserved': return ExclamationTriangleIcon;
      case 'conflict': return XCircleIcon;
      default: return ClockIcon;
    }
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'inactive': return 'text-gray-600 bg-gray-100';
      case 'reserved': return 'text-blue-600 bg-blue-100';
      case 'conflict': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Cihaz Yönetimi</h1>
            <p className="mt-2 text-gray-600">
              IT/OT cihazları için IP adresi ataması ve yönetimi
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleExport}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
              Dışa Aktar
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Yeni Cihaz
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white shadow rounded-lg">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex-1 max-w-lg">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Cihaz ara (CI Name, IP, MAC...)"
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={cn(
                    'inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500',
                    showFilters ? 'bg-blue-50 text-blue-700 border-blue-300' : 'bg-white text-gray-700 hover:bg-gray-50'
                  )}
                >
                  <FunnelIcon className="h-4 w-4 mr-2" />
                  Filtreler
                </button>
                {(filters.domain || filters.vlan || filters.status || filters.deviceType) && (
                  <button
                    onClick={clearFilters}
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    Filtreleri Temizle
                  </button>
                )}
              </div>
            </div>

            {/* Advanced Filters */}
            {showFilters && (
              <div className="border-t pt-4">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Domain
                    </label>
                    <select
                      value={filters.domain}
                      onChange={(e) => handleFilterChange('domain', e.target.value)}
                      className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Tüm Domainler</option>
                      {(domains || []).map(domain => (
                        <option key={domain.id} value={domain.id}>
                          {domain.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      VLAN
                    </label>
                    <select
                      value={filters.vlan}
                      onChange={(e) => handleFilterChange('vlan', e.target.value)}
                      className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Tüm VLAN'lar</option>
                      {(vlans || []).map(vlan => (
                        <option key={vlan.id} value={vlan.id}>
                          VLAN {vlan.vlanId} - {vlan.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cihaz Tipi
                    </label>
                    <select
                      value={filters.deviceType}
                      onChange={(e) => handleFilterChange('deviceType', e.target.value)}
                      className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Tüm Tipler</option>
                      {deviceTypes.map(type => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Durum
                    </label>
                    <select
                      value={filters.status}
                      onChange={(e) => handleFilterChange('status', e.target.value)}
                      className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Tüm Durumlar</option>
                      {statusOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Device Table */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">
                Cihaz Listesi ({filteredDevices.length})
              </h3>
              {selectedDevices.length > 0 && (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">
                    {selectedDevices.length} seçili
                  </span>
                  <button
                    onClick={() => console.log('Bulk delete:', selectedDevices)}
                    className="text-sm text-red-600 hover:text-red-900"
                  >
                    Seçilenleri Sil
                  </button>
                </div>
              )}
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Cihazlar yükleniyor...</span>
            </div>
          ) : filteredDevices.length === 0 ? (
            <div className="text-center py-12">
              <ComputerDesktopIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Cihaz bulunamadı</h3>
              <p className="mt-1 text-sm text-gray-500">
                Filtreleri değiştirin veya yeni bir cihaz ekleyin.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <input
                        type="checkbox"
                        checked={selectedDevices.length === filteredDevices.length}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedDevices(filteredDevices.map(d => d.id));
                          } else {
                            setSelectedDevices([]);
                          }
                        }}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cihaz
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ağ Bilgileri
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      VLAN
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Durum
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Son Görülme
                    </th>
                    <th className="relative px-6 py-3">
                      <span className="sr-only">İşlemler</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredDevices.map((device) => {
                    const vlan = vlans.find(v => v.id === device.vlanId);
                    const StatusIcon = getStatusIcon(device.status);
                    
                    return (
                      <tr key={device.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={selectedDevices.includes(device.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedDevices([...selectedDevices, device.id]);
                              } else {
                                setSelectedDevices(selectedDevices.filter(id => id !== device.id));
                              }
                            }}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                                <ComputerDesktopIcon className="h-5 w-5 text-blue-600" />
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {device.ciName}
                              </div>
                              <div className="text-sm text-gray-500">
                                {device.deviceType}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            <div className="font-mono">{device.ipAddress}</div>
                            <div className="text-gray-500 font-mono text-xs">
                              {device.macAddress}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {vlan ? `VLAN ${vlan.vlanId}` : 'Unknown'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {vlan?.name || 'Unknown VLAN'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={cn(
                            'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                            getStatusColor(device.status)
                          )}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {device.status === 'active' ? 'Aktif' :
                             device.status === 'inactive' ? 'Pasif' :
                             device.status === 'reserved' ? 'Rezerve' : 'Çakışma'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDateTime(device.lastSeen)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => console.log('View device:', device.id)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              <EyeIcon className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => {
                                selectDevice(device);
                                setShowEditModal(true);
                              }}
                              className="text-gray-600 hover:text-gray-900"
                            >
                              <PencilIcon className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => {
                                selectDevice(device);
                                setShowDeleteModal(true);
                              }}
                              className="text-red-600 hover:text-red-900"
                            >
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

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ComputerDesktopIcon className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Toplam Cihaz</dt>
                    <dd className="text-lg font-medium text-gray-900">{devices.length}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CheckCircleIcon className="h-6 w-6 text-green-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Aktif Cihaz</dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {devices.filter(d => d.status === 'active').length}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ExclamationTriangleIcon className="h-6 w-6 text-blue-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Rezerve</dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {devices.filter(d => d.status === 'reserved').length}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <XCircleIcon className="h-6 w-6 text-red-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Çakışma</dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {devices.filter(d => d.status === 'conflict').length}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export { DeviceManagement };