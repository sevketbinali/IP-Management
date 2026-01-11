/**
 * Domain VLAN View Component
 * Detailed view of a specific domain with its VLANs and devices
 */

import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeftIcon,
  ServerIcon,
  ComputerDesktopIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import { Layout } from './Layout';
import { useDomainStore } from '@/stores/useDomainStore';
import { useVlanStore } from '@/stores/useVLANStore';
import { useIpStore } from '@/stores/useIPStore';
import { cn, formatDateTime, getSecurityLevelColor } from '@/utils';

const DomainVlanView: React.FC = () => {
  const { domainId } = useParams<{ domainId: string }>();
  const { selectedDomain, fetchDomain, loading: domainLoading } = useDomainStore();
  const { vlans, fetchVlansByDomain, loading: vlansLoading } = useVlanStore();
  const { devices, fetchDevices } = useIpStore();

  const [activeTab, setActiveTab] = useState<'vlans' | 'devices' | 'analytics'>('vlans');

  // Fetch domain and related data
  useEffect(() => {
    if (domainId) {
      fetchDomain(domainId);
      fetchVlansByDomain(domainId);
      fetchDevices();
    }
  }, [domainId, fetchDomain, fetchVlansByDomain, fetchDevices]);

  // Filter devices for this domain
  const domainDevices = (devices || []).filter(device => 
    (vlans || []).some(vlan => vlan.id === device.vlanId)
  );

  // Calculate domain statistics
  const domainStats = {
    totalVlans: (vlans || []).length,
    activeVlans: (vlans || []).filter(v => v.status === 'active').length,
    totalDevices: domainDevices.length,
    activeDevices: domainDevices.filter(d => d.status === 'active').length,
    totalIps: (vlans || []).reduce((sum, vlan) => sum + vlan.totalIps, 0),
    usedIps: (vlans || []).reduce((sum, vlan) => sum + vlan.usedIps, 0),
    utilization: (vlans || []).length > 0 ? 
      Math.round((vlans || []).reduce((sum, vlan) => sum + vlan.utilization, 0) / (vlans || []).length) : 0,
  };

  const loading = domainLoading || vlansLoading;

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Domain bilgileri yükleniyor...</span>
        </div>
      </Layout>
    );
  }

  if (!selectedDomain) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900">Domain bulunamadı</h3>
          <p className="mt-2 text-gray-500">Belirtilen domain mevcut değil.</p>
          <Link
            to="/domains"
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Domain Listesine Dön
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link
              to="/domains"
              className="inline-flex items-center text-gray-500 hover:text-gray-700"
            >
              <ArrowLeftIcon className="h-5 w-5 mr-1" />
              Domainler
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{selectedDomain.name}</h1>
              <p className="mt-2 text-gray-600">{selectedDomain.description}</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ServerIcon className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">VLAN Sayısı</dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {domainStats.activeVlans} / {domainStats.totalVlans}
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
                  <ComputerDesktopIcon className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Cihaz Sayısı</dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {domainStats.activeDevices} / {domainStats.totalDevices}
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
                  <div className={cn(
                    'h-6 w-6 rounded-full flex items-center justify-center text-xs font-medium',
                    domainStats.utilization > 85 ? 'bg-red-100 text-red-800' :
                    domainStats.utilization > 70 ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  )}>
                    %
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">IP Kullanımı</dt>
                    <dd className="text-lg font-medium text-gray-900">{domainStats.utilization}%</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ChartBarIcon className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Toplam IP</dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {domainStats.usedIps} / {domainStats.totalIps}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white shadow rounded-lg">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('vlans')}
                className={cn(
                  'py-4 px-1 border-b-2 font-medium text-sm',
                  activeTab === 'vlans'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                )}
              >
                VLAN'lar ({vlans.length})
              </button>
              <button
                onClick={() => setActiveTab('devices')}
                className={cn(
                  'py-4 px-1 border-b-2 font-medium text-sm',
                  activeTab === 'devices'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                )}
              >
                Cihazlar ({domainDevices.length})
              </button>
              <button
                onClick={() => setActiveTab('analytics')}
                className={cn(
                  'py-4 px-1 border-b-2 font-medium text-sm',
                  activeTab === 'analytics'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                )}
              >
                Analitik
              </button>
            </nav>
          </div>

          <div className="p-6">
            {/* VLANs Tab */}
            {activeTab === 'vlans' && (
              <div className="space-y-4">
                {(vlans || []).length === 0 ? (
                  <div className="text-center py-8">
                    <ServerIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">VLAN bulunamadı</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Bu domain için henüz VLAN oluşturulmamış.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {(vlans || []).map((vlan) => (
                      <div key={vlan.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center">
                            <div className="h-8 w-8 rounded bg-blue-100 flex items-center justify-center">
                              <span className="text-xs font-medium text-blue-600">
                                {vlan.vlanId}
                              </span>
                            </div>
                            <div className="ml-3">
                              <h4 className="text-sm font-medium text-gray-900">
                                VLAN {vlan.vlanId}
                              </h4>
                              <p className="text-xs text-gray-500">{vlan.name}</p>
                            </div>
                          </div>
                          <span className={cn(
                            'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
                            vlan.status === 'active' ? 'bg-green-100 text-green-800' :
                            vlan.status === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                            vlan.status === 'error' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          )}>
                            {vlan.status === 'active' && <CheckCircleIcon className="h-3 w-3 mr-1" />}
                            {vlan.status === 'warning' && <ExclamationTriangleIcon className="h-3 w-3 mr-1" />}
                            {vlan.status === 'error' && <ExclamationTriangleIcon className="h-3 w-3 mr-1" />}
                            {vlan.status === 'active' ? 'Aktif' :
                             vlan.status === 'warning' ? 'Uyarı' :
                             vlan.status === 'error' ? 'Hata' : 'Pasif'}
                          </span>
                        </div>
                        
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-500">Subnet:</span>
                            <span className="font-mono">{vlan.subnet}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Gateway:</span>
                            <span className="font-mono">{vlan.gateway}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Zone:</span>
                            <span>{vlan.zoneName}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Güvenlik:</span>
                            <span className={cn(
                              'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium',
                              getSecurityLevelColor(vlan.securityType)
                            )}>
                              {vlan.securityType}
                            </span>
                          </div>
                        </div>

                        <div className="mt-3">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500">IP Kullanımı:</span>
                            <span className="font-medium">{vlan.utilization}%</span>
                          </div>
                          <div className="mt-1 bg-gray-200 rounded-full h-2">
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
                          <div className="mt-1 text-xs text-gray-500">
                            {vlan.usedIps} / {vlan.totalIps} IP kullanılıyor
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Devices Tab */}
            {activeTab === 'devices' && (
              <div className="space-y-4">
                {domainDevices.length === 0 ? (
                  <div className="text-center py-8">
                    <ComputerDesktopIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">Cihaz bulunamadı</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Bu domain için henüz cihaz kaydedilmemiş.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Cihaz
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            IP Adresi
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
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {domainDevices.slice(0, 10).map((device) => {
                          const vlan = (vlans || []).find(v => v.id === device.vlanId);
                          return (
                            <tr key={device.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="h-8 w-8 rounded bg-blue-100 flex items-center justify-center">
                                    <ComputerDesktopIcon className="h-4 w-4 text-blue-600" />
                                  </div>
                                  <div className="ml-3">
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
                                <div className="text-sm font-mono text-gray-900">
                                  {device.ipAddress}
                                </div>
                                <div className="text-xs font-mono text-gray-500">
                                  {device.macAddress}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {vlan ? `VLAN ${vlan.vlanId}` : 'Unknown'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={cn(
                                  'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                                  device.status === 'active' ? 'bg-green-100 text-green-800' :
                                  device.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
                                  device.status === 'reserved' ? 'bg-blue-100 text-blue-800' :
                                  'bg-red-100 text-red-800'
                                )}>
                                  {device.status === 'active' ? 'Aktif' :
                                   device.status === 'inactive' ? 'Pasif' :
                                   device.status === 'reserved' ? 'Rezerve' : 'Çakışma'}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {formatDateTime(device.lastSeen)}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                    {domainDevices.length > 10 && (
                      <div className="mt-4 text-center">
                        <Link
                          to="/ip-management/devices"
                          className="text-blue-600 hover:text-blue-500 text-sm font-medium"
                        >
                          Tüm cihazları görüntüle ({domainDevices.length})
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Analytics Tab */}
            {activeTab === 'analytics' && (
              <div className="space-y-6">
                <div className="text-center py-8">
                  <ChartBarIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">Analitik Raporu</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Detaylı analitik raporları yakında eklenecek.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export { DomainVlanView };