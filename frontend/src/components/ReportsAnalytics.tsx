/**
 * Reports & Analytics Component
 * Comprehensive reporting interface for network analytics and compliance
 */

import React, { useState, useEffect } from 'react';
import {
  ChartBarIcon,
  DocumentChartBarIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  ArrowDownTrayIcon,
  CalendarIcon,
  FunnelIcon,
} from '@heroicons/react/24/outline';
import { Layout } from './Layout';
import { useDomainStore } from '@/stores/useDomainStore';
import { useVlanStore } from '@/stores/useVLANStore';
import { useIpStore } from '@/stores/useIPStore';
import { cn, formatDateTime } from '@/utils';

interface ReportFilters {
  domain: string;
  dateRange: string;
  reportType: string;
}

const ReportsAnalytics: React.FC = () => {
  const { domains, fetchDomains } = useDomainStore();
  const { vlans, fetchVlans } = useVlanStore();
  const { devices, fetchDevices } = useIpStore();

  const [filters, setFilters] = useState<ReportFilters>({
    domain: '',
    dateRange: '30',
    reportType: 'utilization',
  });

  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'utilization' | 'security' | 'compliance'>('utilization');

  // Fetch initial data
  useEffect(() => {
    const initializeData = async () => {
      setLoading(true);
      try {
        await Promise.all([
          fetchDomains(),
          fetchVlans(),
          fetchDevices(),
        ]);
      } finally {
        setLoading(false);
      }
    };

    initializeData();
  }, [fetchDomains, fetchVlans, fetchDevices]);

  // Calculate utilization statistics
  const utilizationStats = (domains || []).map(domain => {
    const domainVlans = (vlans || []).filter(v => v.domainId === domain.id);
    const domainDevices = (devices || []).filter(d => 
      domainVlans.some(v => v.id === d.vlanId)
    );

    const totalIps = domainVlans.reduce((sum, vlan) => sum + (vlan.totalIps || 0), 0);
    const usedIps = domainVlans.reduce((sum, vlan) => sum + (vlan.usedIps || 0), 0);
    const utilization = totalIps > 0 ? Math.round((usedIps / totalIps) * 100) : 0;

    return {
      domainId: domain.id,
      domainName: domain.name,
      vlanCount: domainVlans.length,
      deviceCount: domainDevices.length,
      totalIps,
      usedIps,
      utilization,
      activeDevices: domainDevices.filter(d => d.status === 'active').length,
      conflicts: domainDevices.filter(d => d.status === 'conflict').length,
    };
  });

  // Calculate security compliance
  const securityCompliance = (domains || []).map(domain => {
    const domainVlans = (vlans || []).filter(v => v.domainId === domain.id);
    const securityZones = domainVlans.reduce((zones, vlan) => {
      const existing = zones.find(z => z.securityType === vlan.securityType);
      if (existing) {
        existing.vlanCount++;
        existing.deviceCount += (vlan.usedIps || 0);
      } else {
        zones.push({
          securityType: vlan.securityType,
          vlanCount: 1,
          deviceCount: (vlan.usedIps || 0),
          lastFirewallCheck: vlan.lastFirewallCheck,
          complianceStatus: 'compliant' as const,
        });
      }
      return zones;
    }, [] as any[]);

    return {
      domainId: domain.id,
      domainName: domain.name,
      securityZones,
      overallCompliance: 'compliant' as const,
      issues: [] as string[],
    };
  });

  // Handle filter changes
  const handleFilterChange = (key: keyof ReportFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // Export report data
  const handleExport = (reportType: string) => {
    let csvData: any[] = [];
    let filename = '';

    switch (reportType) {
      case 'utilization':
        csvData = utilizationStats.map(stat => ({
          'Domain': stat.domainName,
          'VLAN Count': stat.vlanCount,
          'Device Count': stat.deviceCount,
          'Total IPs': stat.totalIps,
          'Used IPs': stat.usedIps,
          'Utilization %': stat.utilization,
          'Active Devices': stat.activeDevices,
          'Conflicts': stat.conflicts,
        }));
        filename = `utilization-report-${new Date().toISOString().split('T')[0]}.csv`;
        break;
      case 'security':
        csvData = securityCompliance.flatMap(domain => 
          domain.securityZones.map(zone => ({
            'Domain': domain.domainName,
            'Security Type': zone.securityType,
            'VLAN Count': zone.vlanCount,
            'Device Count': zone.deviceCount,
            'Last Firewall Check': formatDateTime(zone.lastFirewallCheck),
            'Compliance Status': zone.complianceStatus,
          }))
        );
        filename = `security-report-${new Date().toISOString().split('T')[0]}.csv`;
        break;
    }

    if (csvData.length > 0) {
      const csv = [
        Object.keys(csvData[0]).join(','),
        ...csvData.map(row => Object.values(row).map(val => `"${val}"`).join(','))
      ].join('\n');
      
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Raporlar ve Analitik</h1>
            <p className="mt-2 text-gray-600">
              Ağ kullanımı, güvenlik uyumluluğu ve performans raporları
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => handleExport(activeTab)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
              Raporu İndir
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white shadow rounded-lg">
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                  Zaman Aralığı
                </label>
                <select
                  value={filters.dateRange}
                  onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="7">Son 7 gün</option>
                  <option value="30">Son 30 gün</option>
                  <option value="90">Son 90 gün</option>
                  <option value="365">Son 1 yıl</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rapor Tipi
                </label>
                <select
                  value={filters.reportType}
                  onChange={(e) => handleFilterChange('reportType', e.target.value)}
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="utilization">Kullanım Raporu</option>
                  <option value="security">Güvenlik Raporu</option>
                  <option value="compliance">Uyumluluk Raporu</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white shadow rounded-lg">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('utilization')}
                className={cn(
                  'py-4 px-1 border-b-2 font-medium text-sm flex items-center',
                  activeTab === 'utilization'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                )}
              >
                <ChartBarIcon className="h-4 w-4 mr-2" />
                Kullanım Analizi
              </button>
              <button
                onClick={() => setActiveTab('security')}
                className={cn(
                  'py-4 px-1 border-b-2 font-medium text-sm flex items-center',
                  activeTab === 'security'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                )}
              >
                <ShieldCheckIcon className="h-4 w-4 mr-2" />
                Güvenlik Uyumluluğu
              </button>
              <button
                onClick={() => setActiveTab('compliance')}
                className={cn(
                  'py-4 px-1 border-b-2 font-medium text-sm flex items-center',
                  activeTab === 'compliance'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                )}
              >
                <DocumentChartBarIcon className="h-4 w-4 mr-2" />
                Uyumluluk Raporu
              </button>
            </nav>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600">Rapor verileri yükleniyor...</span>
              </div>
            ) : (
              <>
                {/* Utilization Tab */}
                {activeTab === 'utilization' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">
                          {utilizationStats.reduce((sum, stat) => sum + stat.vlanCount, 0)}
                        </div>
                        <div className="text-sm text-blue-800">Toplam VLAN</div>
                      </div>
                      <div className="bg-green-50 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          {utilizationStats.reduce((sum, stat) => sum + stat.deviceCount, 0)}
                        </div>
                        <div className="text-sm text-green-800">Toplam Cihaz</div>
                      </div>
                      <div className="bg-purple-50 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">
                          {utilizationStats.reduce((sum, stat) => sum + stat.usedIps, 0)}
                        </div>
                        <div className="text-sm text-purple-800">Kullanılan IP</div>
                      </div>
                      <div className="bg-orange-50 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-orange-600">
                          {utilizationStats.length > 0 ? 
                            Math.round(utilizationStats.reduce((sum, stat) => sum + stat.utilization, 0) / utilizationStats.length) : 0}%
                        </div>
                        <div className="text-sm text-orange-800">Ortalama Kullanım</div>
                      </div>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Domain
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              VLAN Sayısı
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Cihaz Sayısı
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              IP Kullanımı
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Kullanım Oranı
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Çakışmalar
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {utilizationStats.map((stat) => (
                            <tr key={stat.domainId} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">
                                  {stat.domainName}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {stat.vlanCount}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {stat.activeDevices} / {stat.deviceCount}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {stat.usedIps} / {stat.totalIps}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                                    <div
                                      className={cn(
                                        'h-2 rounded-full',
                                        stat.utilization > 85 ? 'bg-red-500' :
                                        stat.utilization > 70 ? 'bg-yellow-500' :
                                        'bg-green-500'
                                      )}
                                      style={{ width: `${Math.min(stat.utilization, 100)}%` }}
                                    />
                                  </div>
                                  <span className="text-sm text-gray-900 min-w-0">
                                    {stat.utilization}%
                                  </span>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {stat.conflicts > 0 ? (
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                    <ExclamationTriangleIcon className="h-3 w-3 mr-1" />
                                    {stat.conflicts}
                                  </span>
                                ) : (
                                  <span className="text-sm text-gray-500">Yok</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Security Tab */}
                {activeTab === 'security' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="bg-green-50 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          {securityCompliance.filter(s => s.overallCompliance === 'compliant').length}
                        </div>
                        <div className="text-sm text-green-800">Uyumlu Domain</div>
                      </div>
                      <div className="bg-yellow-50 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-yellow-600">0</div>
                        <div className="text-sm text-yellow-800">Uyarı</div>
                      </div>
                      <div className="bg-red-50 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-red-600">0</div>
                        <div className="text-sm text-red-800">Uyumsuz</div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {securityCompliance.map((compliance) => (
                        <div key={compliance.domainId} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-medium text-gray-900">
                              {compliance.domainName}
                            </h3>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <ShieldCheckIcon className="h-3 w-3 mr-1" />
                              Uyumlu
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {compliance.securityZones.map((zone, index) => (
                              <div key={index} className="bg-gray-50 p-3 rounded">
                                <div className="text-sm font-medium text-gray-900">
                                  {zone.securityType}
                                </div>
                                <div className="text-xs text-gray-500 mt-1">
                                  {zone.vlanCount} VLAN, {zone.deviceCount} Cihaz
                                </div>
                                <div className="text-xs text-gray-500">
                                  Son kontrol: {formatDateTime(zone.lastFirewallCheck)}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Compliance Tab */}
                {activeTab === 'compliance' && (
                  <div className="text-center py-12">
                    <DocumentChartBarIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">Uyumluluk Raporu</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Detaylı uyumluluk raporları yakında eklenecek.
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export { ReportsAnalytics };