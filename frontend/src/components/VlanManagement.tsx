/**
 * VLAN Management Interface
 * Comprehensive VLAN configuration and network segmentation management
 * Industrial-grade interface for IT/OT network segmentation
 */

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowDownTrayIcon,
  ServerIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  CpuChipIcon,
} from '@heroicons/react/24/outline';
import { Layout } from './Layout';
import { useVlanStore } from '@/stores/useVLANStore';
import { useDomainStore } from '@/stores/useDomainStore';
import { cn, formatDateTime, getSecurityLevelColor } from '@/utils';
import { Vlan } from '@/types';

interface VlanFilters {
  search: string;
  domain: string;
  securityType: string;
  status: string;
  utilizationRange: string;
}

const VlanManagement: React.FC = () => {
  const navigate = useNavigate();
  const { 
    vlans, 
    selectedVlan, 
    loading, 
    fetchVlansByDomain, 
    selectVlan, 
    deleteVlan,
    setShowCreateModal,
    setShowEditModal,
    setShowDeleteModal 
  } = useVlanStore();
  const { domains, fetchDomains } = useDomainStore();

  const [filters, setFilters] = useState<VlanFilters>({
    search: '',
    domain: '',
    securityType: '',
    status: '',
    utilizationRange: '',
  });

  const [showFilters, setShowFilters] = useState(false);
  const [selectedVlans, setSelectedVlans] = useState<string[]>([]);
  const [allVlans, setAllVlans] = useState<Vlan[]>([]);

  // Security types for filtering
  const securityTypes = [
    'SL3', 'MFZ_SL4', 'LOG_SL4', 'FMZ_SL4', 'ENG_SL4', 'LRSZ_SL4', 'RSZ_SL4'
  ];

  // Status options
  const statusOptions = [
    { value: 'active', label: 'Active', color: 'green' },
    { value: 'inactive', label: 'Inactive', color: 'gray' },
    { value: 'warning', label: 'Warning', color: 'yellow' },
    { value: 'error', label: 'Error', color: 'red' },
  ];

  // Utilization ranges
  const utilizationRanges = [
    { value: '0-25', label: '0-25%' },
    { value: '26-50', label: '26-50%' },
    { value: '51-75', label: '51-75%' },
    { value: '76-90', label: '76-90%' },
    { value: '91-100', label: '91-100%' },
  ];

  // Fetch initial data
  useEffect(() => {
    const initializeData = async () => {
      await fetchDomains();
      
      // Fetch VLANs for all domains
      const allVlanData: Vlan[] = [];
      for (const domain of domains) {
        await fetchVlansByDomain(domain.id);
        // In real implementation, this would accumulate VLANs from API
      }
      setAllVlans(vlans);
    };

    initializeData();
  }, [fetchDomains, fetchVlansByDomain, domains]);

  // Update all VLANs when vlans change
  useEffect(() => {
    setAllVlans(vlans);
  }, [vlans]);

  // Filter VLANs based on current filters
  const filteredVlans = (allVlans || []).filter(vlan => {
    const matchesSearch = !filters.search || 
      vlan.name.toLowerCase().includes(filters.search.toLowerCase()) ||
      vlan.vlanId.toString().includes(filters.search) ||
      vlan.subnet.includes(filters.search) ||
      vlan.zoneName.toLowerCase().includes(filters.search.toLowerCase()) ||
      vlan.zoneManager.toLowerCase().includes(filters.search.toLowerCase());

    const matchesDomain = !filters.domain || vlan.domainId === filters.domain;
    const matchesSecurityType = !filters.securityType || vlan.securityType === filters.securityType;
    const matchesStatus = !filters.status || vlan.status === filters.status;
    
    let matchesUtilization = true;
    if (filters.utilizationRange) {
      const [min, max] = filters.utilizationRange.split('-').map(Number);
      matchesUtilization = vlan.utilization >= min && vlan.utilization <= max;
    }

    return matchesSearch && matchesDomain && matchesSecurityType && matchesStatus && matchesUtilization;
  });

  // Handle bulk actions
  const handleBulkAction = (action: string) => {
    console.log(`Bulk action: ${action} on VLANs:`, selectedVlans);
    // Implementation for bulk actions
  };

  // Handle filter changes
  const handleFilterChange = (key: keyof VlanFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      search: '',
      domain: '',
      securityType: '',
      status: '',
      utilizationRange: '',
    });
  };

  // Export VLANs data
  const handleExport = () => {
    const csvData = filteredVlans.map(vlan => ({
      'VLAN ID': vlan.vlanId,
      'Name': vlan.name,
      'Subnet': vlan.subnet,
      'Gateway': vlan.gateway,
      'Zone': vlan.zoneName,
      'Security Type': vlan.securityType,
      'Utilization': `${vlan.utilization}%`,
      'Status': vlan.status,
      'Zone Manager': vlan.zoneManager,
    }));
    
    const csv = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vlans-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">VLAN Yönetimi</h1>
            <p className="mt-2 text-gray-600">
              Ağ segmentasyonu ve VLAN konfigürasyonu yönetimi
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
              Yeni VLAN
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
                    placeholder="VLAN ara (ID, subnet, zone...)"
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
                {(filters.domain || filters.securityType || filters.status || filters.utilizationRange) && (
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
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                      Güvenlik Tipi
                    </label>
                    <select
                      value={filters.securityType}
                      onChange={(e) => handleFilterChange('securityType', e.target.value)}
                      className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Tüm Güvenlik Tipleri</option>
                      {securityTypes.map(type => (
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
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Kullanım Oranı
                    </label>
                    <select
                      value={filters.utilizationRange}
                      onChange={(e) => handleFilterChange('utilizationRange', e.target.value)}
                      className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Tüm Oranlar</option>
                      {utilizationRanges.map(range => (
                        <option key={range.value} value={range.value}>
                          {range.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* VLAN Table */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">
                VLAN Listesi ({filteredVlans.length})
              </h3>
              {selectedVlans.length > 0 && (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">
                    {selectedVlans.length} seçili
                  </span>
                  <button
                    onClick={() => handleBulkAction('delete')}
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
              <span className="ml-3 text-gray-600">VLAN'lar yükleniyor...</span>
            </div>
          ) : filteredVlans.length === 0 ? (
            <div className="text-center py-12">
              <ServerIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">VLAN bulunamadı</h3>
              <p className="mt-1 text-sm text-gray-500">
                Filtreleri değiştirin veya yeni bir VLAN oluşturun.
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
                        checked={selectedVlans.length === filteredVlans.length}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedVlans(filteredVlans.map(v => v.id));
                          } else {
                            setSelectedVlans([]);
                          }
                        }}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      VLAN
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ağ Bilgileri
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Zone
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Güvenlik
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Kullanım
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Durum
                    </th>
                    <th className="relative px-6 py-3">
                      <span className="sr-only">İşlemler</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredVlans.map((vlan) => (
                    <tr key={vlan.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedVlans.includes(vlan.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedVlans([...selectedVlans, vlan.id]);
                            } else {
                              setSelectedVlans(selectedVlans.filter(id => id !== vlan.id));
                            }
                          }}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                              <CpuChipIcon className="h-5 w-5 text-blue-600" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              VLAN {vlan.vlanId}
                            </div>
                            <div className="text-sm text-gray-500">
                              {vlan.name}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          <div>{vlan.subnet}/{vlan.subnetMask.split('.').filter(x => x === '255').length * 8}</div>
                          <div className="text-gray-500">Gateway: {vlan.gateway}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{vlan.zoneName}</div>
                        <div className="text-sm text-gray-500">{vlan.zoneManager}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={cn(
                          'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                          getSecurityLevelColor(vlan.securityType)
                        )}>
                          <ShieldCheckIcon className="h-3 w-3 mr-1" />
                          {vlan.securityType}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                            <div
                              className={cn(
                                'h-2 rounded-full',
                                vlan.utilization > 85 ? 'bg-red-500' :
                                vlan.utilization > 70 ? 'bg-yellow-500' :
                                'bg-green-500'
                              )}
                              style={{ width: `${Math.min(vlan.utilization, 100)}%` }}
                            />
                          </div>
                          <span className="text-sm text-gray-900 min-w-0">
                            {vlan.utilization}%
                          </span>
                        </div>
                        <div className="text-xs text-gray-500">
                          {vlan.usedIps}/{vlan.totalIps} IP
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={cn(
                          'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                          vlan.status === 'active' ? 'bg-green-100 text-green-800' :
                          vlan.status === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                          vlan.status === 'error' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        )}>
                          {vlan.status === 'active' && <CheckCircleIcon className="h-3 w-3 mr-1" />}
                          {vlan.status === 'warning' && <ExclamationTriangleIcon className="h-3 w-3 mr-1" />}
                          {vlan.status === 'error' && <ExclamationTriangleIcon className="h-3 w-3 mr-1" />}
                          {vlan.status === 'inactive' && <ClockIcon className="h-3 w-3 mr-1" />}
                          {vlan.status === 'active' ? 'Aktif' :
                           vlan.status === 'warning' ? 'Uyarı' :
                           vlan.status === 'error' ? 'Hata' : 'Pasif'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => navigate(`/vlans/${vlan.id}`)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <EyeIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => {
                              selectVlan(vlan);
                              setShowEditModal(true);
                            }}
                            className="text-gray-600 hover:text-gray-900"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => {
                              selectVlan(vlan);
                              setShowDeleteModal(true);
                            }}
                            className="text-red-600 hover:text-red-900"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
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
                  <ServerIcon className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Toplam VLAN</dt>
                    <dd className="text-lg font-medium text-gray-900">{(allVlans || []).length}</dd>
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
                    <dt className="text-sm font-medium text-gray-500 truncate">Aktif VLAN</dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {(allVlans || []).filter(v => v.status === 'active').length}
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
                  <ExclamationTriangleIcon className="h-6 w-6 text-yellow-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Uyarı</dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {(allVlans || []).filter(v => v.status === 'warning').length}
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
                  <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-xs font-medium text-blue-800">%</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Ort. Kullanım</dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {(allVlans || []).length > 0 ? Math.round((allVlans || []).reduce((sum, v) => sum + v.utilization, 0) / (allVlans || []).length) : 0}%
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

export { VlanManagement };